import {
	getAvailableSiteSurfaceLink,
	type SiteLayoutDocument,
	type SiteLink,
	type SiteMenuGroup,
	type SiteNavLink,
} from "@/app/(site)/_components/layout/siteLayout";
import { getMarketingSiteLinks, publicSocialLinks } from "./links";
import type { MarketingPageDocument, MarketingPageSlug } from "./types";

function omitMissingLinks<T>(items: Array<T | null>): T[] {
	return items.filter((item): item is T => item !== null);
}

const siteLinks = getMarketingSiteLinks();
const internalRouteLinks = omitMissingLinks<SiteLink>([
	siteLinks.demo,
	siteLinks.intelligence,
	siteLinks.playground,
	siteLinks.dictionary,
	siteLinks.reference,
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
			siteLinks.intelligence,
			siteLinks.playground,
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
			siteLinks.intelligence,
			siteLinks.playground,
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
