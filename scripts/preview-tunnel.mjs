#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { open, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CODEX_DIR = path.join(process.cwd(), ".codex");
const PREVIEW_STATE_PATH = path.join(CODEX_DIR, "preview.json");
const TUNNEL_LOG_PATH = path.join(CODEX_DIR, "preview-tunnel.log");
const TUNNEL_STATE_PATH = path.join(CODEX_DIR, "preview-tunnel.json");
const CLOUDFLARED_VERSION = "2026.7.2";
const TUNNEL_PACKAGE = "cloudflared@0.7.3";
const TUNNEL_TIMEOUT_MS = 45_000;

const HELP = `Usage: npm run preview:tunnel -- <ensure|status|stop>

Create and manage the repository-owned Cloudflare Quick Tunnel for the active
isolated preview. The tunnel is public and ephemeral; do not use it for routes
with private or personalized data.
`;

const command = process.argv[2] ?? "ensure";

if (!["ensure", "status", "stop", "--help", "-h"].includes(command)) {
	throw new Error(`Unknown command: ${command}\n\n${HELP}`);
}

const wait = (milliseconds) =>
	new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});

const readJson = async (filePath, label) => {
	try {
		return JSON.parse(await readFile(filePath, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw new Error(`Could not read ${label}: ${error.message}`);
	}
};

const isRunning = (pid) => {
	if (!Number.isInteger(pid) || pid <= 0) return false;

	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		if (error?.code === "ESRCH") return false;
		throw error;
	}
};

const getUpstream = async () => {
	const preview = await readJson(PREVIEW_STATE_PATH, "preview state");
	if (!preview?.localUrl) {
		throw new Error(
			"No active repository preview was found. Start it with npm run dev before opening a tunnel.",
		);
	}
	if (preview.root && path.resolve(preview.root) !== process.cwd()) {
		throw new Error(
			`Preview state belongs to another checkout: ${preview.root}`,
		);
	}

	const url = new URL(preview.localUrl);
	if (url.protocol !== "http:") {
		throw new Error("The repository preview must expose an HTTP loopback URL.");
	}
	if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
		throw new Error(
			"The repository preview must be bound to loopback before tunneling.",
		);
	}

	url.hostname = "127.0.0.1";
	return url.origin;
};

const printTunnel = (state) => {
	console.log(`Tunnel URL: ${state.url}`);
	console.log(`Tunnel state: ${TUNNEL_STATE_PATH}`);
	console.log("Public, ephemeral, and without an uptime guarantee.");
};

const removeState = async () => {
	await rm(TUNNEL_STATE_PATH, { force: true });
};

const existingTunnel = async (upstream) => {
	const state = await readJson(TUNNEL_STATE_PATH, "tunnel state");
	if (!state) return null;

	if (state.upstream !== upstream || !isRunning(state.pid)) {
		await removeState();
		return null;
	}

	return state;
};

const startTunnel = async (upstream) => {
	const log = await open(TUNNEL_LOG_PATH, "w");
	const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
	const child = spawn(
		npmCommand,
		[
			"exec",
			"--yes",
			`--package=${TUNNEL_PACKAGE}`,
			"--",
			"cloudflared",
			"tunnel",
			"--no-autoupdate",
			"--url",
			upstream,
		],
		{
			detached: true,
			env: {
				...process.env,
				CLOUDFLARED_VERSION,
			},
			stdio: ["ignore", log.fd, log.fd],
		},
	);

	child.unref();
	await log.close();

	const deadline = Date.now() + TUNNEL_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (!isRunning(child.pid)) {
			const output = await readFile(TUNNEL_LOG_PATH, "utf8").catch(() => "");
			throw new Error(
				`The npm tunnel command exited before it published a URL. See ${TUNNEL_LOG_PATH}.\n${output}`,
			);
		}

		const output = await readFile(TUNNEL_LOG_PATH, "utf8").catch(() => "");
		const url = output.match(
			/https:\/\/[a-z0-9-]+\.trycloudflare\.com\b/i,
		)?.[0];
		if (url) {
			const state = {
				schemaVersion: 1,
				transport: "cloudflare-quick-tunnel",
				npmPackage: TUNNEL_PACKAGE,
				cloudflaredVersion: CLOUDFLARED_VERSION,
				pid: child.pid,
				upstream,
				url,
				startedAt: new Date().toISOString(),
			};
			await writeFile(TUNNEL_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
			return state;
		}

		await wait(150);
	}

	try {
		process.kill(-child.pid, "SIGTERM");
	} catch (error) {
		if (error?.code !== "ESRCH") throw error;
	}
	throw new Error(
		`Timed out waiting for the npm tunnel command. See ${TUNNEL_LOG_PATH}.`,
	);
};

const stopTunnel = async () => {
	const state = await readJson(TUNNEL_STATE_PATH, "tunnel state");
	if (!state || !isRunning(state.pid)) {
		await removeState();
		console.log("No owned preview tunnel is running.");
		return;
	}

	try {
		const processCommand = execFileSync(
			"ps",
			["-p", String(state.pid), "-o", "command="],
			{
				encoding: "utf8",
			},
		).trim();
		if (
			!processCommand.includes("npm") ||
			!processCommand.includes("cloudflared")
		) {
			throw new Error(
				"Tunnel PID no longer belongs to this repository's npm runner.",
			);
		}
		process.kill(-state.pid, "SIGTERM");
	} finally {
		await removeState();
	}

	console.log("Stopped the owned preview tunnel.");
};

if (command === "--help" || command === "-h") {
	console.log(HELP);
} else if (command === "stop") {
	await stopTunnel();
} else if (command === "status") {
	const state = await readJson(TUNNEL_STATE_PATH, "tunnel state");
	if (!state || !isRunning(state.pid)) {
		await removeState();
		throw new Error("No owned preview tunnel is running.");
	}
	printTunnel(state);
} else {
	const upstream = await getUpstream();
	const state = await existingTunnel(upstream);
	printTunnel(state ?? (await startTunnel(upstream)));
}
