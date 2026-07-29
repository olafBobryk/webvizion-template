import { defaultSiteLayout } from "@/app/(site)/_components/layout/siteLayout";
import type { MarketingPageDocument, MarketingPageSlug } from "./types";

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
				label: "Dashboard",
				href: "/login",
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

export const fallbackSiteLayout = defaultSiteLayout;
