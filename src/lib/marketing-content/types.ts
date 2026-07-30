import type {
	SiteLayoutDocument,
	SiteLink,
	SiteMenuGroup,
	SiteNavLink,
	SiteNavSection,
	SiteSocialLink,
} from "@/app/(site)/_components/layout/siteLayout";

export type {
	SiteLayoutDocument,
	SiteLink as MarketingLink,
	SiteMenuGroup as MarketingMenuGroup,
	SiteNavLink as MarketingNavLink,
	SiteNavSection as MarketingNavSection,
	SiteSocialLink as MarketingSocialLink,
};

export const marketingPageSlugs = ["home"] as const;

export type MarketingPageSlug = (typeof marketingPageSlugs)[number];

export type MarketingSectionBase<TBlockType extends string> = {
	id?: string;
	blockType: TBlockType;
};

export type HomeHeroSectionBlock = MarketingSectionBase<"homeHero"> & {
	headline: string;
	descriptions: Array<{
		text: string;
	}>;
	cta: SiteLink;
	services: HomeHeroServiceItem[];
};

export type TemplateServiceSurfaceId =
	| "demo"
	| "demoPrimitives"
	| "fullStart"
	| "intelligence"
	| "playground"
	| "assembly"
	| "thinStart";

export type HomeHeroServiceItem = {
	id: string;
	title: string;
	description: string;
	surfaceIds: TemplateServiceSurfaceId[];
};

export type MarketingSection = HomeHeroSectionBlock;

export type MarketingPageDocument = {
	slug: MarketingPageSlug;
	title: string;
	layout: MarketingSection[];
};
