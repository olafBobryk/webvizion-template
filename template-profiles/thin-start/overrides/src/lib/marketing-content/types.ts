import { templateCapabilities } from "@/config/capabilities";
import type { StaticAppSurfaceId } from "@/lib/routes";

export const marketingPageSlugs = ["home", "document"] as const;

export type MarketingPageSlug = (typeof marketingPageSlugs)[number];

export type HeaderIconName = "close" | "menu" | "search" | "dot";

export type MarketingLink =
	| {
			label: string;
			surfaceId: StaticAppSurfaceId;
			href?: never;
	  }
	| {
			label: string;
			href: string;
			surfaceId?: never;
	  };

export type MarketingNavSection = MarketingLink & {
	description?: string;
	icon?: HeaderIconName;
};

export type MarketingNavLink = MarketingLink & {
	sections?: MarketingNavSection[];
};

export type MarketingMenuGroup = {
	label: string;
	icon?: HeaderIconName;
	link?: MarketingLink;
	links?: MarketingLink[];
};

export type MarketingSectionBase<TBlockType extends string> = {
	id?: string;
	blockType: TBlockType;
};

export type HomeHeroSectionBlock = MarketingSectionBase<"homeHero"> & {
	headline: string;
	descriptions: Array<{
		text: string;
	}>;
	cta: MarketingLink;
	services: HomeHeroServiceItem[];
};

export type MarkdownDocumentContentBlock = {
	id?: string;
	blockType: "markdownDocument";
	date: string;
	markdown: string;
};

const allTemplateServiceSurfaceIds = [
	"demo",
	"demoPrimitives",
	"fullStart",
	"assembly",
	"skillsPack",
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

type MarketingPageDocumentBase<TSlug extends MarketingPageSlug, TLayout> = {
	description: string;
	slug: TSlug;
	title: string;
	layout: TLayout;
};

export type HomeMarketingPageDocument = MarketingPageDocumentBase<
	"home",
	MarketingSection[]
>;

export type DocumentMarketingPageDocument = MarketingPageDocumentBase<
	"document",
	[MarkdownDocumentContentBlock]
>;

export type MarketingPageBySlug = {
	document: DocumentMarketingPageDocument;
	home: HomeMarketingPageDocument;
};

export type MarketingPageDocument = MarketingPageBySlug[MarketingPageSlug];

export type SiteLayoutDocument = {
	header: {
		cta: MarketingLink;
		menuGroups: MarketingMenuGroup[];
		mobile: {
			closeAriaLabel: string;
			menuLabel: string;
			openAriaLabel: string;
		};
		navLinks: MarketingNavLink[];
		search: {
			ariaLabel: string;
			clearLabel: string;
			noResultsText: string;
		};
		searchGroups: MarketingMenuGroup[];
		topNavLinks: MarketingLink[];
	};
	socialLinks: Array<{
		label: string;
		icon: HeaderIconName;
		href: string;
	}>;
	footer: {
		navLinks: MarketingLink[];
	};
};
