export const payloadSurface = {
	payload: {
		ownedPaths: [
			"docs/guides/payload-vercel-neon-blob.md",
			"payload.config.ts",
			"scripts/payload",
			"scripts/verify/verify-payload-site-layout-source.ts",
			"src/payload",
			"src/app/(payload)",
			"src/app/api/dev/payload-login",
		],
		packageDependencies: [
			"@payloadcms/db-postgres",
			"@payloadcms/next",
			"@payloadcms/richtext-lexical",
			"@payloadcms/storage-vercel-blob",
			"payload",
			"sharp",
		],
		packageScripts: [
			"payload:seed:site-layout",
			"payload:verify:site-layout",
			"verify:payload-site-layout",
		],
	},
};
