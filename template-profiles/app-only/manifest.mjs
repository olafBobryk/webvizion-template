const overridesRoot = "template-profiles/app-only/overrides";

export const appOnlyProfile = {
	schemaVersion: 2,
	id: "app-only",
	description:
		"The authentication and dashboard application template with local developer tools, without public marketing or Payload.",
	defaultOutput: ".template-instances/app-only",
	content: {
		supported: ["static"],
		default: "static",
	},
	assembly: {
		surfaces: [
			"dashboard",
			"demo",
			"intelligence",
			"scrollPerformance",
			"playground",
			"dictionary",
			"reference",
		],
	},
	sharedFiles: [],
	overrides: [
		{
			source: `${overridesRoot}/src/app/(site)/(app-home)/page.tsx`,
			target: "src/app/(site)/(app-home)/page.tsx",
		},
	],
	verification: {
		requiredFiles: [
			"src/app/(site)/(app-home)/page.tsx",
			"src/app/(site)/(auth)/login/page.tsx",
			"src/app/(site)/dashboard/page.tsx",
			"src/app/(site)/(dev)/internal/demo/page.tsx",
			"src/app/(site)/(dev)/internal/layout.tsx",
			"src/lib/component-catalog/componentCatalog.generated.ts",
			"scripts/generate-component-catalog.mjs",
			"src/proxy.ts",
		],
		forbiddenPaths: [
			"src/app/(site)/(marketing)",
			"src/lib/marketing-content",
			"src/app/(payload)",
			"src/payload",
			"payload.config.ts",
		],
		forbiddenPackages: [
			"@payloadcms/db-postgres",
			"@payloadcms/next",
			"@payloadcms/richtext-lexical",
			"@payloadcms/storage-vercel-blob",
			"payload",
			"sharp",
		],
		commands: [
			"npm run verify:static",
			"npm run verify:dashboard",
			"npm run verify:auth",
			"npm run build",
			"npm run verify:smoke",
		],
	},
};

export default appOnlyProfile;
