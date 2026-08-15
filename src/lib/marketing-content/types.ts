import type {
	SiteLayoutDocument,
	SiteLink,
	SiteMenuGroup,
	SiteNavLink,
	SiteNavSection,
	SiteSocialLink,
} from "@/app/(site)/_components/layout/siteLayout";
import { templateCapabilities } from "@/config/capabilities";

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

const allTemplateServiceSurfaceIds = [
	"demo",
	"demoPrimitives",
	"fullStart",
	"assembly",
	"thinStart",
	"repositoryFootprint",
] as const;

export type TemplateServiceSurfaceId =
	(typeof allTemplateServiceSurfaceIds)[number];

export const templateServiceSurfaceIds = allTemplateServiceSurfaceIds.filter(
	(surfaceId) =>
		surfaceId !== "repositoryFootprint" ||
		templateCapabilities.repositoryFootprint,
);

export type HomeHeroServiceItem = {
	id: string;
	title: string;
	description: string;
	surfaceIds: TemplateServiceSurfaceId[];
};

export type MarketingSection = HomeHeroSectionBlock;

export type MarketingPageDocument = {
	description: string;
	slug: MarketingPageSlug;
	title: string;
	layout: MarketingSection[];
};
