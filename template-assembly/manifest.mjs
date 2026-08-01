export const assemblyGeneratedPaths = new Set([
	"AGENTS.md",
	"README.md",
	"next.config.ts",
	"package-lock.json",
	"package.json",
	"src/config/surfaces.ts",
	"src/lib/api/index.ts",
	"src/lib/marketing-content/source.ts",
	"tsconfig.json",
]);

export const assemblyTemplateOnlyPaths = new Set([
	"vitest.config.mts",
	"vitest.shims.d.ts",
	"scripts/create-template-profile.mjs",
	"scripts/dev-thin.mjs",
	"scripts/generate-commit-line-delta.mjs",
	"scripts/generate-template-assembly-inventory.mjs",
	"scripts/install-orchestration.mjs",
	"scripts/measure-storybook-performance.mjs",
	"scripts/record-design-system-evidence.mjs",
	"scripts/review-thin-start-api.mjs",
	"scripts/storybook-preview.mjs",
	"scripts/verify/verify-design-system-evidence.mjs",
	"scripts/verify/verify-storybook-preview.mjs",
	"scripts/verify/verify-template-profiles.mjs",
	"scripts/verify/verify-storybook-catalog.ts",
	".github/workflows/update-commit-line-delta.yml",
	"docs/assets/commit-line-delta.svg",
]);

export const assemblyTemplateOnlyRoots = [
	".storybook",
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
	"build-storybook",
	"create:project",
	"orchestration:init",
	"dev:thin",
	"chart:commit-line-delta",
	"design-system:evidence",
	"review:thin-start-api",
	"storybook",
	"storybook:preview",
	"storybook:status",
	"storybook:stop",
	"measure:storybook-performance",
	"verify:storybook-preview",
	"verify:design-system-evidence",
	"test-storybook",
	"test-storybook:ui:light",
	"test-storybook:ui:dark",
	"test-storybook:ui",
	"verify:storybook-catalog",
	"verify:profiles",
]);

export const assemblyTemplateOnlyDevDependencies = new Set([
	"@chromatic-com/storybook",
	"@storybook/addon-a11y",
	"@storybook/addon-docs",
	"@storybook/addon-mcp",
	"@storybook/addon-vitest",
	"@storybook/nextjs-vite",
	"@vitest/browser-playwright",
	"@vitest/coverage-v8",
	"storybook",
	"vite",
	"vitest",
]);

export function isAssemblyTemplateOnlyFile(relativePath) {
	return /\.stories\.[cm]?[jt]sx?$/.test(relativePath);
}

export const assemblyCoreScripts = new Set([
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
	"verify:route-surfaces",
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
