export const fullProfile = {
	schemaVersion: 2,
	id: "full",
	description:
		"The complete Averlo template with marketing, authentication, dashboard, local developer tools, and the guarded Payload-ready scaffold.",
	defaultOutput: ".template-instances/full",
	content: {
		supported: ["static", "payload-ready"],
		default: "payload-ready",
	},
	assembly: {
		surfaces: [
			"dashboard",
			"marketing",
			"demo",
			"scrollPerformance",
			"testing",
			"payload",
		],
	},
	sharedFiles: [],
	overrides: [],
	verification: {
		requiredFiles: [
			"src/app/(site)/(marketing)/(home)/page.tsx",
			"src/app/(site)/(auth)/login/page.tsx",
			"src/app/(site)/dashboard/page.tsx",
			"src/app/(component-export)/internal/demo/page.tsx",
			"src/app/(site)/(marketing)/internal/layout.tsx",
			"src/lib/component-catalog/componentCatalog.generated.ts",
			"scripts/generate-component-catalog.mjs",
			"src/proxy.ts",
			"payload.config.ts",
		],
		forbiddenPaths: [],
		forbiddenPackages: [],
		commands: [
			"npm run verify:static",
			"npm run verify:marketing-sections",
			"npm run verify:site-layout",
			"npm run build",
			"npm run verify:smoke",
		],
	},
};

export default fullProfile;
