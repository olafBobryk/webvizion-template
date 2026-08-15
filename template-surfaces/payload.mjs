export const payloadSurface = {
	payload: {
		ownedPaths: [
			"docs/operations/payload-vercel-neon-blob.md",
			"payload.config.ts",
			"scripts/payload",
			"scripts/verify/verify-payload-site-layout-source.ts",
			"scripts/verify/verify-payload-marketing-pages.ts",
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
			"payload:seed:marketing-pages",
			"payload:verify:marketing-pages",
			"verify:payload-pages",
			"verify:payload-site-layout",
		],
	},
};
