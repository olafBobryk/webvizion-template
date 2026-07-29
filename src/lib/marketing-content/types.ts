import type { IconName } from "@/components/ui/icons/Icon";
import type { AppRouteId } from "@/config/routes";

export const marketingPageSlugs = ["home"] as const;

export type MarketingPageSlug = (typeof marketingPageSlugs)[number];

export type MarketingLink =
	| {
			label: string;
			routeId: AppRouteId;
			href?: never;
	  }
	| {
			label: string;
			href: string;
			routeId?: never;
	  };

export type MarketingNavSection = MarketingLink & {
	description?: string;
	icon?: IconName;
};

export type MarketingNavLink = MarketingLink & {
	sections?: MarketingNavSection[];
};

export type MarketingMenuGroup = {
	label: string;
	icon?: IconName;
	link?: MarketingLink;
	links?: MarketingLink[];
};

export type MarketingSocialLink = {
	label: string;
	icon: IconName;
	href: string;
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
	cta: {
		label: string;
		href: string;
	};
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
	socialLinks: MarketingSocialLink[];
	footer: {
		navLinks: MarketingLink[];
	};
};
