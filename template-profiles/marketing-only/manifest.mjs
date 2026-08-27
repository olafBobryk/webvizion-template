export const marketingOnlyProfile = {
	schemaVersion: 2,
	id: "marketing-only",
	description:
		"The broad marketing template with the full shared UI system, local developer tools, and the guarded Payload-ready scaffold, without authentication or dashboard routes.",
	defaultOutput: ".template-instances/marketing-only",
	content: {
		supported: ["static", "payload-ready"],
		default: "payload-ready",
	},
	assembly: {
		surfaces: ["marketing", "demo", "scrollPerformance", "testing", "payload"],
	},
	sharedFiles: ["src/lib/marketing-content/fallback.ts"],
	overrides: [],
	verification: {
		requiredFiles: [
			"src/app/(site)/(marketing)/(home)/page.tsx",
			"src/app/(component-export)/internal/demo/page.tsx",
			"src/app/(site)/(marketing)/internal/layout.tsx",
			"src/lib/component-catalog/componentCatalog.generated.ts",
			"scripts/generate-component-catalog.mjs",
			"src/lib/marketing-content/fallback.ts",
			"src/proxy.ts",
			"payload.config.ts",
		],
		forbiddenPaths: [
			"src/app/(site)/(auth)",
			"src/app/(site)/dashboard",
			"src/app/api/auth",
			"src/lib/auth",
		],
		forbiddenPackages: [],
		commands: [
			"npm run verify:static",
			"npm run verify:marketing",
			"npm run build",
			"npm run verify:smoke",
		],
	},
};

export default marketingOnlyProfile;
