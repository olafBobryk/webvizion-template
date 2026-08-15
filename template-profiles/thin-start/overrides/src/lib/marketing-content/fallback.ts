import type {
	DocumentMarketingPageDocument,
	HomeMarketingPageDocument,
	MarketingPageBySlug,
	MarketingPageSlug,
	SiteLayoutDocument,
} from "./types";

const developmentMenuGroups =
	process.env.NODE_ENV !== "production"
		? [
				{
					label: "Development",
					icon: "dot" as const,
					links: [{ label: "Testing", href: "/internal/testing" }],
				},
			]
		: [];

export const fallbackHomePage: HomeMarketingPageDocument = {
	description:
		"A focused website starter built from a small, source-neutral content contract.",
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
				label: "Contact",
				surfaceId: "marketing.contact",
			},
			services: [
				{
					id: "primitives",
					title: "Primitives",
					description:
						"Build with the canonical Button, Panel, Card, Text, Section, form, and overlay contracts.",
					surfaceIds: ["demo", "demoPrimitives"],
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

export const fallbackDocumentPage: DocumentMarketingPageDocument = {
	description: "A Payload-ready dated document composed from shared owners.",
	slug: "document",
	title: "Motion and interaction guidelines",
	layout: [
		{
			id: "document-content",
			blockType: "markdownDocument",
			date: "2026-08-15T12:00:00.000Z",
			markdown: `## Overview

Motion should clarify hierarchy, causality, and change. It should never be required to understand the interface.

## Principles

- Prefer one clear visual idea over several competing transitions.
- Preserve readable content and stable layout throughout the sequence.
- Respect reduced-motion preferences without removing information.`,
		},
	],
};

export const fallbackMarketingPages = {
	document: fallbackDocumentPage,
	home: fallbackHomePage,
} satisfies {
	[TSlug in MarketingPageSlug]: MarketingPageBySlug[TSlug];
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
				link: { label: "Home", surfaceId: "marketing.home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
			{
				label: "Build",
				icon: "dot",
				links: [
					{ label: "Home", surfaceId: "marketing.home" },
					{ label: "Contact", surfaceId: "marketing.contact" },
				],
			},
			...developmentMenuGroups,
		],
		mobile: {
			closeAriaLabel: "Close navigation",
			menuLabel: "Menu",
			openAriaLabel: "Open navigation",
		},
		navLinks: [
			{
				label: "Home",
				surfaceId: "marketing.home",
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
				link: { label: "Home", surfaceId: "marketing.home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
		],
		topNavLinks: [{ label: "Home", surfaceId: "marketing.home" }],
	},
	socialLinks: [],
	footer: {
		navLinks: [{ label: "Home", surfaceId: "marketing.home" }],
	},
};
