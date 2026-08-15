export const devToolSurfaces = {
	demo: {
		ownedPaths: [
			"src/app/(component-export)/internal/demo",
			"src/lib/component-catalog",
			"scripts/generate-component-catalog.mjs",
			"scripts/verify/verify-component-sweep.ts",
		],
		packageScripts: [
			"catalog:generate",
			"catalog:check",
			"verify:component-sweep",
		],
	},
	scrollPerformance: {
		ownedPaths: [
			"scripts/scroll-performance",
			"docs/operations/scroll-performance.md",
			"scripts/scroll-performance/fixtures/scroll-performance-runs.example.jsonl",
		],
		packageScripts: [
			"measure:scroll-performance",
			"record:scroll-performance",
			"setup:scroll-performance-autoresearch",
			"score:scroll-performance",
			"verify:scroll-performance",
		],
		packageDependencies: ["playwright"],
	},
	testing: {
		ownedPaths: ["src/app/(site)/(dev)/internal/testing"],
	},
	repositoryFootprint: {
		ownedPaths: [
			"src/app/(site)/(marketing)/repository-footprint",
			"scripts/generate-repository-footprint.mjs",
			".github/workflows/update-repository-footprint.yml",
		],
		packageDependencies: ["recharts"],
	},
};
