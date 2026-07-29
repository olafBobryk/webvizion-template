import type { MarketingPageDocument, SiteLayoutDocument } from "./types";

export const fallbackHomePage: MarketingPageDocument = {
	slug: "home",
	title: "Home",
	layout: [
		{
			id: "home-hero",
			blockType: "homeHero",
			headline: "A focused website starter.",
			descriptions: [
				{
					text: "Start with the smallest useful primitive surface, then add only the components this website needs.",
				},
			],
			cta: {
				label: "Start",
				href: "/#home-hero",
			},
			services: [
				{
					id: "intelligence",
					title: "Intelligence",
					description:
						"Generate the same repository map before changing shared routes, primitives, or content.",
					surfaceIds: ["intelligence"],
				},
				{
					id: "primitives",
					title: "Primitives",
					description:
						"Build with the canonical Button, Panel, Card, Text, Section, form, and overlay contracts.",
					surfaceIds: ["demo", "demoPrimitives"],
				},
				{
					id: "motion",
					title: "Motion",
					description:
						"Keep the intro-aware reveal system, shared timing, and reduced-motion behavior intact.",
					surfaceIds: ["playground"],
				},
				{
					id: "content",
					title: "Content",
					description:
						"Render the same lightweight page and section contract from the content mode you choose.",
					surfaceIds: ["thinStart"],
				},
				{
					id: "api-review",
					title: "API review",
					description:
						"Reject broad imports, parked references, and profile drift before the workspace ships.",
					surfaceIds: ["assembly"],
				},
				{
					id: "full-start",
					title: "Full start",
					description:
						"Move back to the organization-first dashboard when the product needs the broader application layer.",
					surfaceIds: ["fullStart"],
				},
			],
		},
	],
};

export const fallbackSiteLayout: SiteLayoutDocument = {
	header: {
		cta: {
			label: "Start",
			href: "/#home-hero",
		},
		menuGroups: [
			{
				label: "Start",
				icon: "dot",
				link: { label: "Home", routeId: "home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
			{
				label: "Build",
				icon: "dot",
				links: [
					{ label: "Home", routeId: "home" },
					{ label: "Contact", routeId: "contact" },
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
		],
		search: {
			ariaLabel: "Search pages",
			clearLabel: "Clear",
			noResultsText: "No matching pages",
		},
		searchGroups: [
			{
				label: "Home",
				icon: "dot",
				link: { label: "Home", routeId: "home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
		],
		topNavLinks: [{ label: "Home", routeId: "home" }],
	},
	footer: {
		navLinks: [{ label: "Home", routeId: "home" }],
	},
};
