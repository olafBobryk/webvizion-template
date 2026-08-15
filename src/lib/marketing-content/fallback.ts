import {
	getAvailableSiteSurfaceLink,
	type SiteLayoutDocument,
	type SiteLink,
	type SiteMenuGroup,
	type SiteNavLink,
} from "@/app/(site)/_components/layout/siteLayout";
import { templateCapabilities } from "@/config/capabilities";
import { getMarketingSiteLinks, publicSocialLinks } from "./links";
import type {
	DocumentMarketingPageDocument,
	HomeMarketingPageDocument,
	MarketingPageBySlug,
	MarketingPageSlug,
} from "./types";

function omitMissingLinks<T>(items: Array<T | null>): T[] {
	return items.filter((item): item is T => item !== null);
}

const siteLinks = getMarketingSiteLinks();
const internalRouteLinks = omitMissingLinks<SiteLink>([
	siteLinks.demo,
	siteLinks.testing,
]);
const developerMenuGroup: SiteMenuGroup | null =
	internalRouteLinks.length > 0
		? {
				label: "Development",
				links: internalRouteLinks,
			}
		: null;

const fallbackHeroCta =
	getAvailableSiteSurfaceLink("Dashboard", "auth.login") ??
	getAvailableSiteSurfaceLink("Contact", "marketing.contact");

if (!fallbackHeroCta) {
	throw new Error("Marketing fallback content requires a primary CTA surface.");
}

export const fallbackHomePage: HomeMarketingPageDocument = {
	description:
		"An agent-ready Next.js template for lightweight design-system scaffolds.",
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
				...fallbackHeroCta,
			},
			services: [
				{
					id: "demo",
					title: "Component Export",
					description:
						"Browse live primitives, states, and skeletons before composing them into a product.",
					surfaceIds: ["demo", "demoPrimitives"],
				},
				{
					id: "assembly",
					title: "Assembly",
					description:
						"Select a profile and content capability, preview the plan, then materialize a verified project.",
					surfaceIds: ["assembly"],
				},
				{
					id: "thin-start",
					title: "Thin start",
					description:
						"Keep the canonical visual core in a minimal, independently verifiable workspace.",
					surfaceIds: [
						"thinStart",
						...(templateCapabilities.repositoryFootprint
							? (["repositoryFootprint"] as const)
							: []),
					],
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

export const fallbackDocumentPage: DocumentMarketingPageDocument = {
	description:
		"A Payload-ready document page composed through the shared Markdown renderer.",
	slug: "document",
	title: "Motion and interaction guidelines",
	layout: [
		{
			id: "document-content",
			blockType: "markdownDocument",
			date: "2026-08-15T12:00:00.000Z",
			markdown: `## Overview

Motion should clarify hierarchy, causality, and change. It should never be required to understand the interface.

## Source and effect

A motion source determines **when** progress changes. An effect determines **how** that progress changes the presentation. Keeping those responsibilities separate lets the same clip, stagger, or transform respond to reveal, scroll, hover, and controlled state.

---

## Principles

- Prefer one clear visual idea over several competing transitions.
- Preserve readable content and stable layout throughout the sequence.
- Keep durations and springs aligned with the shared timing system.
- Respect reduced-motion preferences without removing information.

## Responsive behavior

Animation geometry should derive from the rendered container—not from assumptions about a particular page. At narrow widths, simplify the composition while preserving the reading order and controls.`,
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
		cta: siteLinks.dashboard,
		menuGroups: [
			{
				label: "Start",
				link: siteLinks.home,
				links: omitMissingLinks<SiteLink>([
					{ label: "Hero", href: "/#home-hero" },
					siteLinks.contact,
					siteLinks.settings,
				]),
			},
			...omitMissingLinks([
				siteLinks.repositoryFootprint
					? {
							label: "Template",
							links: [siteLinks.repositoryFootprint],
						}
					: null,
			]),
			...omitMissingLinks([developerMenuGroup]),
		],
		mobile: {
			closeAriaLabel: "Close navigation",
			menuLabel: "Menu",
			openAriaLabel: "Open navigation",
		},
		navLinks: omitMissingLinks<SiteNavLink>([
			{
				...siteLinks.home,
				sections: [
					{
						label: "Hero",
						href: "/#home-hero",
						description: "Primary home page introduction.",
					},
				],
			},
			siteLinks.contact,
			siteLinks.demo,
			siteLinks.settings,
		]),
		search: {
			ariaLabel: "Search pages",
			clearLabel: "Clear",
			noResultsText: "No matching pages",
		},
		searchGroups: [
			{
				label: "Home",
				link: siteLinks.home,
				links: omitMissingLinks<SiteLink>([
					{ label: "Hero", href: "/#home-hero" },
					siteLinks.contact,
					siteLinks.settings,
				]),
			},
			...omitMissingLinks([developerMenuGroup]),
		],
		topNavLinks: omitMissingLinks([
			siteLinks.home,
			siteLinks.demo,
			siteLinks.settings,
		]),
	},
	socialLinks: publicSocialLinks,
	footer: {
		navLinks: omitMissingLinks([
			siteLinks.home,
			siteLinks.contact,
			siteLinks.settings,
		]),
	},
};
