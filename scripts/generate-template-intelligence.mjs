#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, ".template-intelligence");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "index.json");
const AGENT_MAP_PATH = path.join(OUTPUT_DIR, "agent-map.json");

const EXCLUDED_DIRS = new Set([
	".git",
	".next",
	".next-user",
	".next-preview",
	".serena",
	".template-intelligence",
	".understand-anything",
	".vercel",
	".worktrees",
	"build",
	"coverage",
	"node_modules",
	"out",
]);

const EXCLUDED_FILE_PATTERNS = [
	/^\.env(?:\.|$)/,
	/^next-env\.d\.ts$/,
	/^tsconfig\.next-.*\.json$/,
	/\.pem$/,
	/\.log$/,
	/\.tsbuildinfo$/,
];

const INCLUDED_ROOTS = [
	"AGENTS.md",
	"README.md",
	"docs",
	"payload.config.ts",
	"scripts/create-template-profile.mjs",
	"scripts/dev-server.mjs",
	"scripts/generate-template-intelligence.mjs",
	"scripts/verify/AGENTS.md",
	"src/app/(payload)",
	"src/app/(site)/(marketing)",
	"src/components",
	"src/config/surfaces.ts",
	"src/lib",
	"src/payload",
];

const CONCEPTS = [
	{
		id: "agent-navigation",
		title: "Agent Navigation",
		summary:
			"Rules, routes, and docs that help agents find the right template surface before editing.",
		matches: [
			"AGENTS.md",
			"README.md",
			"src/config/surfaces.ts",
			"src/lib/routes.ts",
			"scripts/dev-server.mjs",
		],
		keywords: ["agent", "route", "workflow", "dev server", "preview"],
	},
	{
		id: "design-system-discovery",
		title: "Design System Discovery",
		summary:
			"Shared primitives, composites, domain components, demos, and dictionary entries that should be reused before local UI is invented.",
		matches: [
			"src/components",
			"src/app/(site)/(dev)/internal/demo",
			"src/app/(site)/(dev)/internal/dictionary",
		],
		keywords: ["component", "primitive", "demo", "dictionary", "ui"],
	},
	{
		id: "internal-knowledge-base",
		title: "Internal Knowledge Base",
		summary:
			"Maintainer-facing docs, references, demos, and source notes that explain how the template is meant to be extended.",
		matches: [
			"docs",
			"src/app/(site)/(dev)/internal/demo",
			"src/app/(site)/(dev)/internal/dictionary",
			"src/app/(site)/(dev)/internal/reference",
			"src/app/(site)/(dev)/internal/playground",
		],
		keywords: ["docs", "reference", "demo", "dictionary", "playground"],
	},
	{
		id: "content-architecture",
		title: "Content Architecture",
		summary:
			"Lightweight render contracts and resolver boundaries for static, Payload-ready, and Payload-powered modes.",
		matches: [
			"src/lib/marketing-content/AGENTS.md",
			"docs/guides/payload-vercel-neon-blob.md",
			"src/lib/marketing-content",
		],
		keywords: ["content", "payload", "resolver", "section", "fallback"],
	},
	{
		id: "payload-scaffold",
		title: "Payload Scaffold",
		summary:
			"Guarded CMS scaffolding that stays inactive until a clone intentionally becomes Payload-powered.",
		matches: [
			"payload.config.ts",
			"src/payload",
			"src/app/(payload)",
			"docs/guides/payload-vercel-neon-blob.md",
		],
		keywords: ["payload", "cms", "admin", "collection", "media"],
	},
	{
		id: "template-assembly",
		title: "Template Assembly",
		summary:
			"Positive profiles, content capabilities, and ownership rules that assemble clean project workspaces.",
		matches: [
			"scripts/create-template-profile.mjs",
			"scripts/verify/verify-smoke.mjs",
			"template-assembly",
			"template-profiles",
			"template-surfaces",
			"README.md",
			"template-assembly/AGENTS.md",
			"src/config/surfaces.ts",
			"src/lib/marketing-content/fallback.ts",
		],
		keywords: ["assemble", "profile", "content", "surface", "template"],
	},
	{
		id: "dashboard-reference-entities",
		title: "Dashboard Reference Entities",
		summary:
			"Dashboard-owned member and record presentation examples with fetch-free factories, live/skeleton parity, fixture CRUD, and explicit assembly ownership.",
		matches: [
			"src/app/(site)/dashboard/_lib/entities/AGENTS.md",
			"src/app/(site)/dashboard/_lib/entities",
			"src/app/(site)/dashboard/_components/entities",
			"src/app/(site)/dashboard/reference/entities",
			"scripts/verify/verify-reference-entities.ts",
		],
		keywords: [
			"entity",
			"presentation",
			"member",
			"record",
			"skeleton",
			"dashboard.reference-entities",
		],
	},
	{
		id: "dev-workflow",
		title: "Dev Workflow",
		summary:
			"Isolated user and agent development server behavior, build wrappers, and generated local artifacts.",
		matches: ["AGENTS.md", "scripts/dev-server.mjs", "package.json"],
		keywords: ["dev", "dev:preview", "automation url", "distDir", "port"],
	},
	{
		id: "route-surfaces",
		title: "Route Surfaces",
		summary:
			"Public, internal, dashboard, auth, and Payload route families exposed by the App Router tree.",
		matches: ["src/app", "src/config/surfaces.ts", "src/lib/routes.ts"],
		keywords: ["route", "layout", "page", "dashboard", "internal"],
	},
];

