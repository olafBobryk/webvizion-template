#!/usr/bin/env node

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PORT_START = 6006;
const PORT_END = 6099;
const READY_TIMEOUT_MS = 45_000;
const RETRY_MS = 250;
const require = createRequire(import.meta.url);

function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isProcessAlive(pid) {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

async function readJson(filePath) {
	try {
		return JSON.parse(await fs.readFile(filePath, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
}

async function writeJsonAtomically(filePath, value) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	const tempPath = `${filePath}.${process.pid}.tmp`;
	await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`);
	await fs.rename(tempPath, filePath);
}

async function removeFileIfPresent(filePath) {
	try {
		await fs.unlink(filePath);
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
}

async function isUrlHealthy(url) {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
		return response.status < 500;
	} catch {
		return false;
	}
}

async function isStorybookIndexHealthy(localUrl) {
	try {
		const response = await fetch(`${localUrl}/index.json`, {
			headers: { accept: "application/json" },
			signal: AbortSignal.timeout(2_000),
		});
		if (!response.ok) return false;
		const index = await response.json();
		return Boolean(
			index &&
				typeof index === "object" &&
				index.entries &&
				typeof index.entries === "object",
		);
	} catch {
		return false;
	}
}

function canListen(port) {
	return new Promise((resolve) => {
		const server = net.createServer();
		server.once("error", () => resolve(false));
		server.once("listening", () => {
			server.close(() => resolve(true));
		});
		server.listen({ port });
	});
}

async function findOpenPort() {
	for (let port = PORT_START; port <= PORT_END; port += 1) {
		if (await canListen(port)) return port;
	}
	throw new Error(
		`No Storybook preview port is available in ${PORT_START}-${PORT_END}.`,
	);
}

async function resolveRoot(root = process.cwd()) {
	return fs.realpath(root);
}

async function validateNextPreview({ root, previewPath }) {
	const preview = await readJson(previewPath);
	if (!preview) {
		throw new Error(
			"No isolated Next preview is registered for this checkout. Start it first with npm run dev.",
		);
	}
	if (preview.root !== root) {
		throw new Error(
			`Next preview metadata belongs to another checkout: ${preview.root}. Start npm run dev from ${root}.`,
		);
	}
	if (!isProcessAlive(preview.pid) || !(await isUrlHealthy(preview.localUrl))) {
		throw new Error(
			"The registered Next preview is not healthy. Restart it with npm run dev before starting Storybook.",
		);
	}
	return preview;
}

async function validateStorybookState({ root, state }) {
	if (!state || state.root !== root) return false;
	if (!isProcessAlive(state.pid)) return false;
	return (await isUrlHealthy(state.localUrl)) && isStorybookIndexHealthy(state.localUrl);
}

async function getProcessCwd(pid) {
	try {
		const result = await new Promise((resolve, reject) => {
			const child = spawn(
				"lsof",
				["-a", "-p", String(pid), "-d", "cwd", "-Fn"],
				{
					stdio: ["ignore", "pipe", "ignore"],
				},
			);
			let stdout = "";
			child.stdout.on("data", (chunk) => {
				stdout += chunk;
			});
			child.on("error", reject);
			child.on("exit", (code) => resolve(code === 0 ? stdout : ""));
		});
		return (
			result
				.split("\n")
				.find((line) => line.startsWith("n"))
				?.slice(1) ?? null
		);
	} catch {
		return null;
	}
}

async function discoverUnmanagedStorybooks(root) {
	const output = await new Promise((resolve, reject) => {
		const child = spawn("ps", ["-axo", "pid=,command="], {
			stdio: ["ignore", "pipe", "ignore"],
		});
		let stdout = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.on("error", reject);
		child.on("exit", (code) => resolve(code === 0 ? stdout : ""));
	});
	const candidates = output
		.split("\n")
		.map((line) => line.trim())
		.filter((line) =>
			/\bstorybook\s+dev\b|storybook[/\\]dist[/\\]bin[/\\]dispatcher\.js\s+dev\b/.test(
				line,
			),
		)
		.map((line) => {
			const [pidText, ...command] = line.split(/\s+/);
			const portMatch = line.match(/(?:--port|-p)\s+(\d+)/);
			return {
				command: command.join(" "),
				pid: Number(pidText),
				port: Number(portMatch?.[1]),
			};
		})
		.filter(
			(candidate) =>
				Number.isInteger(candidate.pid) && Number.isInteger(candidate.port),
		);
	const owned = [];
	for (const candidate of candidates) {
		const cwd = await getProcessCwd(candidate.pid);
		if (cwd === root) owned.push(candidate);
	}
	return owned;
}

async function waitForStorybook(state) {
	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (await validateStorybookState({ root: state.root, state })) return;
		if (!isProcessAlive(state.pid)) break;
		await wait(RETRY_MS);
	}
	throw new Error(
		`Storybook did not become ready at ${state.localUrl}. Check ${state.logPath}.`,
	);
}

async function waitForProcessExit(pid) {
	const deadline = Date.now() + 5_000;
	while (Date.now() < deadline) {
		if (!isProcessAlive(pid)) return;
		await wait(100);
	}
	throw new Error(
		`Managed Storybook process ${pid} did not stop after SIGINT.`,
	);
}

async function acquireLock(lockPath, root) {
	await fs.mkdir(path.dirname(lockPath), { recursive: true });
	try {
		const handle = await fs.open(lockPath, "wx");
		await handle.writeFile(
			`${JSON.stringify({ pid: process.pid, root, startedAt: new Date().toISOString() })}\n`,
		);
		return handle;
	} catch (error) {
		if (error?.code !== "EEXIST") throw error;
		const lock = await readJson(lockPath);
		if (!isProcessAlive(lock?.pid)) {
			await removeFileIfPresent(lockPath);
			return acquireLock(lockPath, root);
		}
		throw new Error(
			`Another Storybook preview startup is already running for this checkout (pid ${lock.pid}).`,
		);
	}
}

async function releaseLock(handle, lockPath) {
	await handle.close();
	await removeFileIfPresent(lockPath);
}

function getStorybookDispatcher(root) {
	const packagePath = path.join(
		root,
		"node_modules",
		"storybook",
		"package.json",
	);
	const packageJson = require(packagePath);
	const relativeBin =
		typeof packageJson.bin === "string"
			? packageJson.bin
			: packageJson.bin.storybook;
	return path.resolve(path.dirname(packagePath), relativeBin);
}

function printState(label, state) {
	console.log(`status: ${label}`);
	console.log(`checkout: ${state.root}`);
	console.log(`Next preview: ${state.preview.localUrl}`);
	console.log(`Next automation: ${state.preview.automationUrl}`);
	console.log(`Storybook: ${state.localUrl}`);
	console.log(`Storybook pid: ${state.pid}`);
	console.log(`ownership: ${state.ownership}`);
}

export async function inspectStorybookPreview({
	root: requestedRoot = process.cwd(),
} = {}) {
	const root = await resolveRoot(requestedRoot);
	const codexDir = path.join(root, ".codex");
	const previewPath = path.join(codexDir, "preview.json");
	const statePath = path.join(codexDir, "storybook-preview.json");
	const preview = await validateNextPreview({ previewPath, root });
	const state = await readJson(statePath);
	if (state && state.root !== root) {
		throw new Error(
			`Storybook metadata belongs to another checkout: ${state.root}. Refusing to reuse or overwrite it.`,
		);
	}
	if (state && !(await validateStorybookState({ root, state }))) {
		if (state.root === root && !isProcessAlive(state.pid))
			await removeFileIfPresent(statePath);
		return { preview, root, state: null, status: "stale" };
	}
	return { preview, root, state, status: state ? "running" : "not-started" };
}

export async function ensureStorybookPreview({
	root: requestedRoot = process.cwd(),
} = {}) {
	const root = await resolveRoot(requestedRoot);
	const codexDir = path.join(root, ".codex");
	const lockPath = path.join(codexDir, "storybook-preview.lock");
	const statePath = path.join(codexDir, "storybook-preview.json");
	const lock = await acquireLock(lockPath, root);
	try {
		const inspected = await inspectStorybookPreview({ root });
		const discovered = await discoverUnmanagedStorybooks(root);
		if (inspected.state) {
			const extraInstances = discovered.filter(
				(candidate) => candidate.pid !== inspected.state.pid,
			);
			if (extraInstances.length > 0) {
				throw new Error(
					`Additional Storybook instances belong to this checkout: ${extraInstances.map(({ pid, port }) => `${pid}:${port}`).join(", ")}. Refusing to use more than one persistent Storybook process.`,
				);
			}
			return { ...inspected.state, reused: true };
		}
		if (discovered.length > 1) {
			throw new Error(
				`Multiple unmanaged Storybook instances belong to this checkout: ${discovered.map(({ pid, port }) => `${pid}:${port}`).join(", ")}. Stop all but one before running npm run storybook:preview.`,
			);
		}
		if (discovered.length === 1) {
			const [{ pid, port }] = discovered;
			const adopted = {
				schemaVersion: 1,
				root,
				preview: inspected.preview,
				pid,
				port,
				localUrl: `http://localhost:${port}`,
				ownership: "adopted",
				startedAt: new Date().toISOString(),
				logPath: null,
			};
			if (!(await validateStorybookState({ root, state: adopted }))) {
				throw new Error(
					`The unmanaged Storybook process ${pid} is not healthy on port ${port}.`,
				);
			}
			await writeJsonAtomically(statePath, adopted);
			return { ...adopted, reused: true };
		}
		const port = await findOpenPort();
		const localUrl = `http://localhost:${port}`;
		const logPath = path.join(codexDir, "storybook-preview.log");
		await fs.mkdir(codexDir, { recursive: true });
		const log = await fs.open(logPath, "a");
		const child = spawn(
			process.execPath,
			[
				getStorybookDispatcher(root),
				"dev",
				"--ci",
				"--no-open",
				"--exact-port",
				"--port",
				String(port),
			],
			{ cwd: root, detached: true, stdio: ["ignore", log.fd, log.fd] },
		);
		child.unref();
		await log.close();
		const state = {
			schemaVersion: 1,
			root,
			preview: inspected.preview,
			pid: child.pid,
			port,
			localUrl,
			ownership: "managed",
			startedAt: new Date().toISOString(),
			logPath,
		};
		try {
			await waitForStorybook(state);
			await writeJsonAtomically(statePath, state);
			return { ...state, reused: false };
		} catch (error) {
			if (isProcessAlive(child.pid)) process.kill(child.pid, "SIGINT");
			throw error;
		}
	} finally {
		await releaseLock(lock, lockPath);
	}
}

