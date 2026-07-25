export const marketingSurface = {
	marketing: {
		id: "marketing",
		flag: "--no-marketing",
		description:
			"Remove public marketing routes and their content resolver/rendering layer while retaining application and local developer surfaces.",
		dependentSurfaces: [],
		ownedPaths: ["src/app/(site)/(marketing)", "src/lib/marketing-content"],
		routeIds: ["contact", "settings"],
		routeBuilders: [],
		navRouteIds: ["home", "contact", "settings"],
		searchSources: [],
		postRemovalAssertions: [
			{
				label: "marketing imports and routes",
				pattern:
					/(from\s+["']@\/lib\/marketing-content|\/\(marketing\)\/|hrefFor\("contact"\)|hrefFor\("settings"\)|routeId:\s*"contact"|routeId:\s*"settings")/,
			},
		],
	},
};