const AGENT_MAP = {
	schemaVersion: 1,
	project: "averlo-next-template",
	generator: "scripts/generate-template-intelligence.mjs",
	artifact: ".template-intelligence/agent-map.json",
	topics: [
		{
			id: "route-architecture",
			title: "Route and internal marketing architecture",
			aliases: ["routes", "internal-marketing", "marketing-routes"],
			paths: [
				"src/config/surfaces.ts",
				"src/lib/routes.ts",
				"src/app/(site)/(dev)/internal/layout.tsx",
				"src/app/(site)/(marketing)/layout.tsx",
				"src/lib/marketing-content/fallback.ts",
				"src/lib/marketing-content/types.ts",
				"src/lib/marketing-content/resolvers.ts",
				"template-assembly/project-files.mjs",
			],
			notes:
				"Installed route surfaces compose separate marketing, auth, and dashboard registries through a shared base contract. hrefFor resolves static surface IDs, surfaceHref builds parameterized destinations, and internal developer routes remain outside the product surface model.",
		},
		{
			id: "ui-primitives",
			title: "Shared UI component conventions and primitives",
			aliases: [
				"design-system",
				"component-conventions",
				"forms",
				"feedback",
				"status-message",
				"skeleton",
				"toast",
				"confirmation",
				"modal",
			],
			paths: [
				"docs/guides/components/README.md",
				"docs/guides/components/composition-and-public-apis.md",
				"docs/guides/components/forms-and-submission.md",
				"docs/guides/components/feedback-and-status.md",
				"docs/guides/components/loading-and-async-states.md",
				"docs/guides/components/overlays-and-confirmation.md",
				"docs/guides/components/interaction-and-responsive-rendering.md",
				"docs/guides/components/surfaces-and-presentation.md",
				"src/components/AGENTS.md",
				"src/components/ui/AGENTS.md",
				"src/components/ui/primitives/AGENTS.md",
				"src/components/ui/overlays/modal/AGENTS.md",
				"src/components/ui/overlays/toast/AGENTS.md",
				"src/lib/feedback/toast.ts",
				"src/components/ui/overlays/toast/ToastHost.tsx",
				"src/components/ui/overlays/modal/useConfirmationModal.tsx",
				"src/components/ui/overlays/modal/ConfirmationModal.tsx",
			],
			notes:
				"Start with the component convention index and the guide matching the UX decision. Then read the nearest AGENTS file and inspect concrete owners only when implementation details are needed.",
		},
		{
			id: "frontend-imports",
			title: "Frontend public import boundaries",
			aliases: [
				"imports",
				"barrels",
				"component-entrypoints",
				"input-api",
				"misc-api",
			],
			paths: [
				"src/components/AGENTS.md",
				"src/components/ui/AGENTS.md",
				"src/components/ui/input/AGENTS.md",
				"src/components/ui/input/index.ts",
				"src/components/ui/misc/AGENTS.md",
				"src/components/ui/misc/index.ts",
				"template-profiles/thin-start/overrides/src/components/ui/input/index.ts",
				"template-profiles/thin-start/overrides/src/components/ui/misc/index.ts",
				"template-profiles/thin-start/manifest.mjs",
			],
			notes:
				"Application and feature consumers use curated family entrypoints while family internals and lower-level dependency edges import direct owners. Full and thin profiles maintain deliberate barrel parity without exposing removed capabilities.",
		},
		{
			id: "assembly-behavior",
			title: "Positive assembly and surface ownership",
			aliases: [
				"assembly",
				"profiles",
				"optional-surfaces",
				"project-generation",
			],
			paths: [
				"scripts/create-template-profile.mjs",
				"scripts/verify/AGENTS.md",
				"scripts/verify/verify-template-profiles.mjs",
				"template-assembly/assembler.mjs",
				"template-assembly/AGENTS.md",
				"template-assembly/project-files.mjs",
				"template-profiles/thin-start/manifest.mjs",
				"scripts/review-thin-start-api.mjs",
				"README.md",
				"template-profiles/thin-start/AGENTS.md",
				"scripts/verify/verify-smoke.mjs",
				"src/config/surfaces.ts",
				"src/lib/surfaces/routeSurface.ts",
				"src/lib/routes.ts",
				"src/lib/marketing-content/fallback.ts",
			],
			notes:
				"Profiles positively select owned route and developer surfaces, then choose static or Payload-ready content where supported. Generated projects omit all template machinery. Ownership for paths, docs, scripts, dependencies, and generated configuration fails closed when unclassified.",
		},
		{
			id: "frontend-entity-system",
			title: "Dashboard-owned frontend entity system",
			aliases: [
				"entity-presentation",
				"reference-entities",
				"frontend-entity-policy",
			],
			paths: [
				"src/app/(site)/dashboard/_lib/entities/AGENTS.md",
				"src/app/(site)/dashboard/_lib/AGENTS.md",
				"src/app/(site)/dashboard/_components/entities/AGENTS.md",
				"src/app/(site)/dashboard/_lib/presentation/contracts.ts",
				"src/app/(site)/dashboard/_lib/entities/member/presentation.ts",
				"src/app/(site)/dashboard/_lib/entities/record/presentation.ts",
				"src/app/(site)/dashboard/reference/entities/page.tsx",
			],
			notes:
				"Routes and adapters own data, authorization, persistence, and mutation. Presentation factories stay React-free and fetch-free; renderers import their owning factory directly and keep live/skeleton parity. Repository policy supersedes user-level skills.",
		},
		{
			id: "content-modes",
			title: "Static, Payload-ready, and Payload-powered boundaries",
			aliases: ["payload", "content-architecture", "cms"],
			paths: [
				"src/lib/marketing-content/AGENTS.md",
				"src/payload/AGENTS.md",
				"docs/guides/payload-vercel-neon-blob.md",
				"src/lib/marketing-content/resolvers.ts",
				"src/lib/marketing-content/types.ts",
				"src/lib/marketing-content/fallback.ts",
				"payload.config.ts",
				"src/payload/isPayloadConfigured.ts",
				"src/app/(payload)/api/[...slug]/route.ts",
				"src/app/(payload)/admin/[[...segments]]/page.tsx",
				"template-assembly/project-files.mjs",
			],
			notes:
				"Frontend contracts stay lightweight; Payload-specific fields should be resolved server-side before section rendering.",
		},
		{
			id: "dev-server",
			title: "Agent dev-server isolation",
			aliases: ["dev-workflow", "dev-agent", "agent-server"],
			paths: [
				"AGENTS.md",
				"package.json",
				"scripts/dev-server.mjs",
				"next.config.ts",
				".gitignore",
				"template-assembly/assembler.mjs",
			],
			notes:
				"Use npm run dev for isolated prewarmed previews. dev:agent and dev:user remain compatibility aliases; use the automation URL query flags for automated traversal.",
		},
		{
			id: "intelligence-benchmark",
			title: "Template Intelligence benchmark evidence and recording",
			aliases: [
				"benchmark",
				"recording",
				"graphify",
				"template-serena",
				"template-map",
			],
			paths: [
				"docs/guides/template-intelligence.md",
				"scripts/run-template-intelligence-benchmark.mjs",
				"scripts/run-template-intelligence-hybrid.mjs",
				"scripts/lib/template-intelligence-benchmark.mjs",
				"scripts/record-template-intelligence-benchmark.mjs",
				"scripts/clear-template-intelligence-benchmark.mjs",
				"scripts/verify/verify-template-intelligence-benchmark.mjs",
				"src/lib/template-intelligence/artifacts.ts",
				"src/lib/template-intelligence/benchmark-runs.ts",
				"src/lib/template-intelligence/codex-turn-recording.ts",
				"src/app/(site)/(dev)/internal/intelligence/page.tsx",
			],
			notes:
				"Trusted Codex hooks record privacy-safe session and turn metadata automatically in ignored local state. Curated legacy observations and visual fixtures remain separate and are never ranked as automatic comparative evidence.",
		},
		{
			id: "new-internal-surface",
			title: "New internal authoring surface placement",
			aliases: ["internal-surface", "authoring-surface", "new-surface"],
			paths: [
				"src/app/(site)/(dev)/internal/layout.tsx",
				"src/config/surfaces.ts",
				"src/lib/routes.ts",
				"src/lib/marketing-content/fallback.ts",
				"template-surfaces/index.mjs",
				"README.md",
			],
			notes:
				"Add template-maintainer tools under /internal so they inherit noindex and the client-project production guard; classify their positive assembly ownership and package requirements before adding them to a profile.",
		},
	],
};

