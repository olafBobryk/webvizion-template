#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noTemplateCurlyInString: this script renders source files that intentionally contain template placeholders.

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process, { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const INTERNAL_MARKETING_DIR = path.join(
	ROOT,
	"src/app/(site)/(marketing)/internal",
);
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const TEMPLATE_SHAPE_FILES = [
	"scripts/prune-template.mjs",
	"scripts/_lib/local-production-preview.mjs",
	"scripts/verify/verify-smoke.mjs",
	"src/config/routes.ts",
	"src/lib/routes.ts",
	"src/lib/marketing-content/fallback.ts",
];
const TEMPLATE_SHAPE_SCRIPTS = ["build", "prune:template", "verify:smoke"];

const SURFACES = {
	dashboardReferenceEntities: {
		id: "dashboard.reference-entities",
		flag: "--no-dashboard-reference-entities",
		description:
			"Remove dashboard reference record/member routes, examples, policy, and focused verifiers while retaining dashboard and platform core presentation.",
		dependentSurfaces: ["dashboard"],
		ownedPaths: [
			"docs/frontend-entity-policy.md",
			"scripts/verify/verify-reference-entities.ts",
			"scripts/verify/verify-entity-deletion.ts",
			"scripts/verify/verify-mutation-policy.ts",
			"scripts/verify/verify-entity-skeletons.ts",
			"scripts/verify/verify-frontend-entity-policy.ts",
			"scripts/verify/verify-profile-pruning.mjs",
			"src/app/(site)/dashboard/records",
			"src/app/(site)/dashboard/organization/members/[memberId]",
			"src/app/(site)/dashboard/reference",
			"src/app/(site)/dashboard/_components/commands/DashboardEntityCommands.tsx",
			"src/app/(site)/dashboard/_components/entities/EntityDeletion.tsx",
			"src/app/(site)/dashboard/_components/entities/record",
			"src/app/(site)/dashboard/_lib/entities/record",
			"src/app/(site)/dashboard/_lib/entity-lifecycle.ts",
			"src/app/(site)/dashboard/_lib/fixtures",
		],
		markerFiles: [
			"scripts/verify/verify-dashboard-surfaces.ts",
			"scripts/verify/verify-dashboard-page-policy.ts",
			"src/app/(site)/dashboard/page.tsx",
			"src/app/(site)/dashboard/_components/OverviewSurface.tsx",
			"src/app/(site)/dashboard/layout.tsx",
			"src/app/(site)/dashboard/organization/page.tsx",
			"src/app/(site)/dashboard/_components/debug/DashboardDebugMenu.tsx",
			"src/app/(site)/dashboard/_components/layout/DashboardSidebarNav.tsx",
			"src/app/(site)/dashboard/_components/debug/DashboardForcedLoadingView.tsx",
			"src/app/(site)/dashboard/_registry/surfaceRegistry.ts",
			"src/app/api/debug/fixture/reset/route.ts",
		],
		packageScripts: [
			"verify:reference-entities",
			"verify:entity-deletion",
			"verify:mutation-policy",
			"verify:entity-skeletons",
			"verify:frontend-entity-policy",
			"verify:frontend-entities",
			"verify:profile-pruning",
		],
		postRemovalAssertions: [
			{
				label: "reference entity routes and imports",
				pattern:
					/(dashboard\.reference\.entities|dashboard\.records|dashboard\.record|dashboard\.organization\.members|dashboard\.organization\.member|\/dashboard\/records|\/dashboard\/reference\/entities|reference-records|reference-members)/,
			},
		],
	},
	dashboard: {
		id: "dashboard",
		flag: "--no-dashboard",
		description:
			"Remove the dashboard shell, login/auth routes, and dashboard-only auth helpers.",
		dependentSurfaces: ["auth"],
		ownedPaths: [
			"scripts/verify/verify-auth-organization.ts",
			"scripts/verify/verify-dashboard-page-policy.ts",
			"scripts/verify/verify-dashboard-surfaces.ts",
			"scripts/verify/verify-platform-operations.ts",
			"src/app/(site)/_components/organization",
			"src/app/(site)/dashboard",
			"src/app/(site)/(auth)",
			"src/app/api/auth",
			"src/app/api/debug",
			"src/app/api/feedback",
			"src/app/api/platform",
			"src/app/api/support",
			"src/lib/api/auth.ts",
			"src/lib/auth",
			"src/proxy.ts",
		],
		routeIds: [
			"login",
			"signInOptions",
			"forgotPassword",
			"resetPassword",
			"setPassword",
			"invitation",
			"selectOrganization",
		],
		routeBuilders: ["dashboardSubpage"],
		navRouteIds: [],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "dashboard route ids",
				pattern:
					/(hrefFor\("login"\)|hrefFor\("signInOptions"\)|hrefFor\("forgotPassword"\)|hrefFor\("resetPassword"\)|hrefFor\("setPassword"\)|hrefFor\("invitation"\)|hrefFor\("selectOrganization"\)|routeId:\s*"login"|routeId:\s*"signInOptions"|routeId:\s*"forgotPassword"|routeId:\s*"resetPassword"|routeId:\s*"setPassword"|routeId:\s*"invitation"|routeId:\s*"selectOrganization")/,
			},
			{
				label: "dashboard auth import",
				pattern: /from\s+["']@\/lib\/api\/auth["']/,
			},
			{
				label: "dashboard support and platform operations",
				pattern:
					/(\/dashboard\/(?:platform|support)|\/api\/(?:feedback|platform|support)|platformRole|Platform Inbox|ReportIssueModal)/,
			},
		],
		markerFiles: ["src/app/(site)/(marketing)/internal/intelligence/page.tsx"],
		packageScripts: [
			"verify:auth",
			"verify:dashboard-pages",
			"verify:dashboard",
			"verify:platform",
		],
	},
	demo: {
		id: "demo",
		flag: "--no-demo",
		description: "Remove the internal demo surface and demo search indexing.",
		dependentSurfaces: [],
		ownedPaths: ["src/app/(site)/(marketing)/internal/demo"],
		routeIds: ["demo"],
		routeBuilders: [],
		navRouteIds: ["demo"],
		searchSources: ["demoPages"],
		postRemovalAssertions: [
			{
				label: "demo route ids",
				pattern: /(hrefFor\("demo"\)|routeId:\s*"demo")/,
			},
			{
				label: "demo content import",
				pattern:
					/from\s+["']@\/app\/\(site\)\/\(marketing\)\/internal\/demo\/content["']/,
			},
		],
	},
	intelligence: {
		id: "intelligence",
		flag: "--no-intelligence",
		description:
			"Remove the internal template intelligence surface, generated-index script, docs, and nav/search references.",
		dependentSurfaces: [],
		ownedPaths: [
			".codex/hooks.json",
			"src/app/(site)/dashboard/_components/intelligence",
			"src/app/(site)/(marketing)/internal/intelligence",
			"src/lib/template-intelligence",
			"scripts/generate-template-intelligence.mjs",
			"scripts/lib/codex-turn-recording.mjs",
			"scripts/lib/template-intelligence-benchmark.mjs",
			"scripts/record-codex-turn-event.mjs",
			"scripts/record-template-intelligence-benchmark.mjs",
			"scripts/clear-template-intelligence-benchmark.mjs",
			"scripts/run-template-intelligence-benchmark.mjs",
			"scripts/run-template-intelligence-hybrid.mjs",
			"scripts/setup-template-intelligence-serena.mjs",
			"scripts/verify/verify-template-intelligence-benchmark.mjs",
			"scripts/verify/verify-codex-turn-recording.ts",
			"docs/template-intelligence.md",
			"docs/worklogs/template-intelligence-ledger.md",
			"docs/worklogs/template-intelligence-handoff.md",
			"docs/worklogs/template-intelligence-review-handoff.md",
			"docs/worklogs/template-intelligence-benchmark.md",
			"docs/worklogs/template-intelligence-benchmark-runs.jsonl",
			"docs/worklogs/template-intelligence-benchmark-runs.example.jsonl",
		],
		routeIds: ["intelligence"],
		routeBuilders: [],
		navRouteIds: ["intelligence"],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "intelligence route ids and links",
				pattern:
					/(hrefFor\("intelligence"\)|routeId:\s*"intelligence"|\/internal\/intelligence|template-intelligence|Template Intelligence)/,
			},
			{
				label: "template intelligence imports",
				pattern: /from\s+["']@\/lib\/template-intelligence["']/,
			},
		],
	},
	scrollPerformance: {
		id: "scrollPerformance",
		flag: "--no-scroll-performance",
		description:
			"Remove page-target scroll-performance measurement/autoresearch scripts, benchmark docs, and Playwright dependency.",
		dependentSurfaces: [],
		ownedPaths: [
			"scripts/scroll-performance",
			"docs/worklogs/scroll-performance-benchmark.md",
			"docs/worklogs/scroll-performance-runs.example.jsonl",
		],
		routeIds: [],
		routeBuilders: [],
		navRouteIds: [],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "scroll-performance source references",
				pattern: /scroll-performance/,
			},
		],
	},
	playground: {
		id: "playground",
		flag: "--no-playground",
		description:
			"Remove the internal playground surface and playground search/nav references.",
		dependentSurfaces: [],
		ownedPaths: ["src/app/(site)/(marketing)/internal/playground"],
		routeIds: ["playground"],
		routeBuilders: [],
		navRouteIds: ["playground"],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "playground route ids and links",
				pattern:
					/(hrefFor\("playground"\)|routeId:\s*"playground"|\/internal\/playground)/,
			},
		],
	},
	dictionary: {
		id: "dictionary",
		flag: "--no-dictionary",
		description:
			"Remove the internal dictionary surface, its route ids, and dictionary search/nav references.",
		dependentSurfaces: [],
		ownedPaths: ["src/app/(site)/(marketing)/internal/dictionary"],
		routeIds: [
			"dictionary",
			"dictionaryRiveLogoReveal",
			"dictionarySpamProtectedForm",
		],
		routeBuilders: ["dictionaryEntry"],
		navRouteIds: ["dictionary"],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "dictionary route ids",
				pattern:
					/(hrefFor\("dictionary"\)|hrefFor\("dictionaryRiveLogoReveal"\)|hrefFor\("dictionarySpamProtectedForm"\)|routeId:\s*"dictionary"|routeId:\s*"dictionaryRiveLogoReveal"|routeId:\s*"dictionarySpamProtectedForm")/,
			},
		],
	},
	reference: {
		id: "reference",
		flag: "--no-reference",
		description: "Remove the internal reference/docs surface.",
		dependentSurfaces: [],
		ownedPaths: ["src/app/(site)/(marketing)/internal/reference"],
		routeIds: [],
		routeBuilders: [],
		navRouteIds: [],
		searchSources: [],
		postRemovalAssertions: [],
	},
	payload: {
		id: "payload",
		flag: "--no-payload",
		description:
			"Remove the guarded Payload CMS scaffold, config references, and Payload packages.",
		dependentSurfaces: [],
		ownedPaths: [
			"payload.config.ts",
			"src/payload",
			"src/app/(payload)",
			"src/app/api/dev/payload-login",
		],
		routeIds: [],
		routeBuilders: [],
		navRouteIds: [],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "Payload imports",
				pattern:
					/(?:from\s+["'](?:@payloadcms|@payload-config|@\/payload)|import\s+["'](?:@payloadcms|@payload-config|@\/payload)|require\(["'](?:@payloadcms|@payload-config|@\/payload))/,
			},
		],
	},
};

