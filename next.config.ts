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

	const isValidLocalDistDir =
		distDir === ".next-user" || /^\.next-user-\d{4}$/.test(distDir);
	const isValidPreviewDistDir = /^\.next-preview-\d{4}$/.test(distDir);
	const isValidLegacyAgentDistDir = /^\.next-agent-\d{4}$/.test(distDir);

	if (
		!isValidLocalDistDir &&
		!isValidPreviewDistDir &&
		!isValidLegacyAgentDistDir
	) {
		throw new Error(
			"NEXT_DEV_DIST_DIR must be .next-user, .next-user-<port>, .next-preview-<port>, or the legacy .next-agent-<port>.",
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

const getAssistantHarnessAliases = (phase: string): Record<string, string> =>
	phase === PHASE_DEVELOPMENT_SERVER
		? {}
		: {
				"@/lib/assistant/codex-harness.server":
					"./src/lib/assistant/codex-harness.production.server.ts",
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
		resolveAlias: getAssistantHarnessAliases(phase),
	},
});

const createPayloadNextConfig = (phase: string) =>
	withPayload(createNextConfig(phase));

export default createPayloadNextConfig;