function normalizeTopic(value) {
	return value.trim().toLowerCase();
}

function findAgentMapTopic(query) {
	const normalizedQuery = normalizeTopic(query);

	return AGENT_MAP.topics.find(
		(topic) =>
			topic.id === normalizedQuery ||
			normalizeTopic(topic.title) === normalizedQuery ||
			topic.aliases.some((alias) => alias === normalizedQuery),
	);
}

function printAgentMapTopic(query) {
	const topic = findAgentMapTopic(query);

	if (!topic) {
		console.error(`Unknown intelligence topic: ${query}`);
		console.error(
			`Available topics: ${AGENT_MAP.topics.map((item) => item.id).join(", ")}`,
		);
		process.exit(1);
	}

	console.log(`${topic.title} (${topic.id})`);
	console.log(topic.notes);
	console.log("");
	console.log("Start here:");
	for (const filePath of topic.paths) {
		console.log(`- ${filePath}`);
	}
}

function toPosixPath(filePath) {
	return filePath.split(path.sep).join("/");
}

function isExcludedFile(fileName) {
	return EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(fileName));
}

function isUnderIncludedRoot(relativePath) {
	return INCLUDED_ROOTS.some(
		(root) => relativePath === root || relativePath.startsWith(`${root}/`),
	);
}

