// biome-ignore-all lint/suspicious/noTemplateCurlyInString: this module renders source files that intentionally contain template placeholders.

export function createProjectState(selectedSurfaceIds) {
	const selected = new Set(selectedSurfaceIds);

	return {
		hasAssistant: selected.has("assistant"),
		hasMarketing: selected.has("marketing"),
		hasMarketingSettings: selected.has("marketing"),
		hasDashboard: selected.has("dashboard"),
		hasDemo: selected.has("demo"),
		hasTesting: selected.has("testing"),
		hasPayload: selected.has("payload"),
	};
}

export function renderCapabilitiesFile(state) {
	return [
		"export const templateCapabilities = {",
		`\tassistant: ${state.hasAssistant},`,
		"\trepositoryFootprint: false,",
		"} as const;",
		"",
	].join("\n");
}

export function renderMarketingContentSourceFile(state) {
	if (!state.hasMarketing) return null;

	if (state.hasPayload) {
		return [
			'export { getConfiguredMarketingPage } from "@/payload/marketingPageSource";',
			'export { getConfiguredSiteLayout } from "@/payload/siteLayoutSource";',
			"",
		].join("\n");
	}

	return [
		'import { fallbackMarketingPages, fallbackSiteLayout } from "./fallback";',
		'import type { MarketingPageSlug } from "./types";',
		"",
		"export async function getConfiguredMarketingPage(slug: MarketingPageSlug) {",
		"\treturn fallbackMarketingPages[slug];",
		"}",
		"",
		"export async function getConfiguredSiteLayout() {",
		"\treturn fallbackSiteLayout;",
		"}",
		"",
	].join("\n");
}

export function renderSurfacesFile(state) {
	const imports = [];
	const registrySpreads = [];
	const internalRouteLines = [];

	if (state.hasMarketing) {
		imports.push(
			'import { marketingSurfaceRegistry } from "@/config/surfaces/marketing";',
		);
		registrySpreads.push("\t...marketingSurfaceRegistry,");
	}
	if (state.hasDashboard) {
		imports.push(
			'import { authSurfaceRegistry } from "@/config/surfaces/auth";',
			'import { dashboardRouteSurfaceRegistry } from "@/config/surfaces/dashboard";',
		);
		registrySpreads.push(
			"\t...authSurfaceRegistry,",
			"\t...dashboardRouteSurfaceRegistry,",
		);
	}

	if (state.hasDemo) {
		internalRouteLines.push('\tdemo: "/internal/demo",');
	}
	if (state.hasTesting) {
		internalRouteLines.push('\ttesting: "/internal/testing",');
	}

	return [
		...imports,
		'import { defineRouteSurfaceRegistry } from "@/lib/surfaces/routeSurface";',
		"",
		"export const appSurfaceRegistry = defineRouteSurfaceRegistry([",
		...registrySpreads,
		"] as const);",
		"",
		"export type AppSurface = (typeof appSurfaceRegistry)[number];",
		'export type AppSurfaceId = AppSurface["id"];',
		"",
		"export const internalRoutes = {",
		...internalRouteLines,
		"} as const;",
		"",
		"export type InternalRouteId = keyof typeof internalRoutes;",
		"",
	].join("\n");
}

export function renderMarketingSurfaceRegistryFile(state) {
	if (!state.hasMarketing) return null;

	const settingsSurface = state.hasMarketingSettings
		? [
				"export const marketingSettingsSurfaceRegistry = defineRouteSurfaceRegistry([",
				"\t{",
				'\t\tfamily: "marketing",',
				'\t\thref: "/settings",',
				'\t\tid: "marketing.settings",',
				'\t\tmatch: "exact",',
				"\t},",
				"] as const);",
				"",
			]
		: [
				"export const marketingSettingsSurfaceRegistry = defineRouteSurfaceRegistry([] as const);",
				"",
			];

	return [
		'import { defineRouteSurfaceRegistry } from "@/lib/surfaces/routeSurface";',
		"",
		"export const marketingCoreSurfaceRegistry = defineRouteSurfaceRegistry([",
		"\t{",
		'\t\tfamily: "marketing",',
		'\t\thref: "/",',
		'\t\tid: "marketing.home",',
		'\t\tmatch: "exact",',
		"\t},",
		"\t{",
		'\t\tfamily: "marketing",',
		'\t\thref: "/contact",',
		'\t\tid: "marketing.contact",',
		'\t\tmatch: "exact",',
		"\t},",
		"] as const);",
		"",
		...settingsSurface,
		"export const marketingSurfaceRegistry = defineRouteSurfaceRegistry([",
		"\t...marketingCoreSurfaceRegistry,",
		"\t...marketingSettingsSurfaceRegistry,",
		"] as const);",
		"",
		"export type MarketingSurface = (typeof marketingSurfaceRegistry)[number];",
		'export type MarketingSurfaceId = MarketingSurface["id"];',
		"",
	].join("\n");
}

