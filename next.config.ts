import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const isPrivateIpv4 = (address: string) => {
	const [first = "", second = ""] = address.split(".");
	const firstOctet = Number.parseInt(first, 10);
	const secondOctet = Number.parseInt(second, 10);

	return (
		firstOctet === 10 ||
		(firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
		(firstOctet === 192 && secondOctet === 168)
	);
};

const getDevAllowedOrigins = (phase: string) => {
	if (phase !== PHASE_DEVELOPMENT_SERVER) {
		return [];
	}

	const origins = new Set<string>();

	for (const entries of Object.values(networkInterfaces())) {
		for (const entry of entries ?? []) {
			if (
				entry.family === "IPv4" &&
				!entry.internal &&
				isPrivateIpv4(entry.address)
			) {
				origins.add(entry.address);
			}
		}
	}

	for (const origin of (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "").split(
		",",
	)) {
		const trimmedOrigin = origin.trim();

		if (trimmedOrigin) {
			origins.add(trimmedOrigin);
		}
	}

	return [...origins];
};

const getDevIsolationConfig = (
	phase: string,
): Pick<NextConfig, "distDir" | "typescript"> => {
	if (phase !== PHASE_DEVELOPMENT_SERVER) {
		return {};
	}

	const distDir = process.env.NEXT_DEV_DIST_DIR;
	const tsconfigPath = process.env.NEXT_DEV_TSCONFIG_PATH;

	if (!distDir) {
		return {};
	}

	const isValidUserDistDir =
		distDir === ".next-user" || /^\.next-user-\d{4}$/.test(distDir);
	const isValidAgentDistDir = /^\.next-agent-\d{4}$/.test(distDir);

	if (!isValidUserDistDir && !isValidAgentDistDir) {
		throw new Error(
			"NEXT_DEV_DIST_DIR must be .next-user, .next-user-<port>, or .next-agent-<port>.",
		);
	}

	if (!tsconfigPath) {
		throw new Error(
			"NEXT_DEV_TSCONFIG_PATH is required when NEXT_DEV_DIST_DIR is set.",
		);
	}

	const expectedTsconfigPath = `tsconfig${distDir}.json`;

	if (tsconfigPath !== expectedTsconfigPath) {
		throw new Error(
			`NEXT_DEV_TSCONFIG_PATH must be ${expectedTsconfigPath} for ${distDir}.`,
		);
	}

	return {
		distDir,
		typescript: {
			tsconfigPath,
		},
	};
};

const shouldEnableCodeInspector = (phase: string) =>
	phase === PHASE_DEVELOPMENT_SERVER && process.env.NODE_ENV === "development";

const getCodeInspectorDevServerPort = () => {
	const distDir = process.env.NEXT_DEV_DIST_DIR;
	const distDirPort =
		distDir === ".next-user"
			? 3000
			: Number.parseInt(distDir?.match(/-(\d{4})$/)?.[1] ?? "", 10);
	const envPort = Number.parseInt(process.env.PORT ?? "", 10);

	return Number.isFinite(distDirPort) ? distDirPort : envPort;
};

const getCodeInspectorPort = () => {
	const explicitPort = Number.parseInt(
		process.env.CODE_INSPECTOR_PORT ?? "",
		10,
	);

	if (Number.isFinite(explicitPort)) {
		return explicitPort;
	}

	const devServerPort = getCodeInspectorDevServerPort();

	if (!Number.isFinite(devServerPort)) {
		return 5678;
	}

	return 5678 + Math.max(devServerPort - 3000, 0);
};

const getCodeInspectorWorkspaceRoot = () =>
	process.env.NEXT_WORKTREE_ROOT ?? process.cwd();

const getCodeInspectorRules = (phase: string) => {
	if (!shouldEnableCodeInspector(phase)) {
		return {};
	}

	const { codeInspectorPlugin } =
		require("code-inspector-plugin") as typeof import("code-inspector-plugin");

	return codeInspectorPlugin({
		bundler: "turbopack",
		dev: true,
		editor: "code",
		launchType: "exec",
		pathFormat: [
			"--reuse-window",
			getCodeInspectorWorkspaceRoot(),
			"--goto",
			"{file}:{line}:{column}",
		],
		pathType: "absolute",
		port: getCodeInspectorPort(),
		printServer: true,
	});
};

const createNextConfig = (phase: string): NextConfig => ({
	...getDevIsolationConfig(phase),
	...(getDevAllowedOrigins(phase).length > 0
		? { allowedDevOrigins: getDevAllowedOrigins(phase) }
		: {}),
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.example.com",
			},
		],
	},
	outputFileTracingRoot: PROJECT_ROOT,
	turbopack: {
		root: PROJECT_ROOT,
		rules: getCodeInspectorRules(phase),
	},
});

const createPayloadNextConfig = (phase: string) =>
	withPayload(createNextConfig(phase));

export default createPayloadNextConfig;
