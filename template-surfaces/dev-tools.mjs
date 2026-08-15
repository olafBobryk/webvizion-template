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
	playground: {
		ownedPaths: ["src/app/(site)/(dev)/internal/playground"],
		packageDependencies: ["recharts"],
	},
	dictionary: {
		ownedPaths: ["src/app/(site)/(dev)/internal/dictionary"],
	},
	reference: {
		ownedPaths: ["src/app/(site)/(dev)/internal/reference"],
	},
};