export async function stopManagedStorybookPreview({
	root: requestedRoot = process.cwd(),
} = {}) {
	const root = await resolveRoot(requestedRoot);
	const statePath = path.join(root, ".codex", "storybook-preview.json");
	const state = await readJson(statePath);
	if (!state || state.root !== root)
		throw new Error("No Storybook preview metadata belongs to this checkout.");
	if (state.ownership !== "managed") {
		throw new Error(
			`Storybook pid ${state.pid} was adopted, not launched by this command; leave it to its original owner.`,
		);
	}
	if (isProcessAlive(state.pid)) {
		process.kill(state.pid, "SIGINT");
		await waitForProcessExit(state.pid);
	}
	await removeFileIfPresent(statePath);
	return state;
}

async function main() {
	const command = process.argv[2] ?? "ensure";
	if (command === "ensure") {
		const state = await ensureStorybookPreview();
		printState(state.reused ? "reused" : "started", state);
		return;
	}
	if (command === "status") {
		const result = await inspectStorybookPreview();
		if (!result.state) {
			console.log(`status: ${result.status}`);
			console.log(`checkout: ${result.root}`);
			console.log(`Next preview: ${result.preview.localUrl}`);
			return;
		}
		printState(result.status, result.state);
		return;
	}
	if (command === "stop") {
		const state = await stopManagedStorybookPreview();
		console.log(`Stopped managed Storybook preview pid ${state.pid}.`);
		return;
	}
	throw new Error(`Unknown command ${command}. Use ensure, status, or stop.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
