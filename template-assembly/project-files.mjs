// biome-ignore-all lint/suspicious/noTemplateCurlyInString: this module renders source files that intentionally contain template placeholders.

export function createProjectState(selectedSurfaceIds) {
	const selected = new Set(selectedSurfaceIds);

	return {
		hasMarketing: selected.has("marketing"),
		hasDashboard: selected.has("dashboard"),
		hasDashboardReferenceEntities:
			selected.has("dashboard") && selected.has("dashboardReferenceEntities"),
		hasDemo: selected.has("demo"),
		hasIntelligence: selected.has("intelligence"),
		hasPlayground: selected.has("playground"),
		hasDictionary: selected.has("dictionary"),
		hasReference: selected.has("reference"),
		hasPayload: selected.has("payload"),
	};
}

export function renderRoutesFile(state) {
	const lines = [`export const appRoutes = {`, `\thome: "/",`];

	if (state.hasMarketing) lines.push(`\tcontact: "/contact",`);
	if (state.hasDemo) lines.push(`\tdemo: "/internal/demo",`);
	if (state.hasIntelligence) {
		lines.push(`\tintelligence: "/internal/intelligence",`);
	}
	if (state.hasPlayground) {
		lines.push(`\tplayground: "/internal/playground",`);
	}
	if (state.hasMarketing) lines.push(`\tsettings: "/settings",`);

	if (state.hasDashboard) {
		lines.push(`\tlogin: "/login",`);
		lines.push(`\tsignInOptions: "/sign-in-options",`);
		lines.push(`\tforgotPassword: "/forgot-password",`);
		lines.push(`\tresetPassword: "/reset-password",`);
		lines.push(`\tsetPassword: "/set-password",`);
		lines.push(`\tinvitation: "/invitation",`);
		lines.push(`\tselectOrganization: "/select-organization",`);
	}

	if (state.hasDictionary) {
		lines.push(`\tdictionary: "/internal/dictionary",`);
		lines.push(
			`\tdictionaryRiveLogoReveal: "/internal/dictionary/loading-screens/rive-logo-reveal",`,
		);
		lines.push(
			`\tdictionarySpamProtectedForm: "/internal/dictionary/forms/spam-protected-form",`,
		);
	}

	if (state.hasReference) {
		lines.push(`\treference: "/internal/reference",`);
	}

	lines.push(
		`} as const;`,
		"",
		`export type AppRouteId = keyof typeof appRoutes;`,
		"",
	);

	return lines.join("\n");
}

export function renderLibRoutesFile(state) {
	const builderLines = [];

	if (state.hasDashboard) {
		builderLines.push(
			'\tdashboardSubpage: (...segments: string[]) => `/dashboard/${segments.join("/")}`,',
		);
	}

	if (state.hasDictionary) {
		builderLines.push(
			'\tdictionaryEntry: (...segments: string[]) => `/internal/dictionary/${segments.join("/")}`,',
		);
	}

	return [
		'import { appRoutes, type AppRouteId } from "@/config/routes";',
		"",
		'export type { AppRouteId } from "@/config/routes";',
		"",
		"export function hrefFor(routeId: AppRouteId) {",
		"\treturn appRoutes[routeId];",
		"}",
		"",
		builderLines.length > 0
			? ["export const routeBuilders = {", ...builderLines, "};", ""].join("\n")
			: ["export const routeBuilders = {};", ""].join("\n"),
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
		"const getCodeInspectorPort = () => {",
		'\tconst explicitPort = Number.parseInt(process.env.CODE_INSPECTOR_PORT ?? "", 10);',
		"",
		"\tif (Number.isFinite(explicitPort)) {",
		"\t\treturn explicitPort;",
		"\t}",
		"",
		"\tconst distDir = process.env.NEXT_DEV_DIST_DIR;",
		"\tconst distDirPort =",
		'\t\tdistDir === ".next-user"',
		"\t\t\t? 3000",
		'\t\t\t: Number.parseInt(distDir?.match(/-(\\d{4})$/)?.[1] ?? "", 10);',
		'\tconst envPort = Number.parseInt(process.env.PORT ?? "", 10);',
		"\tconst devServerPort = Number.isFinite(distDirPort) ? distDirPort : envPort;",
		"",
		"\tif (!Number.isFinite(devServerPort)) {",
		"\t\treturn 5678;",
		"\t}",
		"",
		"\treturn 5678 + Math.max(devServerPort - 3000, 0);",
		"};",
		"",
		"const getCodeInspectorWorkspaceRoot = () =>",
		"\tprocess.env.NEXT_WORKTREE_ROOT ?? process.cwd();",
		"",
		"const shouldEnableCodeInspector = (phase: string) =>",
		"\tphase === PHASE_DEVELOPMENT_SERVER &&",
		'\tprocess.env.NEXT_DEV_CODE_INSPECTOR === "1";',
		"",
		"const getCodeInspectorRules = (phase: string) => {",
		"\tif (!shouldEnableCodeInspector(phase)) {",
		"\t\treturn {};",
		"\t}",
		"",
		"\tconst { codeInspectorPlugin } = require(",
		'\t\t"code-inspector-plugin",',
		'\t) as typeof import("code-inspector-plugin");',
		"",
		"\treturn codeInspectorPlugin({",
		'\t\tbundler: "turbopack",',
		"\t\tdev: true,",
		'\t\teditor: "code",',
		'\t\tlaunchType: "exec",',
		"\t\tpathFormat: [",
		'\t\t\t"--reuse-window",',
		"\t\t\tgetCodeInspectorWorkspaceRoot(),",
		'\t\t\t"--goto",',
		'\t\t\t"{file}:{line}:{column}",',
		"\t\t],",
		'\t\tpathType: "absolute",',
		"\t\tport: getCodeInspectorPort(),",
		"\t\tprintServer: true,",
		"\t});",
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
		"\t\trules: getCodeInspectorRules(phase),",
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
		"  checkHealth,",
		"  type HealthResponse,",
		'} from "./checkHealth";',
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
		"export {",
		"  type SpamProtectedExampleSubmission,",
		"  submitSpamProtectedExample,",
		'} from "./submitSpamProtectedExample";',
		"",
	);

	return lines.join("\n");
}