const CENTRAL_FILES = [
	"src/config/routes.ts",
	"src/lib/routes.ts",
	"src/lib/api/index.ts",
];

const PAYLOAD_PACKAGE_DEPENDENCIES = [
	"@payloadcms/db-postgres",
	"@payloadcms/next",
	"@payloadcms/richtext-lexical",
	"@payloadcms/storage-vercel-blob",
	"payload",
	"sharp",
];

const INTELLIGENCE_PACKAGE_SCRIPTS = [
	"intelligence:generate",
	"intelligence:query",
	"intelligence:benchmark",
	"intelligence:record",
	"intelligence:record:clear",
	"intelligence:hybrid",
	"intelligence:serena:debug",
	"intelligence:serena:setup",
	"verify:intelligence-benchmark",
	"verify:intelligence-recording",
	"predev",
	"predev:user",
	"predev:agent",
	"prebuild",
];

const INTELLIGENCE_PACKAGE_DEPENDENCIES = [];

const SCROLL_PERFORMANCE_PACKAGE_SCRIPTS = [
	"measure:scroll-performance",
	"record:scroll-performance",
	"setup:scroll-performance-autoresearch",
	"score:scroll-performance",
];

const SCROLL_PERFORMANCE_PACKAGE_DEPENDENCIES = ["playwright"];

