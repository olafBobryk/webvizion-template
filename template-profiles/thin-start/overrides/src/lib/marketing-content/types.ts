import type { StaticAppSurfaceId } from "@/lib/routes";

export type MarketingPageSlug = "home";

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

export type TemplateServiceSurfaceId =
	| "demo"
	| "demoPrimitives"
	| "fullStart"
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
