export const marketingOnlyProfile = {
	schemaVersion: 1,
	id: "marketing-only",
	description:
		"The broad marketing template with the full shared UI system, local developer tools, and the guarded Payload-ready scaffold, without authentication or dashboard routes.",
	defaultOutput: ".template-instances/marketing-only",
	content: {
		supported: ["static", "payload-ready"],
		default: "payload-ready",
	},
	pruneFlags: ["--no-dashboard"],
	assembly: {
		surfaces: [
			"marketing",
			"demo",
			"intelligence",
			"scrollPerformance",
			"playground",
			"dictionary",
			"reference",
			"payload",
		],
	},
	sharedFiles: ["src/lib/marketing-content/fallback.ts"],
	overrides: [
		{
			source:
				"template-profiles/marketing-only/overrides/src/lib/template-intelligence/dashboard-domain.tsx",
			target: "src/lib/template-intelligence/dashboard-domain.tsx",
		},
	],
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