function printUsage() {
	console.log(`Usage: npm run prune:template -- [flags]

Flags:
  --no-dashboard   Remove dashboard routes, auth/login shell, and dashboard auth helpers
  --no-dashboard-reference-entities
                  Remove dashboard reference entities while retaining dashboard core
  --no-demo        Remove the internal demo surface
  --no-intelligence Remove the internal template intelligence surface
  --no-scroll-performance
                  Remove page-target scroll-performance tooling
  --no-playground  Remove the internal playground surface
  --no-dictionary  Remove the internal dictionary surface
  --no-reference   Remove the internal reference surface
  --no-payload     Remove the guarded Payload CMS scaffold and dependencies
  --dry-run        Print the prune plan without changing files
  --yes            Skip the confirmation prompt
  --confirm-template-root
                  Allow mutating prune on the canonical template main checkout
`);
}

function parseArgs(argv) {
	const surfaceIds = [];
	const flags = new Set(argv);

	for (const [surfaceId, surface] of Object.entries(SURFACES)) {
		if (flags.has(surface.flag)) {
			surfaceIds.push(surfaceId);
		}
	}
	if (
		surfaceIds.includes("dashboard") &&
		!surfaceIds.includes("dashboardReferenceEntities")
	) {
		surfaceIds.unshift("dashboardReferenceEntities");
	}

	const recognized = new Set([
		"--dry-run",
		"--yes",
		"--help",
		"--confirm-template-root",
		...Object.values(SURFACES).map((surface) => surface.flag),
	]);

	const unknown = argv.filter((arg) => !recognized.has(arg));
	if (unknown.length > 0) {
		throw new Error(`Unknown flag(s): ${unknown.join(", ")}`);
	}

	return {
		surfaceIds,
		dryRun: flags.has("--dry-run"),
		yes: flags.has("--yes"),
		help: flags.has("--help"),
		confirmTemplateRoot: flags.has("--confirm-template-root"),
	};
}

function relativePath(targetPath) {
	return path.relative(ROOT, targetPath) || ".";
}

async function pathExists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

async function readPackageJson() {
	const raw = await fs.readFile(PACKAGE_JSON_PATH, "utf8");
	return JSON.parse(raw);
}

async function assertTemplateShape() {
	const pkg = await readPackageJson();
	const missingFiles = [];
	const missingScripts = [];

	for (const filePath of TEMPLATE_SHAPE_FILES) {
		if (!(await pathExists(path.join(ROOT, filePath)))) {
			missingFiles.push(filePath);
		}
	}

	for (const scriptName of TEMPLATE_SHAPE_SCRIPTS) {
		if (!pkg.scripts?.[scriptName]) {
			missingScripts.push(scriptName);
		}
	}

	if (missingFiles.length > 0 || missingScripts.length > 0) {
		const details = [
			...missingFiles.map((filePath) => `missing file ${filePath}`),
			...missingScripts.map((scriptName) => `missing npm script ${scriptName}`),
		];

		throw new Error(
			`Current directory does not match the Averlo template prune shape: ${details.join(", ")}.`,
		);
	}

	return pkg;
}

function gitOutput(args) {
	const result = spawnSync("git", args, {
		cwd: ROOT,
		encoding: "utf8",
		shell: process.platform === "win32",
		stdio: ["ignore", "pipe", "ignore"],
	});

	if (result.status !== 0) {
		return "";
	}

	return result.stdout.trim();
}

function isCanonicalTemplateRemote(remoteUrl) {
	return /(?:^|[:/])averlo-next-template(?:\.git)?$/i.test(remoteUrl);
}

function isCanonicalTemplateMainCheckout(pkg) {
	if (pkg.name !== "averlo-next-template") return false;

	const branch = gitOutput(["branch", "--show-current"]);
	if (branch !== "main") return false;

	const originUrl = gitOutput(["config", "--get", "remote.origin.url"]);
	return isCanonicalTemplateRemote(originUrl);
}

function assertTemplateRootMutationAllowed(pkg, parsed) {
	if (parsed.dryRun || parsed.confirmTemplateRoot) return;
	if (!isCanonicalTemplateMainCheckout(pkg)) return;

	throw new Error(
		"Mutating prune on the canonical averlo-next-template main checkout requires --confirm-template-root. Run a dry-run, use a clone/instance, or pass the explicit confirmation flag for template-maintenance tests.",
	);
}

function warnCanonicalTemplateMainPrune(pkg, parsed) {
	if (!isCanonicalTemplateMainCheckout(pkg)) return;

	const runMode = parsed.dryRun ? "dry-run" : "mutating run";
	console.warn("");
	console.warn("WARNING: canonical template main prune target detected.");
	console.warn(
		`This ${runMode} is running in averlo-next-template on main. Pruning this checkout can collapse the full template into a reduced instance shape.`,
	);
	console.warn(
		"Use a clone, branch, or worktree for project-specific pruning whenever possible.",
	);
	console.warn(
		"Mutating canonical-template prunes remain blocked unless --confirm-template-root is passed.",
	);
}

function buildState(surfaceIds) {
	const removed = new Set(surfaceIds);

	return {
		hasDashboard: !removed.has("dashboard"),
		hasDashboardReferenceEntities:
			!removed.has("dashboard") && !removed.has("dashboardReferenceEntities"),
		hasDemo: !removed.has("demo"),
		hasIntelligence: !removed.has("intelligence"),
		hasPlayground: !removed.has("playground"),
		hasDictionary: !removed.has("dictionary"),
		hasReference: !removed.has("reference"),
		hasPayload: !removed.has("payload"),
	};
}