async function pathExists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

async function walk(targetDir) {
	const entries = await fs.readdir(targetDir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const absolutePath = path.join(targetDir, entry.name);
		const relativePath = toPosixPath(path.relative(ROOT, absolutePath));

		if (entry.isDirectory()) {
			if (EXCLUDED_DIRS.has(entry.name) || entry.name.startsWith(".next")) {
				continue;
			}

			files.push(...(await walk(absolutePath)));
			continue;
		}

		if (!entry.isFile() || isExcludedFile(entry.name)) {
			continue;
		}

		if (isUnderIncludedRoot(relativePath)) {
			files.push(absolutePath);
		}
	}

	return files;
}

function getSourceType(relativePath) {
	if (relativePath.endsWith("AGENTS.md")) return "agent-rules";
	if (relativePath.startsWith("docs/")) return "docs";
	if (relativePath.startsWith("scripts/")) return "script";
	if (relativePath.startsWith("src/components/")) return "component";
	if (relativePath.startsWith("src/app/")) return "route";
	if (relativePath.startsWith("src/lib/")) return "library";
	if (
		relativePath.startsWith("src/payload/") ||
		relativePath === "payload.config.ts"
	) {
		return "payload";
	}
	if (relativePath === "README.md") return "overview";
	return "source";
}