export function renderInternalLayoutFile(state) {
	const shared = [
		'import type { Metadata } from "next";',
		'import { siteMetadata } from "@/config/metadataConfig";',
		'import { createPrivateRouteMetadata } from "@/lib/metadata";',
		"",
		"export const metadata: Metadata = createPrivateRouteMetadata({",
		"\tdescription: siteMetadata.defaultDescription,",
		'\tpath: "/internal",',
		'\ttitle: "Internal",',
		"});",
		"",
		"export default function InternalLayout({",
		"\tchildren,",
		"}: Readonly<{",
		"\tchildren: React.ReactNode;",
		"}>) {",
	];

	if (state.hasMarketing) {
		return [...shared, "", "\treturn children;", "}", ""].join("\n");
	}

	return [
		...shared.slice(0, 1),
		'import { SiteShell } from "@/app/(site)/_components/layout/SiteShell";',
		'import { defaultSiteLayout } from "@/app/(site)/_components/layout/siteLayout";',
		...shared.slice(1),
		"",
		"\treturn (",
		"\t\t<SiteShell siteLayout={defaultSiteLayout}>",
		'\t\t\t<div className="min-h-screen bg-background">{children}</div>',
		"\t\t</SiteShell>",
		"\t);",
		"}",
		"",
	].join("\n");
}

export function renderNextConfigFile(state) {
	if (state.hasPayload) return null;

	return [
		'import { networkInterfaces } from "node:os";',
		'import path from "node:path";',
		'import { fileURLToPath } from "node:url";',
		'import type { NextConfig } from "next";',
		'import { PHASE_DEVELOPMENT_SERVER } from "next/constants";',
		"",
		"const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));",
		"",
		"const isPrivateIpv4 = (address: string) => {",
		'\tconst [first = "", second = ""] = address.split(".");',
		"\tconst firstOctet = Number.parseInt(first, 10);",
		"\tconst secondOctet = Number.parseInt(second, 10);",
		"",
		"\treturn (",
		"\t\tfirstOctet === 10 ||",
		"\t\t(firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||",
		"\t\t(firstOctet === 192 && secondOctet === 168)",
		"\t);",
		"};",
		"",
		"const getDevAllowedOrigins = (phase: string) => {",
		"\tif (phase !== PHASE_DEVELOPMENT_SERVER) {",
		"\t\treturn [];",
		"\t}",
		"",
		"\tconst origins = new Set<string>();",
		"",
		"\tfor (const entries of Object.values(networkInterfaces())) {",
		"\t\tfor (const entry of entries ?? []) {",
		"\t\t\tif (",
		'\t\t\t\tentry.family === "IPv4" &&',
		"\t\t\t\t!entry.internal &&",
		"\t\t\t\tisPrivateIpv4(entry.address)",
		"\t\t\t) {",
		"\t\t\t\torigins.add(entry.address);",
		"\t\t\t}",
		"\t\t}",
		"\t}",
		"",
		'\tfor (const origin of (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "").split(",")) {',
		"\t\tconst trimmedOrigin = origin.trim();",
		"",
		"\t\tif (trimmedOrigin) {",
		"\t\t\torigins.add(trimmedOrigin);",
		"\t\t}",
		"\t}",
		"",
		"\treturn [...origins];",
		"};",
		"",
		"const getDevIsolationConfig = (",
		"\tphase: string,",
		'): Pick<NextConfig, "distDir" | "typescript"> => {',
		"\tif (phase !== PHASE_DEVELOPMENT_SERVER) {",
		"\t\treturn {};",
		"\t}",
		"",
		"\tconst distDir = process.env.NEXT_DEV_DIST_DIR;",
		"\tconst tsconfigPath = process.env.NEXT_DEV_TSCONFIG_PATH;",
		"",
		"\tif (!distDir) {",
		"\t\treturn {};",
		"\t}",
		"",
		"\tconst isValidLocalDistDir =",
		'\t\tdistDir === ".next-user" || /^\\.next-user-\\d{4}$/.test(distDir);',
		"\tconst isValidPreviewDistDir = /^\\.next-preview-\\d{4}$/.test(distDir);",
		"\tconst isValidLegacyAgentDistDir = /^\\.next-agent-\\d{4}$/.test(distDir);",
		"",
		"\tif (",
		"\t\t!isValidLocalDistDir &&",
		"\t\t!isValidPreviewDistDir &&",
		"\t\t!isValidLegacyAgentDistDir",
		"\t) {",
		"\t\tthrow new Error(",
		'\t\t\t"NEXT_DEV_DIST_DIR must be .next-user, .next-user-<port>, .next-preview-<port>, or the legacy .next-agent-<port>.",',
		"\t\t);",
		"\t}",
		"",
		"\tif (!tsconfigPath) {",
		"\t\tthrow new Error(",
		'\t\t\t"NEXT_DEV_TSCONFIG_PATH is required when NEXT_DEV_DIST_DIR is set.",',
		"\t\t);",
		"\t}",
		"",
		"\tconst expectedTsconfigPath = `tsconfig${distDir}.json`;",
		"",
		"\tif (tsconfigPath !== expectedTsconfigPath) {",
		"\t\tthrow new Error(",
		"\t\t\t`NEXT_DEV_TSCONFIG_PATH must be ${expectedTsconfigPath} for ${distDir}.`,",
		"\t\t);",
		"\t}",
		"",
		"\treturn {",
		"\t\tdistDir,",
		"\t\ttypescript: {",
		"\t\t\ttsconfigPath,",
		"\t\t},",
		"\t};",
		"};",
		"",
		"const createNextConfig = (phase: string): NextConfig => ({",
		"\t...getDevIsolationConfig(phase),",
		"\t...(getDevAllowedOrigins(phase).length > 0",
		"\t\t? { allowedDevOrigins: getDevAllowedOrigins(phase) }",
		"\t\t: {}),",
		"\timages: {",
		"\t\tremotePatterns: [",
		"\t\t\t{",
		'\t\t\t\tprotocol: "https",',
		'\t\t\t\thostname: "cdn.example.com",',
		"\t\t\t},",
		"\t\t],",
		"\t},",
		"\toutputFileTracingRoot: PROJECT_ROOT,",
		"\tturbopack: {",
		"\t\troot: PROJECT_ROOT,",
		"\t},",
		"});",
		"",
		"export default createNextConfig;",
		"",
	].join("\n");
}