async function collectPlan(surfaceIds) {
	const deletedPaths = [];
	const rewriteCentral = surfaceIds.some(
		(surfaceId) => surfaceId !== "dashboardReferenceEntities",
	);
	for (const surfaceId of surfaceIds) {
		for (const ownedPath of SURFACES[surfaceId].ownedPaths) {
			const absolutePath = path.join(ROOT, ownedPath);
			if (await pathExists(absolutePath)) {
				deletedPaths.push(absolutePath);
			}
		}
	}

	const uniqueDeletedPaths = [...new Set(deletedPaths)].sort();
	const removeInternalDir =
		surfaceIds.includes("demo") &&
		surfaceIds.includes("intelligence") &&
		surfaceIds.includes("playground") &&
		surfaceIds.includes("dictionary") &&
		surfaceIds.includes("reference");

	return {
		surfaces: surfaceIds.map((surfaceId) => SURFACES[surfaceId]),
		deletedPaths: uniqueDeletedPaths,
		rewriteFiles: [
			...(rewriteCentral
				? [
						...CENTRAL_FILES,
						"src/lib/marketing-content/fallback.ts",
						"scripts/verify/verify-smoke.mjs",
					]
				: []),
			...(surfaceIds.includes("payload")
				? ["next.config.ts", "tsconfig.json", "package.json"]
				: []),
			...(surfaceIds.includes("intelligence") ? ["package.json"] : []),
			...(surfaceIds.includes("scrollPerformance") ? ["package.json"] : []),
		],
		rewriteCentral,
		packageDependencies: [
			...(surfaceIds.includes("payload") ? PAYLOAD_PACKAGE_DEPENDENCIES : []),
			...(surfaceIds.includes("intelligence")
				? INTELLIGENCE_PACKAGE_DEPENDENCIES
				: []),
			...(surfaceIds.includes("scrollPerformance")
				? SCROLL_PERFORMANCE_PACKAGE_DEPENDENCIES
				: []),
		],
		packageScripts: [
			...surfaceIds.flatMap(
				(surfaceId) => SURFACES[surfaceId].packageScripts ?? [],
			),
			...(surfaceIds.includes("intelligence")
				? INTELLIGENCE_PACKAGE_SCRIPTS
				: []),
			...(surfaceIds.includes("scrollPerformance")
				? SCROLL_PERFORMANCE_PACKAGE_SCRIPTS
				: []),
		],
		markerFiles: [
			...new Set(
				surfaceIds.flatMap(
					(surfaceId) => SURFACES[surfaceId].markerFiles ?? [],
				),
			),
		],
		removeInternalDir,
	};
}

function stripSurfaceMarkerBlocks(content, surfaceIds) {
	let nextContent = content;
	for (const surfaceId of surfaceIds) {
		const markerId = SURFACES[surfaceId].id;
		const escapedMarkerId = markerId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const block = new RegExp(
			`^[\\t ]*(?:// prune:${escapedMarkerId}:start|\\{/\\* prune:${escapedMarkerId}:start \\*/\\})\\r?\\n[\\s\\S]*?^[\\t ]*(?:// prune:${escapedMarkerId}:end|\\{/\\* prune:${escapedMarkerId}:end \\*/\\})\\r?\\n?`,
			"gm",
		);
		nextContent = nextContent.replace(block, "");
	}
	return nextContent;
}

async function stripSurfaceMarkers(filePaths, surfaceIds) {
	for (const filePath of filePaths) {
		const absolutePath = path.join(ROOT, filePath);
		if (!(await pathExists(absolutePath))) continue;
		const content = await fs.readFile(absolutePath, "utf8");
		const nextContent = stripSurfaceMarkerBlocks(content, surfaceIds);
		if (nextContent !== content) {
			await fs.writeFile(absolutePath, nextContent, "utf8");
		}
	}
}

