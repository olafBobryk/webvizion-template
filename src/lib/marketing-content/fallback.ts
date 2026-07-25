import type {
	MarketingPageDocument,
	MarketingPageSlug,
	SiteLayoutDocument,
} from "./types";

export const fallbackHomePage: MarketingPageDocument = {
	slug: "home",
	title: "Home",
	layout: [
		{
			id: "home-hero",
			blockType: "homeHero",
			headline: "A design system built for full control.",
			descriptions: [
				{
					text: "Compose pages from shared primitives, motion, and layout building blocks so every screen stays consistent, adaptable, and easy to extend.",
				},
			],
			cta: {
				label: "Contact",
				href: "/contact",
			},
			services: [
				{
					id: "demo",
					title: "Demo",
					description:
						"Browse live primitives, states, and skeletons before composing them into a product.",
					surfaceIds: ["demo", "demoPrimitives"],
				},
				{
					id: "intelligence",
					title: "Intelligence",
					description:
						"Generate a repository map and query the right surfaces before changing shared code.",
					surfaceIds: ["intelligence"],
				},
				{
					id: "playground",
					title: "Playground",
					description:
						"Try reveal, scroll, and choreography ideas in isolation before they enter the system.",
					surfaceIds: ["playground"],
				},
				{
					id: "prune",
					title: "Prune",
					description:
						"Dry-run optional surfaces, then remove them without leaving stale routes or dependencies.",
					surfaceIds: ["prune"],
				},
				{
					id: "thin-start",
					title: "Thin start",
					description:
						"Keep the canonical visual core in a minimal, independently verifiable workspace.",
					surfaceIds: ["thinStart"],
				},
				{
					id: "full-start",
					title: "Full start",
					description:
						"Begin with an organization-first dashboard, complete responsive states, and product-ready operations.",
					surfaceIds: ["fullStart"],
				},
			],
		},
	],
};

export const fallbackMarketingPages = {
	home: fallbackHomePage,
} satisfies Record<MarketingPageSlug, MarketingPageDocument>;

export const fallbackSiteLayout: SiteLayoutDocument = {
	header: {
		cta: {
			label: "Contact",
			href: "/contact",
		},
		menuGroups: [
			{
				label: "Start",
				link: { label: "Home", routeId: "home" },
				links: [
					{ label: "Hero", href: "/#home-hero" },
					{ label: "Settings", routeId: "settings" },
				],
			},
		],
		mobile: {
			closeAriaLabel: "Close navigation",
			menuLabel: "Menu",
			openAriaLabel: "Open navigation",
		},
		navLinks: [
			{
				label: "Home",
				routeId: "home",
				sections: [
					{
						label: "Hero",
						href: "/#home-hero",
						description: "Primary home page introduction.",
					},
				],
			},
			{ label: "Settings", routeId: "settings" },
		],
		search: {
			ariaLabel: "Search pages",
			clearLabel: "Clear",
			noResultsText: "No matching pages",
		},
		searchGroups: [
			{
				label: "Home",
				link: { label: "Home", routeId: "home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
		],
		topNavLinks: [
			{ label: "Home", routeId: "home" },
			{ label: "Settings", routeId: "settings" },
		],
	},
	socialLinks: [
		{
			label: "X",
			icon: "x",
			href: "",
		},
		{
			label: "Instagram",
			icon: "instagram",
			href: "",
		},
		{
			label: "LinkedIn",
			icon: "linked-in",
			href: "",
		},
		{
			label: "Meta",
			icon: "meta",
			href: "",
		},
		{
			label: "You Tube",
			icon: "youtube",
			href: "",
		},
	],
	footer: {
		navLinks: [
			{ label: "Home", routeId: "home" },
			{ label: "Settings", routeId: "settings" },
		],
	},
};
