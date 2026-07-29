#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";

const USER_PORT = 3000;
const USER_PORT_END = 3010;
const AGENT_PORT_START = 3011;
const AGENT_PORT_END = 3099;

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const requestedMode = args.find((arg) => !arg.startsWith("-")) ?? "preview";
const mode =
	requestedMode === "agent"
		? "preview"
		: requestedMode === "user"
			? "local"
			: requestedMode;
const isDryRun = args.includes("--dry-run");
const shouldPrewarm = args.includes("--prewarm");
const shouldEnableInspector = args.includes("--inspect");
const useRandomPort = args.includes("--random");
const checkoutRoot = process.cwd();
const previewMetadataPath = path.join(checkoutRoot, ".codex", "preview.json");

const printUsageAndExit = () => {
	console.error(
		"Usage: node scripts/dev-server.mjs <preview|local> [--dry-run] [--inspect] [--prewarm] [--random]",
	);
	process.exit(1);
};

const canListenOnHost = (port, host) =>
	new Promise((resolve, reject) => {
		const server = net.createServer();

		server.once("error", (error) => {
			if (error.code === "EADDRINUSE" || error.code === "EACCES") {
				resolve(false);
				return;
			}

			if (error.code === "EAFNOSUPPORT" || error.code === "EADDRNOTAVAIL") {
				resolve(true);
				return;
			}

			reject(error);
		});

		server.once("listening", () => {
			server.close(() => resolve(true));
		});

		server.listen({ host, port });
	});

const isPortAvailable = async (port) =>
	(await canListenOnHost(port, "127.0.0.1")) &&
	(await canListenOnHost(port, "::"));

const findAvailablePort = async (start, end) => {
	for (let port = start; port <= end; port += 1) {
		if (await isPortAvailable(port)) {
			return port;
		}
	}

	return null;
};

const findRandomAvailablePort = async (start, end) => {
	const ports = Array.from(
		{ length: end - start + 1 },
		(_, index) => start + index,
	);

	for (let index = ports.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		const current = ports[index];
		ports[index] = ports[swapIndex];
		ports[swapIndex] = current;
	}

	for (const port of ports) {
		if (await isPortAvailable(port)) {
			return port;
		}
	}

	return null;
};

const getPayloadAdminUrl = (url) => {
	const loginUrl = new URL("/api/dev/payload-login", url);
	loginUrl.searchParams.set("next", "/admin");

	return loginUrl.toString();
};

const getAutomationUrl = (url) => `${url}?motion=off&reveal=off`;

const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

const getGitBranch = () => {
	try {
		const branch = execFileSync("git", ["branch", "--show-current"], {
			cwd: checkoutRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();

		if (branch) {
			return branch;
		}

		return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
			cwd: checkoutRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return null;
	}
};

const writePreviewMetadata = async ({ child, target, url }) => {
	const metadata = {
		schemaVersion: 1,
		root: checkoutRoot,
		branch: getGitBranch(),
		mode: target.label,
		pid: child.pid ?? null,
		localUrl: url,
		automationUrl: getAutomationUrl(url),
		startedAt: new Date().toISOString(),
	};

	await mkdir(path.dirname(previewMetadataPath), { recursive: true });
	await writeFile(
		previewMetadataPath,
		`${JSON.stringify(metadata, null, 2)}\n`,
	);
};

const clearPreviewMetadata = async (pid) => {
	try {
		const metadata = JSON.parse(await readFile(previewMetadataPath, "utf8"));

		if (metadata.pid === pid) {
			await unlink(previewMetadataPath);
		}
	} catch (error) {
		if (error?.code !== "ENOENT") {
			console.warn(`Could not clear preview metadata: ${error.message}`);
		}
	}
};

const wait = (milliseconds) =>
	new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});

const prewarmHomepage = async (url) => {
	const startedAt = Date.now();
	const timeoutMs = 45_000;
	const deadline = startedAt + timeoutMs;

	console.log(`Prewarming: ${url}`);

	while (Date.now() - startedAt < timeoutMs) {
		try {
			const response = await fetch(url, {
				signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
			});

			if (response.ok || (response.status >= 300 && response.status < 400)) {
				console.log(
					`Preview ready: ${url} (${((Date.now() - startedAt) / 1000).toFixed(1)}s prewarm)`,
				);
				return;
			}
		} catch {
			// Next may not be listening yet. Retry until the preview deadline.
		}

		await wait(150);
	}

	console.warn(`Preview prewarm timed out after ${timeoutMs / 1000}s: ${url}`);
};

