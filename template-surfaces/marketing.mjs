export const marketingSurface = {
	marketing: {
		ownedPaths: [
			"scripts/verify/verify-marketing-section-policy.ts",
			"scripts/verify/verify-marketing-site-layout.ts",
			"src/app/(site)/(marketing)",
			"src/config/surfaces/marketing.ts",
			"src/lib/marketing-content",
		],
		packageScripts: ["verify:marketing-sections", "verify:site-layout"],
	},
};
