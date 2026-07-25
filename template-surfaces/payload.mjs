export const payloadSurface = {
	payload: {
		id: "payload",
		flag: "--no-payload",
		description:
			"Remove the guarded Payload CMS scaffold, config references, and Payload packages.",
		dependentSurfaces: [],
		ownedPaths: [
			"docs/payload-vercel-neon-blob.md",
			"payload.config.ts",
			"src/payload",
			"src/app/(payload)",
			"src/app/api/dev/payload-login",
		],
		routeIds: [],
		routeBuilders: [],
		navRouteIds: [],
		searchSources: [],
		packageDependencies: [
			"@payloadcms/db-postgres",
			"@payloadcms/next",
			"@payloadcms/richtext-lexical",
			"@payloadcms/storage-vercel-blob",
			"payload",
			"sharp",
		],
		postRemovalAssertions: [
			{
				label: "Payload imports",
				pattern:
					/(?:from\s+["'](?:@payloadcms|@payload-config|@\/payload)|import\s+["'](?:@payloadcms|@payload-config|@\/payload)|require\(["'](?:@payloadcms|@payload-config|@\/payload))/,
			},
		],
	},
};