const getServerTarget = async () => {
	if (mode === "local") {
		const port = await findAvailablePort(USER_PORT, USER_PORT_END);

		if (!port) {
			console.error(
				[
					`No available user dev server ports found in ${USER_PORT}-${USER_PORT_END}.`,
					"The local dev server avoids the preview port range so it does not collide with isolated previews.",
					"Stop the existing process yourself if you want to replace it, or run npm run dev for an isolated preview.",
				].join("\n"),
			);
			process.exit(1);
		}

		return {
			distDir: port === USER_PORT ? ".next-user" : `.next-user-${port}`,
			label: "local",
			port,
			tsconfigPath:
				port === USER_PORT
					? "tsconfig.next-user.json"
					: `tsconfig.next-user-${port}.json`,
		};
	}

	if (mode === "preview") {
		const port = useRandomPort
			? await findRandomAvailablePort(AGENT_PORT_START, AGENT_PORT_END)
			: await findAvailablePort(AGENT_PORT_START, AGENT_PORT_END);

		if (!port) {
			console.error(
				`No available preview ports found in ${AGENT_PORT_START}-${AGENT_PORT_END}.`,
			);
			process.exit(1);
		}

		return {
			distDir: `.next-preview-${port}`,
			label: "preview",
			port,
			tsconfigPath: `tsconfig.next-preview-${port}.json`,
		};
	}

	printUsageAndExit();
};

const start = async () => {
	const target = await getServerTarget();
	const url = `http://localhost:${target.port}`;

	console.log(`Mode: ${target.label}`);
	console.log(`URL: ${url}`);
	if (target.label === "preview") {
		console.log(`Automation URL: ${getAutomationUrl(url)}`);
	}
	if (process.env.PAYLOAD_DEV_MAGIC_LOGIN === "1") {
		console.log(`Payload Admin URL: ${getPayloadAdminUrl(url)}`);
	}
	console.log(`Checkout: ${checkoutRoot}`);
	console.log(`VS Code: code --new-window ${shellQuote(checkoutRoot)}`);
	console.log(`Preview metadata: ${previewMetadataPath}`);
	console.log(`Next distDir: ${target.distDir}`);
	console.log(`TypeScript config: ${target.tsconfigPath}`);

	if (isDryRun) {
		return;
	}

	await writeFile(
		target.tsconfigPath,
		`${JSON.stringify(
			{
				extends: "./tsconfig.json",
				include: [
					"next-env.d.ts",
					"**/*.ts",
					"**/*.tsx",
					`${target.distDir}/types/**/*.ts`,
					`${target.distDir}/dev/types/**/*.ts`,
				],
				exclude: ["node_modules"],
			},
			null,
			2,
		)}\n`,
	);

	const nextBin = require.resolve("next/dist/bin/next");
	const child = spawn(
		process.execPath,
		[nextBin, "dev", "--turbopack", "--port", String(target.port)],
		{
			env: {
				...process.env,
				NEXT_DEV_DIST_DIR: target.distDir,
				NEXT_DEV_SERVER_MODE: target.label,
				NEXT_DEV_CODE_INSPECTOR:
					shouldEnableInspector || process.env.NEXT_DEV_CODE_INSPECTOR === "1"
						? "1"
						: "0",
				NEXT_DEV_TSCONFIG_PATH: target.tsconfigPath,
				NEXT_WORKTREE_ROOT: checkoutRoot,
				PORT: String(target.port),
			},
			stdio: "inherit",
		},
	);

	await writePreviewMetadata({ child, target, url });

	if (shouldPrewarm) {
		void prewarmHomepage(url);
	}

	child.on("exit", (code, signal) => {
		void clearPreviewMetadata(child.pid).finally(() => {
			if (signal) {
				process.kill(process.pid, signal);
				return;
			}

			process.exit(code ?? 0);
		});
	});
};

start().catch((error) => {
	console.error(error);
	process.exit(1);
});
