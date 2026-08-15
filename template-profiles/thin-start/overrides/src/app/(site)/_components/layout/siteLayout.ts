import type { IconName } from "@/components/ui/icons/Icon";
import {
	hrefFor,
	internalHrefFor,
	isInternalRouteId,
	type StaticAppSurfaceId,
} from "@/lib/routes";

export type HeaderIconName = IconName;

export type SiteLink =
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

export type SiteNavSection = SiteLink & {
	description?: string;
	icon?: HeaderIconName;
};

export type SiteNavLink = SiteLink & {
	sections?: SiteNavSection[];
};

export type SiteMenuGroup = {
	label: string;
	icon?: HeaderIconName;
	link?: SiteLink;
	links?: SiteLink[];
};

export type SiteSocialLink = {
	label: string;
	icon: HeaderIconName;
	href: string;
};

export type SiteLayoutDocument = {
	header: {
		cta: SiteLink;
		menuGroups: SiteMenuGroup[];
		mobile: {
			closeAriaLabel: string;
			menuLabel: string;
			openAriaLabel: string;
		};
		navLinks: SiteNavLink[];
		search: {
			ariaLabel: string;
			clearLabel: string;
			noResultsText: string;
		};
		searchGroups: SiteMenuGroup[];
		topNavLinks: SiteLink[];
	};
	socialLinks: SiteSocialLink[];
	footer: {
		navLinks: SiteLink[];
	};
};

export function getSiteLinkHref(link: SiteLink) {
	return link.href ?? hrefFor(link.surfaceId);
}

function getAvailableInternalRouteLink(
	label: string,
	internalRouteId: string,
): SiteLink | null {
	return isInternalRouteId(internalRouteId)
		? { label, href: internalHrefFor(internalRouteId) }
		: null;
}

function omitMissingLinks<T>(items: Array<T | null>): T[] {
	return items.filter((item): item is T => item !== null);
}

const demoLink = getAvailableInternalRouteLink("Component Sweep", "demo");
const internalRouteLinks = omitMissingLinks<SiteLink>([demoLink]);
const developerMenuGroup: SiteMenuGroup | null =
	internalRouteLinks.length > 0
		? {
				label: "Development",
				icon: "dot",
				links: internalRouteLinks,
			}
		: null;

export const defaultSiteLayout: SiteLayoutDocument = {
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
			...omitMissingLinks([developerMenuGroup]),
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
			...omitMissingLinks<SiteNavLink>([demoLink]),
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
			...omitMissingLinks([developerMenuGroup]),
		],
		topNavLinks: [
			{ label: "Home", surfaceId: "marketing.home" },
			...omitMissingLinks([demoLink]),
		],
	},
	socialLinks: [],
	footer: {
		navLinks: [{ label: "Home", surfaceId: "marketing.home" }],
	},
};
