export const fullProfile = {
	schemaVersion: 1,
	id: "full",
	description:
		"The complete Averlo template with marketing, authentication, dashboard, local developer tools, and the guarded Payload-ready scaffold.",
	defaultOutput: ".template-instances/full",
	content: {
		supported: ["static", "payload-ready"],
		default: "payload-ready",
	},
	pruneFlags: [],
	assembly: {
		surfaces: [
			"dashboardReferenceEntities",
			"dashboard",
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
	sharedFiles: [],
	overrides: [],
	verification: {
		requiredFiles: [
			"src/app/(site)/(marketing)/(home)/page.tsx",
			"src/app/(site)/(auth)/login/page.tsx",
			"src/app/(site)/dashboard/page.tsx",
			"src/app/(site)/(dev)/internal/layout.tsx",
			"src/proxy.ts",
			"payload.config.ts",
		],
		forbiddenPaths: [],
		forbiddenPackages: [],
		commands: [
			"npm run verify:static",
			"npm run build",
			"npm run verify:smoke",
		],
	},
};

export default fullProfile;
