export const marketingOnlyProfile = {
	schemaVersion: 1,
	id: "marketing-only",
	description:
		"The broad marketing template with the full shared UI system, local developer tools, and the guarded Payload-ready scaffold, without authentication or dashboard routes.",
	defaultOutput: ".template-instances/marketing-only",
	pruneFlags: ["--no-dashboard"],
	sharedFiles: ["src/lib/marketing-content/fallback.ts"],
	overrides: [],
	verification: {
		requiredFiles: [
			"src/app/(site)/(marketing)/(home)/page.tsx",
			"src/app/(site)/(dev)/internal/layout.tsx",
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
			"npm run build",
			"npm run verify:smoke",
		],
	},
};

export default marketingOnlyProfile;
