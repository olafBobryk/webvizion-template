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
	"scripts/create-template-profile.mjs",
	"scripts/dev-thin.mjs",
	"scripts/generate-commit-line-delta.mjs",
	"scripts/generate-template-assembly-inventory.mjs",
	"scripts/review-thin-start-api.mjs",
	"scripts/verify/verify-template-profiles.mjs",
	".github/workflows/update-commit-line-delta.yml",
	"docs/assets/commit-line-delta.svg",
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
	"dev:thin",
	"chart:commit-line-delta",
	"review:thin-start-api",
	"verify:profiles",
]);

export const assemblyCoreScripts = new Set([
	"orchestration",
	"orchestration-state",
	"dev",
	"dev:preview",
	"dev:local",
	"dev:inspect",
	"dev:user",
	"dev:agent",
	"predev:preview",
	"predev:local",
	"predev:inspect",
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
	"docs/guides/auth-organization-adapters.md",
	"docs/guides/components/README.md",
	"docs/guides/components/composition-and-public-apis.md",
	"docs/guides/components/feedback-and-status.md",
	"docs/guides/components/forms-and-submission.md",
	"docs/guides/components/interaction-and-responsive-rendering.md",
	"docs/guides/components/loading-and-async-states.md",
	"docs/guides/components/overlays-and-confirmation.md",
	"docs/guides/components/surfaces-and-presentation.md",
	"docs/guides/payload-vercel-neon-blob.md",
]);

export function isWithinPath(relativePath, ownedPath) {
	return relativePath === ownedPath || relativePath.startsWith(`${ownedPath}/`);
}