function getTitle(relativePath, content) {
	const heading = content.match(/^#\s+(.+)$/m);
	if (heading?.[1]) return heading[1].trim();

	const fileName = path.basename(relativePath).replace(/\.[^.]+$/, "");
	return fileName
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(" ");
}

function getExcerpt(content) {
	return (
		content
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line.length > 30 && !line.startsWith("import "))
			?.slice(0, 180) ?? ""
	);
}

function getMatchedConceptIds(relativePath, content) {
	const lowerPath = relativePath.toLowerCase();
	const lowerContent = content.toLowerCase();

	return CONCEPTS.filter((concept) => {
		const pathMatched = concept.matches.some(
			(match) =>
				lowerPath === match.toLowerCase() ||
				lowerPath.startsWith(`${match.toLowerCase()}/`),
		);
		if (pathMatched) return true;

		return concept.keywords.some((keyword) =>
			lowerContent.includes(keyword.toLowerCase()),
		);
	}).map((concept) => concept.id);
}

function buildRelationships(concepts, files) {
	const fileByConcept = new Map();

	for (const concept of concepts) {
		fileByConcept.set(
			concept.id,
			new Set(
				files
					.filter((file) => file.conceptIds.includes(concept.id))
					.map((file) => file.path),
			),
		);
	}

	const relationships = [];

	for (let index = 0; index < concepts.length; index += 1) {
		for (
			let nextIndex = index + 1;
			nextIndex < concepts.length;
			nextIndex += 1
		) {
			const source = concepts[index];
			const target = concepts[nextIndex];
			const sourceFiles = fileByConcept.get(source.id) ?? new Set();
			const targetFiles = fileByConcept.get(target.id) ?? new Set();
			const sharedFiles = [...sourceFiles].filter((filePath) =>
				targetFiles.has(filePath),
			);

			if (sharedFiles.length === 0) continue;

			relationships.push({
				source: source.id,
				target: target.id,
				weight: sharedFiles.length,
				sharedFiles: sharedFiles.slice(0, 6),
			});
		}
	}

	return relationships.sort(
		(a, b) =>
			a.source.localeCompare(b.source) || a.target.localeCompare(b.target),
	);
}