function renderRoutesFile(state) {
	const lines = [
		`export const appRoutes = {`,
		`\thome: "/",`,
		`\tcontact: "/contact",`,
	];

	if (state.hasDemo) {
		lines.push(`\tdemo: "/internal/demo",`);
	}

	if (state.hasIntelligence) {
		lines.push(`\tintelligence: "/internal/intelligence",`);
	}

	if (state.hasPlayground) {
		lines.push(`\tplayground: "/internal/playground",`);
	}

	lines.push(`\tsettings: "/settings",`);

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

function renderLibRoutesFile(state) {
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

function renderMarketingContentFallbackFile(state) {
	const serviceEntries = [];
	const addServiceEntry = (id, title, description, surfaceIds) => {
		serviceEntries.push(
			"\t\t\t\t{",
			`\t\t\t\t\tid: ${JSON.stringify(id)},`,
			`\t\t\t\t\ttitle: ${JSON.stringify(title)},`,
			`\t\t\t\t\tdescription: ${JSON.stringify(description)},`,
			`\t\t\t\t\tsurfaceIds: ${JSON.stringify(surfaceIds)},`,
			"\t\t\t\t},",
		);
	};

	if (state.hasDemo) {
		addServiceEntry(
			"demo",
			"Demo",
			"Browse live primitives, states, and skeletons before composing them into a product.",
			["demo", "demoPrimitives"],
		);
	}
	if (state.hasIntelligence) {
		addServiceEntry(
			"intelligence",
			"Intelligence",
			"Generate a repository map and query the right surfaces before changing shared code.",
			["intelligence"],
		);
	}
	if (state.hasPlayground) {
		addServiceEntry(
			"playground",
			"Playground",
			"Try reveal, scroll, and choreography ideas in isolation before they enter the system.",
			["playground"],
		);
	}
	addServiceEntry(
		"prune",
		"Prune",
		"Dry-run optional surfaces, then remove them without leaving stale routes or dependencies.",
		["prune"],
	);
	addServiceEntry(
		"thin-start",
		"Thin start",
		"Keep the canonical visual core in a minimal, independently verifiable workspace.",
		["thinStart"],
	);
	if (state.hasDashboard) {
		addServiceEntry(
			"full-start",
			"Full start",
			"Begin with an organization-first dashboard, complete responsive states, and product-ready operations.",
			["fullStart"],
		);
	}

	const navEntries = [
		"\t\t\t{",
		'\t\t\t\tlabel: "Home",',
		'\t\t\t\trouteId: "home",',
		"\t\t\t\tsections: [",
		"\t\t\t\t\t{",
		'\t\t\t\t\t\tlabel: "Hero",',
		'\t\t\t\t\t\thref: "/#home-hero",',
		'\t\t\t\t\t\tdescription: "Primary home page introduction.",',
		"\t\t\t\t\t},",
		"\t\t\t\t],",
		"\t\t\t},",
	];

	if (state.hasDemo) {
		navEntries.push(
			"\t\t\t{",
			'\t\t\t\tlabel: "Demo",',
			'\t\t\t\trouteId: "demo",',
			"\t\t\t\tsections: [",
			"\t\t\t\t\t{",
			'\t\t\t\t\t\tlabel: "Header",',
			'\t\t\t\t\t\thref: "/internal/demo/layout/header",',
			'\t\t\t\t\t\tdescription: "Responsive marketing header patterns.",',
			"\t\t\t\t\t},",
			"\t\t\t\t\t{",
			'\t\t\t\t\t\tlabel: "Toast",',
			'\t\t\t\t\t\thref: "/internal/demo/ui/overlays/toast",',
			'\t\t\t\t\t\tdescription: "Transient feedback examples.",',
			"\t\t\t\t\t},",
			"\t\t\t\t],",
			"\t\t\t},",
		);
	}

	if (state.hasIntelligence) {
		navEntries.push(
			"\t\t\t{",
			'\t\t\t\tlabel: "Intelligence",',
			'\t\t\t\trouteId: "intelligence",',
			"\t\t\t\tsections: [",
			"\t\t\t\t\t{",
			'\t\t\t\t\t\tlabel: "Concept map",',
			'\t\t\t\t\t\thref: "/internal/intelligence",',
			'\t\t\t\t\t\tdescription: "Generated template intelligence overview.",',
			"\t\t\t\t\t},",
			"\t\t\t\t],",
			"\t\t\t},",
		);
	}

	if (state.hasPlayground) {
		navEntries.push(
			"\t\t\t{",
			'\t\t\t\tlabel: "Playground",',
			'\t\t\t\trouteId: "playground",',
			"\t\t\t\tsections: [",
			"\t\t\t\t\t{",
			'\t\t\t\t\t\tlabel: "Motion QA",',
			'\t\t\t\t\t\thref: "/internal/playground/motion",',
			'\t\t\t\t\t\tdescription: "Motion system QA playground.",',
			"\t\t\t\t\t},",
			"\t\t\t\t],",
			"\t\t\t},",
		);
	}

	navEntries.push('\t\t\t{ label: "Settings", routeId: "settings" },');

	if (state.hasDictionary) {
		navEntries.push('\t\t\t{ label: "Dictionary", routeId: "dictionary" },');
	}

	if (state.hasReference) {
		navEntries.push('\t\t\t{ label: "Reference", routeId: "reference" },');
	}

	const footerNavEntries = ['\t\t\t{ label: "Home", routeId: "home" },'];
	if (state.hasDemo) {
		footerNavEntries.push('\t\t\t{ label: "Demo", routeId: "demo" },');
	}
	if (state.hasIntelligence) {
		footerNavEntries.push(
			'\t\t\t{ label: "Intelligence", routeId: "intelligence" },',
		);
	}
	if (state.hasPlayground) {
		footerNavEntries.push(
			'\t\t\t{ label: "Playground", routeId: "playground" },',
		);
	}
	footerNavEntries.push('\t\t\t{ label: "Settings", routeId: "settings" },');
	if (state.hasDictionary) {
		footerNavEntries.push(
			'\t\t\t{ label: "Dictionary", routeId: "dictionary" },',
		);
	}
	if (state.hasReference) {
		footerNavEntries.push(
			'\t\t\t{ label: "Reference", routeId: "reference" },',
		);
	}

	const templateMenuLinks = [];
	if (state.hasDemo) {
		templateMenuLinks.push('\t\t\t\t\t{ label: "Demo", routeId: "demo" },');
	}
	if (state.hasIntelligence) {
		templateMenuLinks.push(
			'\t\t\t\t\t{ label: "Intelligence", routeId: "intelligence" },',
		);
	}
	if (state.hasPlayground) {
		templateMenuLinks.push(
			'\t\t\t\t\t{ label: "Playground", routeId: "playground" },',
		);
	}
	if (state.hasDictionary) {
		templateMenuLinks.push(
			'\t\t\t\t\t{ label: "Dictionary", routeId: "dictionary" },',
		);
	}
	if (state.hasReference) {
		templateMenuLinks.push(
			'\t\t\t\t\t{ label: "Reference", routeId: "reference" },',
		);
	}

	const menuGroups = [
		"\t\t\t{",
		'\t\t\t\tlabel: "Start",',
		'\t\t\t\tlink: { label: "Home", routeId: "home" },',
		"\t\t\t\tlinks: [",
		'\t\t\t\t\t{ label: "Hero", href: "/#home-hero" },',
		'\t\t\t\t\t{ label: "Settings", routeId: "settings" },',
		"\t\t\t\t],",
		"\t\t\t},",
	];

	if (templateMenuLinks.length > 0) {
		menuGroups.push(
			"\t\t\t{",
			'\t\t\t\tlabel: "Template",',
			"\t\t\t\tlinks: [",
			...templateMenuLinks,
			"\t\t\t\t],",
			"\t\t\t},",
		);
	}

	const topNavEntries = ['\t\t\t{ label: "Home", routeId: "home" },'];
	if (state.hasDemo) {
		topNavEntries.push('\t\t\t{ label: "Demo", routeId: "demo" },');
	}
	if (state.hasIntelligence) {
		topNavEntries.push(
			'\t\t\t{ label: "Intelligence", routeId: "intelligence" },',
		);
	}
	topNavEntries.push('\t\t\t{ label: "Settings", routeId: "settings" },');

	return [
		"import type {",
		"\tMarketingPageDocument,",
		"\tMarketingPageSlug,",
		"\tSiteLayoutDocument,",
		'} from "./types";',
		"",
		"export const fallbackHomePage: MarketingPageDocument = {",
		'\tslug: "home",',
		'\ttitle: "Home",',
		"\tlayout: [",
		"\t\t{",
		'\t\t\tid: "home-hero",',
		'\t\t\tblockType: "homeHero",',
		'\t\t\theadline: "A design system built for full control.",',
		"\t\t\tdescriptions: [",
		"\t\t\t\t{",
		'\t\t\t\t\ttext: "Compose pages from shared primitives, motion, and layout building blocks so every screen stays consistent, adaptable, and easy to extend.",',
		"\t\t\t\t},",
		"\t\t\t],",
		"\t\t\tcta: {",
		'\t\t\t\tlabel: "Contact",',
		'\t\t\t\thref: "/contact",',
		"\t\t\t},",
		"\t\t\tservices: [",
		...serviceEntries,
		"\t\t\t],",
		"\t\t},",
		"\t],",
		"};",
		"",
		"export const fallbackMarketingPages = {",
		"\thome: fallbackHomePage,",
		"} satisfies Record<MarketingPageSlug, MarketingPageDocument>;",
		"",
		"export const fallbackSiteLayout: SiteLayoutDocument = {",
		"\theader: {",
		"\t\tcta: {",
		'\t\t\tlabel: "Join Now",',
		'\t\t\thref: "/contact",',
		"\t\t},",
		"\t\tmenuGroups: [",
		...menuGroups,
		"\t\t],",
		"\t\tmobile: {",
		'\t\t\tcloseAriaLabel: "Close navigation",',
		'\t\t\tmenuLabel: "Menu",',
		'\t\t\topenAriaLabel: "Open navigation",',
		"\t\t},",
		"\t\tnavLinks: [",
		...navEntries,
		"\t\t],",
		"\t\tsearch: {",
		'\t\t\tariaLabel: "Search pages",',
		'\t\t\tclearLabel: "Clear",',
		'\t\t\tnoResultsText: "No matching pages",',
		"\t\t},",
		"\t\tsearchGroups: [",
		...menuGroups,
		"\t\t],",
		"\t\ttopNavLinks: [",
		...topNavEntries,
		"\t\t],",
		"\t},",
		"\tfooter: {",
		"\t\tnavLinks: [",
		...footerNavEntries,
		"\t\t],",
		"\t},",
		"\tsocialLinks: [",
		"\t\t\t{",
		'\t\t\t\tlabel: "X",',
		'\t\t\t\ticon: "x",',
		'\t\t\t\thref: "",',
		"\t\t\t},",
		"\t\t\t{",
		'\t\t\t\tlabel: "Instagram",',
		'\t\t\t\ticon: "instagram",',
		'\t\t\t\thref: "",',
		"\t\t\t},",
		"\t\t\t{",
		'\t\t\t\tlabel: "LinkedIn",',
		'\t\t\t\ticon: "linked-in",',
		'\t\t\t\thref: "",',
		"\t\t\t},",
		"\t\t\t{",
		'\t\t\t\tlabel: "Meta",',
		'\t\t\t\ticon: "meta",',
		'\t\t\t\thref: "",',
		"\t\t\t},",
		"\t\t\t{",
		'\t\t\t\tlabel: "You Tube",',
		'\t\t\t\ticon: "youtube",',
		'\t\t\t\thref: "",',
		"\t\t\t},",
		"\t],",
		"};",
		"",
	].join("\n");
}

function renderNextConfigFile(state) {
	if (state.hasPayload) return null;

	return [
		'import { networkInterfaces } from "node:os";',
		'import type { NextConfig } from "next";',
		'import { PHASE_DEVELOPMENT_SERVER } from "next/constants";',
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
		"\tconst isValidUserDistDir =",
		'\t\tdistDir === ".next-user" || /^\\.next-user-\\d{4}$/.test(distDir);',
		"\tconst isValidAgentDistDir = /^\\.next-agent-\\d{4}$/.test(distDir);",
		"",
		"\tif (!isValidUserDistDir && !isValidAgentDistDir) {",
		"\t\tthrow new Error(",
		'\t\t\t"NEXT_DEV_DIST_DIR must be .next-user, .next-user-<port>, or .next-agent-<port>.",',
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
		'\tprocess.env.NODE_ENV === "development";',
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
		"\tturbopack: {",
		"\t\trules: getCodeInspectorRules(phase),",
		"\t},",
		"});",
		"",
		"export default createNextConfig;",
		"",
	].join("\n");
}

function renderTsconfigFile(state) {
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

function renderApiIndexFile(state) {
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

function getSmokeRoutes(state) {
	const routes = ["/"];

	if (state.hasIntelligence) {
		routes.push("/internal/intelligence");
	}

	routes.push("/api/health");

	return routes;
}

function renderVerifySmokeFile(state) {
	const routes = JSON.stringify(getSmokeRoutes(state));

	return [
		"#!/usr/bin/env node",
		"",
		"import {",
		"\tstartLocalProductionServer,",
		"\tstopServer,",
		'} from "./_lib/local-production-preview.mjs";',
		"",
		"const REQUEST_TIMEOUT_MS = 10_000;",
		`const ROUTES = ${routes};`,
		'const ROUTE_STATUS_OVERRIDES = new Map([["/api/health", new Set([200, 503])]]);',
		"",
		"const fetchWithTimeout = async (url) => {",
		"\tconst controller = new AbortController();",
		"\tconst timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);",
		"",
		"\ttry {",
		"\t\treturn await fetch(url, {",
		'\t\t\tredirect: "manual",',
		"\t\t\tsignal: controller.signal,",
		"\t\t});",
		"\t} finally {",
		"\t\tclearTimeout(timeout);",
		"\t}",
		"};",
		"",
		"const validateResponse = async (baseUrl, route) => {",
		"\tconst url = new URL(route, baseUrl);",
		"\tconst response = await fetchWithTimeout(url);",
		"\tconst acceptedStatuses = ROUTE_STATUS_OVERRIDES.get(route);",
		"\tconst statusIsOk = acceptedStatuses",
		"\t\t? acceptedStatuses.has(response.status)",
		"\t\t: response.status >= 200 && response.status < 400;",
		"",
		"\tif (!statusIsOk) {",
		"\t\tthrow new Error(`${route} returned HTTP ${response.status}.`);",
		"\t}",
		"",
		"\tif (response.status >= 300 && response.status < 400) {",
		'\t\tconst location = response.headers.get("location");',
		"\t\tif (!location) {",
		"\t\t\tthrow new Error(`${route} redirected without a Location header.`);",
		"\t\t}",
		"",
		"\t\tconsole.log(`ok ${route} ${response.status} -> ${location}`);",
		"\t\treturn;",
		"\t}",
		"",
		"\tconst body = await response.text();",
		"\tif (body.trim().length === 0) {",
		"\t\tthrow new Error(`${route} returned an empty response body.`);",
		"\t}",
		"",
		'\tconst contentType = response.headers.get("content-type") ?? "";',
		"\tif (",
		'\t\tcontentType.includes("text/html") &&',
		'\t\t!body.toLowerCase().includes("<html")',
		"\t) {",
		"\t\tthrow new Error(`${route} returned HTML without a document marker.`);",
		"\t}",
		"",
		"\tconsole.log(`ok ${route} ${response.status}`);",
		"};",
		"",
		"const start = async () => {",
		"\tconst { baseUrl, child } = await startLocalProductionServer({",
		"\t\tenv: {",
		'\t\t\tTEMPLATE_INTERNAL_ROUTES: "enabled",',
		"\t\t},",
		"\t});",
		"",
		"\ttry {",
		"\t\tconsole.log(`Starting smoke server at ${baseUrl}`);",
		"\t\tfor (const route of ROUTES) {",
		"\t\t\tawait validateResponse(baseUrl, route);",
		"\t\t}",
		"",
		'\t\tconsole.log("Smoke verification passed.");',
		"\t} finally {",
		"\t\tawait stopServer(child);",
		"\t}",
		"};",
		"",
		"start().catch((error) => {",
		"\tconsole.error(error instanceof Error ? error.message : error);",
		"\tprocess.exit(1);",
		"});",
		"",
	].join("\n");
}

function getRewriteTargets(state) {
	const targets = [
		{
			path: "src/config/routes.ts",
			content: renderRoutesFile(state),
		},
		{
			path: "src/lib/routes.ts",
			content: renderLibRoutesFile(state),
		},
		{
			path: "src/lib/api/index.ts",
			content: renderApiIndexFile(state),
		},
		{
			path: "src/lib/marketing-content/fallback.ts",
			content: renderMarketingContentFallbackFile(state),
		},
		{
			path: "scripts/verify/verify-smoke.mjs",
			content: renderVerifySmokeFile(state),
		},
	];

	const nextConfigContent = renderNextConfigFile(state);
	if (nextConfigContent) {
		targets.push({
			path: "next.config.ts",
			content: nextConfigContent,
		});
	}

	const tsconfigContent = renderTsconfigFile(state);
	if (tsconfigContent) {
		targets.push({
			path: "tsconfig.json",
			content: tsconfigContent,
		});
	}

	return targets;
}

async function writeFileIfChanged(targetPath, content, options = {}) {
	const absolutePath = path.join(ROOT, targetPath);
	const nextContent = content.endsWith("\n") ? content : `${content}\n`;
	let current = "";

	try {
		current = await fs.readFile(absolutePath, "utf8");
	} catch (error) {
		if (options.optional && error?.code === "ENOENT") {
			return false;
		}

		throw error;
	}

	if (current === nextContent) return false;

	await fs.writeFile(absolutePath, nextContent, "utf8");
	return true;
}

async function deleteOwnedPaths(targetPaths) {
	for (const targetPath of targetPaths) {
		await fs.rm(targetPath, { recursive: true, force: true });
	}
}

async function removeEmptyInternalDirIfNeeded(shouldRemove) {
	if (!shouldRemove) return;
	if (!(await pathExists(INTERNAL_MARKETING_DIR))) return;

	const children = await fs.readdir(INTERNAL_MARKETING_DIR);
	if (children.length === 0) {
		await fs.rm(INTERNAL_MARKETING_DIR, { recursive: true, force: true });
	}
}

async function removePackageDependencies(dependencyNames) {
	if (dependencyNames.length === 0) return false;

	const packageJsonPath = path.join(ROOT, "package.json");
	const raw = await fs.readFile(packageJsonPath, "utf8");
	const pkg = JSON.parse(raw);
	let changed = false;

	for (const dependencyName of dependencyNames) {
		if (pkg.dependencies?.[dependencyName]) {
			delete pkg.dependencies[dependencyName];
			changed = true;
		}

		if (pkg.devDependencies?.[dependencyName]) {
			delete pkg.devDependencies[dependencyName];
			changed = true;
		}
	}

	if (!changed) return false;

	await fs.writeFile(
		packageJsonPath,
		`${JSON.stringify(pkg, null, "\t")}\n`,
		"utf8",
	);

	return true;
}

async function removePackageScripts(scriptNames) {
	if (scriptNames.length === 0) return false;

	const packageJsonPath = path.join(ROOT, "package.json");
	const raw = await fs.readFile(packageJsonPath, "utf8");
	const pkg = JSON.parse(raw);
	let changed = false;

	for (const scriptName of scriptNames) {
		if (pkg.scripts?.[scriptName]) {
			delete pkg.scripts[scriptName];
			changed = true;
		}
	}

	if (!changed) return false;

	await fs.writeFile(
		packageJsonPath,
		`${JSON.stringify(pkg, null, "\t")}\n`,
		"utf8",
	);

	return true;
}

function refreshPackageLock() {
	const result = spawnSync(
		"npm",
		["install", "--package-lock-only", "--ignore-scripts"],
		{
			cwd: ROOT,
			stdio: "inherit",
			shell: process.platform === "win32",
		},
	);

	if (result.status !== 0) {
		throw new Error("Package lock refresh failed after pruning dependencies.");
	}
}

async function runFormatter(filePaths) {
	const existingFiles = [];

	for (const filePath of filePaths) {
		if (await pathExists(path.join(ROOT, filePath))) {
			existingFiles.push(filePath);
		}
	}

	if (existingFiles.length === 0) return;

	const result = spawnSync(
		"npm",
		["run", "lint", "--", "--write", ...existingFiles],
		{
			cwd: ROOT,
			stdio: "inherit",
			shell: process.platform === "win32",
		},
	);

	if (result.status !== 0) {
		throw new Error("Post-prune formatting and import fixes failed.");
	}
}

async function walkFiles(targetDir) {
	const entries = await fs.readdir(targetDir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const absolutePath = path.join(targetDir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkFiles(absolutePath)));
			continue;
		}
		files.push(absolutePath);
	}

	return files;
}

async function validateRemovedSurfaceReferences(surfaceIds) {
	if (surfaceIds.length === 0) return;

	const files = (await walkFiles(SRC_DIR)).filter((filePath) =>
		/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath),
	);

	const failures = [];

	for (const surfaceId of surfaceIds) {
		for (const assertion of SURFACES[surfaceId].postRemovalAssertions) {
			for (const filePath of files) {
				const content = await fs.readFile(filePath, "utf8");
				const pattern = new RegExp(
					assertion.pattern.source,
					assertion.pattern.flags,
				);

				if (!pattern.test(content)) continue;
				failures.push({
					surfaceId,
					label: assertion.label,
					filePath,
				});
			}
		}
	}

	if (failures.length === 0) return;

	console.error("\nUnresolved references remain after pruning:");
	for (const failure of failures) {
		console.error(
			`- [${failure.surfaceId}] ${failure.label}: ${relativePath(failure.filePath)}`,
		);
	}

	throw new Error("Prune validation failed.");
}

function printPlan(plan) {
	console.log("\nTemplate prune plan");
	console.log("===================");

	for (const surface of plan.surfaces) {
		console.log(`- ${surface.flag}: ${surface.description}`);
		if (surface.dependentSurfaces.length > 0) {
			console.log(`  dependencies: ${surface.dependentSurfaces.join(", ")}`);
		}
	}

	console.log("\nFiles/directories to delete");
	if (plan.deletedPaths.length === 0) {
		console.log("- none");
	} else {
		for (const targetPath of plan.deletedPaths) {
			console.log(`- ${relativePath(targetPath)}`);
		}
	}

	if (plan.removeInternalDir) {
		console.log(
			`- ${relativePath(INTERNAL_MARKETING_DIR)} (if empty after prune)`,
		);
	}

	console.log("\nCentral files to rewrite");
	for (const filePath of [...plan.rewriteFiles, ...plan.markerFiles]) {
		console.log(`- ${filePath}`);
	}

	if (plan.packageDependencies.length > 0) {
		console.log("\nPackage dependencies to remove");
		for (const dependencyName of plan.packageDependencies) {
			console.log(`- ${dependencyName}`);
		}
		console.log("- package-lock.json (refreshed)");
	}

	if (plan.packageScripts.length > 0) {
		console.log("\nPackage scripts to remove");
		for (const scriptName of plan.packageScripts) {
			console.log(`- ${scriptName}`);
		}
	}

	console.log("\nWarnings");
	console.log("- formatter/import fixes run after mutation");
	console.log("- unresolved reference validation runs after mutation");
	console.log("- build validation runs after mutation");
}

async function confirmMutation() {
	const rl = createInterface({ input, output });

	try {
		const answer = await rl.question(
			"This mutates the current cloned repo by deleting optional surfaces. Continue? [y/N] ",
		);
		return /^(y|yes)$/i.test(answer.trim());
	} finally {
		rl.close();
	}
}

function runBuild() {
	const result = spawnSync("npm", ["run", "build"], {
		cwd: ROOT,
		stdio: "inherit",
		shell: process.platform === "win32",
	});

	if (result.status !== 0) {
		throw new Error("Build failed after pruning.");
	}
}

async function main() {
	const parsed = parseArgs(process.argv.slice(2));

	if (parsed.help) {
		printUsage();
		return;
	}

	if (parsed.surfaceIds.length === 0) {
		printUsage();
		console.log("No prune flags provided. Nothing to do.");
		return;
	}

	const pkg = await assertTemplateShape();
	warnCanonicalTemplateMainPrune(pkg, parsed);
	assertTemplateRootMutationAllowed(pkg, parsed);

	const state = buildState(parsed.surfaceIds);
	const plan = await collectPlan(parsed.surfaceIds);

	printPlan(plan);

	if (parsed.dryRun) {
		console.log("\nDry run complete. No files were changed.");
		return;
	}

	if (!parsed.yes) {
		const confirmed = await confirmMutation();
		if (!confirmed) {
			throw new Error("Aborted by user.");
		}
	}

	await deleteOwnedPaths(plan.deletedPaths);
	await stripSurfaceMarkers(plan.markerFiles, parsed.surfaceIds);

	if (plan.rewriteCentral) {
		for (const target of getRewriteTargets(state)) {
			await writeFileIfChanged(target.path, target.content, {
				optional: target.optional,
			});
		}
	}

	await removeEmptyInternalDirIfNeeded(plan.removeInternalDir);

	const packageJsonChanged = await removePackageDependencies(
		plan.packageDependencies,
	);
	await removePackageScripts(plan.packageScripts);
	if (packageJsonChanged) {
		refreshPackageLock();
	}

	await runFormatter([...plan.rewriteFiles, ...plan.markerFiles]);
	await validateRemovedSurfaceReferences(parsed.surfaceIds);
	runBuild();

	console.log("\nTemplate prune completed successfully.");
}

main().catch((error) => {
	console.error(`\n${error.message}`);
	process.exit(1);
});