export function renderTsconfigFile(state) {
	if (state.hasPayload) return null;

	return [
		"{",
		'\t"compilerOptions": {',
		'\t\t"target": "ES2017",',
		'\t\t"lib": ["dom", "dom.iterable", "esnext"],',
		'\t\t"allowJs": true,',
		'\t\t"skipLibCheck": true,',
		'\t\t"strict": true,',
		'\t\t"noEmit": true,',
		'\t\t"esModuleInterop": true,',
		'\t\t"module": "esnext",',
		'\t\t"moduleResolution": "bundler",',
		'\t\t"resolveJsonModule": true,',
		'\t\t"isolatedModules": true,',
		'\t\t"jsx": "react-jsx",',
		'\t\t"incremental": true,',
		'\t\t"plugins": [',
		"\t\t\t{",
		'\t\t\t\t"name": "next"',
		"\t\t\t}",
		"\t\t],",
		'\t\t"paths": {',
		'\t\t\t"@/*": ["./src/*"]',
		"\t\t}",
		"\t},",
		'\t"include": [',
		'\t\t"next-env.d.ts",',
		'\t\t"**/*.ts",',
		'\t\t"**/*.tsx",',
		'\t\t".next/types/**/*.ts",',
		'\t\t".next/dev/types/**/*.ts"',
		"\t],",
		'\t"exclude": ["node_modules", "template-profiles/**/overrides/**"]',
		"}",
		"",
	].join("\n");
}

export function renderApiIndexFile(state) {
	const lines = [];

	if (state.hasDashboard) {
		lines.push(
			"export {",
			"  fetchSession,",
			"  login,",
			"  logout,",
			"  type SessionUser,",
			"  updateSessionUser,",
			"  updateStoredSessionUser,",
			'} from "./auth";',
		);
	}

	lines.push(
		"export {",
		"  type ApiClient,",
		"  type ApiClientOptions,",
		"  type ApiError,",
		"  type ApiRequestBody,",
		"  type ApiRequester,",
		"  type ApiRequestOptions,",
		"  createApiClient,",
		"  type ErrorResponse,",
		"  request,",
		'} from "./createApiClient";',
		"export {",
		"  createMockFetch,",
		"  type MockApiResponse,",
		"  type MockRequestContext,",
		"  type MockRoute,",
		'} from "./createMockFetch";',
		"",
	);

	return lines.join("\n");
}
