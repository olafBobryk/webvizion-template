export const assemblyGeneratedPaths = new Set([
	"AGENTS.md",
	"README.md",
	"next.config.ts",
	"package-lock.json",
	"package.json",
	"src/config/routes.ts",
	"src/lib/api/index.ts",
	"src/lib/routes.ts",
	"tsconfig.json",
]);

export const assemblyTemplateOnlyPaths = new Set([
	"docs/architecture-staging.md",
	"docs/architecture.md",
	"docs/template-content-modes.md",
	"docs/thin-start-creation-boundary.md",
	"docs/worklogs/prune-reset-hardening-handoff.md",
	"docs/worklogs/prune-reset-hardening-ledger.md",
	"docs/worklogs/template-backport-differences-ledger.md",
	"docs/worklogs/template-backport-handoff.md",
	"docs/worklogs/template-profile-setup-friction.md",
	"scripts/create-template-profile.mjs",
	"scripts/create-thin-start.mjs",
	"scripts/dev-thin.mjs",
	"scripts/generate-template-assembly-inventory.mjs",
	"scripts/prune-template.mjs",
	"scripts/review-thin-start-api.mjs",
	"scripts/verify/verify-profile-pruning.mjs",
	"scripts/verify/verify-template-profiles.mjs",
]);

export const assemblyTemplateOnlyRoots = [
	"template-assembly",
	"template-profiles",
	"template-surfaces",
];

export const assemblyCoreRoots = [
	".env.example",
	".gitignore",
	".vercelignore",
	".vscode",
	"biome.json",
	"docs",
	"next-sitemap.config.js",
	"postcss.config.mjs",
	"public",
	"scripts",
	"src",
];

export const assemblyTemplateOnlyScripts = new Set([
	"create:project",
	"create:thin-start",
	"dev:thin",
	"prune:template",
	"review:thin-start-api",
	"verify:assembly",
	"verify:profile-pruning",
	"verify:profiles",
]);

export const assemblyCoreScripts = new Set([
	"orchestration",
	"orchestration-state",
	"dev",
	"dev:user",
	"dev:agent",
	"build",
	"start",
	"lint",
	"typecheck",
	"verify:static",
	"verify:build",
	"verify:smoke",
	"verify:modals",
	"verify:surface-contracts",
	"verify:component-skeletons",
	"verify:route-skeletons",
	"verify",
	"format",
	"postinstall",
	"postbuild",
]);

export const assemblyCoreDependencies = new Set([
	"@mdxeditor/editor",
	"@phosphor-icons/react",
	"@radix-ui/react-slot",
	"@tanstack/react-hotkeys",
	"class-variance-authority",
	"clsx",
	"libphonenumber-js",
	"micromark",
	"micromark-extension-directive",
	"micromark-extension-mdx-jsx",
	"micromark-extension-mdx-md",
	"motion",
	"next",
	"next-sitemap",
	"react",
	"react-dom",
	"react-markdown",
	"react-phone-number-input",
	"react-responsive",
	"remark-gfm",
	"sonner",
]);

export const assemblyCoreDevDependencies = new Set([
	"@biomejs/biome",
	"@tailwindcss/postcss",
	"@types/node",
	"@types/react",
	"@types/react-dom",
	"code-inspector-plugin",
	"playwright",
	"tailwindcss",
	"tsx",
	"typescript",
]);

export const assemblyProjectDocs = new Set([
	"docs/ORCHESTRATION.md",
	"docs/auth-organization-adapters.md",
	"docs/dashboard-page-policy.md",
	"docs/frontend-entity-policy.md",
	"docs/frontend-import-policy.md",
	"docs/payload-vercel-neon-blob.md",
	"docs/responsive-rendering.md",
]);

export function isWithinPath(relativePath, ownedPath) {
	return relativePath === ownedPath || relativePath.startsWith(`${ownedPath}/`);
}
