import type { IconName } from "@/components/ui/icons/Icon";
import {
	hrefFor,
	internalHrefFor,
	isInternalRouteId,
	isStaticAppSurfaceId,
	type StaticAppSurfaceId,
} from "@/lib/routes";

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
	icon?: IconName;
};

export type SiteNavLink = SiteLink & {
	sections?: SiteNavSection[];
};

export type SiteMenuGroup = {
	label: string;
	icon?: IconName;
	link?: SiteLink;
	links?: SiteLink[];
};

export type SiteSocialLink = {
	label: string;
	icon: IconName;
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

export function getAvailableSiteSurfaceLink(
	label: string,
	surfaceId: string,
): SiteLink | null {
	return isStaticAppSurfaceId(surfaceId) ? { label, surfaceId } : null;
}

export function getAvailableInternalRouteLink(
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

const homeLink: SiteLink = { label: "Home", href: "/" };
const dashboardLink: SiteLink = getAvailableSiteSurfaceLink(
	"Dashboard",
	"auth.login",
) ?? {
	label: "Dashboard",
	href: "/",
};
const demoLink = getAvailableInternalRouteLink("Component Export", "demo");
const internalRouteLinks = omitMissingLinks<SiteLink>([demoLink]);
const developerMenuGroup: SiteMenuGroup | null =
	internalRouteLinks.length > 0
		? {
				label: "Development",
				links: internalRouteLinks,
			}
		: null;

export const defaultSiteLayout: SiteLayoutDocument = {
	header: {
		cta: dashboardLink,
		menuGroups: omitMissingLinks([developerMenuGroup]),
		mobile: {
			closeAriaLabel: "Close navigation",
			menuLabel: "Menu",
			openAriaLabel: "Open navigation",
		},
		navLinks: omitMissingLinks<SiteNavLink>([homeLink, demoLink]),
		search: {
			ariaLabel: "Search pages",
			clearLabel: "Clear",
			noResultsText: "No matching pages",
		},
		searchGroups: omitMissingLinks([developerMenuGroup]),
		topNavLinks: omitMissingLinks([homeLink, demoLink]),
	},
	socialLinks: [],
	footer: {
		navLinks: [homeLink],
	},
};