async function buildIndex() {
	const files = [];

	for (const includedRoot of INCLUDED_ROOTS) {
		const absoluteRoot = path.join(ROOT, includedRoot);
		if (!(await pathExists(absoluteRoot))) continue;

		const stat = await fs.stat(absoluteRoot);
		const absoluteFiles = stat.isDirectory()
			? await walk(absoluteRoot)
			: [absoluteRoot];

		for (const absoluteFile of absoluteFiles) {
			const relativePath = toPosixPath(path.relative(ROOT, absoluteFile));
			if (isExcludedFile(path.basename(relativePath))) continue;

			const content = await fs.readFile(absoluteFile, "utf8").catch(() => "");
			const conceptIds = getMatchedConceptIds(relativePath, content);

			files.push({
				path: relativePath,
				title: getTitle(relativePath, content),
				sourceType: getSourceType(relativePath),
				size: Buffer.byteLength(content, "utf8"),
				lines: content.length === 0 ? 0 : content.split(/\r?\n/).length,
				conceptIds,
				excerpt: getExcerpt(content),
			});
		}
	}

	const uniqueFiles = [
		...new Map(files.map((file) => [file.path, file])).values(),
	].sort((a, b) => a.path.localeCompare(b.path));

	const concepts = CONCEPTS.map((concept) => ({
		id: concept.id,
		title: concept.title,
		summary: concept.summary,
		fileCount: uniqueFiles.filter((file) =>
			file.conceptIds.includes(concept.id),
		).length,
		sourceTypes: [
			...new Set(
				uniqueFiles
					.filter((file) => file.conceptIds.includes(concept.id))
					.map((file) => file.sourceType),
			),
		].sort(),
	}));

	return {
		schemaVersion: 1,
		project: "averlo-next-template",
		generator: "scripts/generate-template-intelligence.mjs",
		artifact: ".template-intelligence/index.json",
		fileCount: uniqueFiles.length,
		conceptCount: concepts.length,
		files: uniqueFiles,
		concepts,
		relationships: buildRelationships(concepts, uniqueFiles),
	};
}

const args = process.argv.slice(2);

if (args[0] === "--query") {
	const topicQuery = args[1];

	if (!topicQuery) {
		console.error("Usage: npm run intelligence:query -- <topic>");
		console.error(
			`Available topics: ${AGENT_MAP.topics.map((item) => item.id).join(", ")}`,
		);
		process.exit(1);
	}

	printAgentMapTopic(topicQuery);
	process.exit(0);
}

const getIncludedFiles = async () => {
	const files = [];

	for (const includedRoot of INCLUDED_ROOTS) {
		const absoluteRoot = path.join(ROOT, includedRoot);
		if (!(await pathExists(absoluteRoot))) continue;

		const stat = await fs.stat(absoluteRoot);
		files.push(
			...(stat.isDirectory() ? await walk(absoluteRoot) : [absoluteRoot]),
		);
	}

	return files.sort((left, right) => left.localeCompare(right));
};

const isGeneratedIndexCurrent = async () => {
	if (!(await pathExists(OUTPUT_PATH)) || !(await pathExists(AGENT_MAP_PATH))) {
		return false;
	}

	try {
		const [outputStat, mapStat, index, sourceFiles] = await Promise.all([
			fs.stat(OUTPUT_PATH),
			fs.stat(AGENT_MAP_PATH),
			fs.readFile(OUTPUT_PATH, "utf8").then(JSON.parse),
			getIncludedFiles(),
		]);
		const generatedAt = Math.min(outputStat.mtimeMs, mapStat.mtimeMs);
		const indexedPaths = [...index.files.map((file) => file.path)].sort(
			(left, right) => left.localeCompare(right),
		);
		const sourcePaths = sourceFiles.map((filePath) =>
			toPosixPath(path.relative(ROOT, filePath)),
		);

		if (
			indexedPaths.length !== sourcePaths.length ||
			indexedPaths.some((filePath, index) => filePath !== sourcePaths[index])
		) {
			return false;
		}

		const sourceStats = await Promise.all(
			sourceFiles.map((filePath) => fs.stat(filePath)),
		);

		return sourceStats.every((stat) => stat.mtimeMs <= generatedAt);
	} catch {
		return false;
	}
};

if (args[0] === "--ensure" && (await isGeneratedIndexCurrent())) {
	console.log("Template Intelligence is current.");
	process.exit(0);
}

const index = await buildIndex();

await fs.mkdir(OUTPUT_DIR, { recursive: true });
await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(index, null, "\t")}\n`);
await fs.writeFile(
	AGENT_MAP_PATH,
	`${JSON.stringify(AGENT_MAP, null, "\t")}\n`,
);

console.log(
	`Generated ${path.relative(ROOT, OUTPUT_PATH)} with ${index.fileCount} files and ${index.conceptCount} concepts.`,
);
console.log(`Generated ${path.relative(ROOT, AGENT_MAP_PATH)}.`);
