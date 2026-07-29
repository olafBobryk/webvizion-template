import type { IconName } from "@/components/ui/icons/Icon";
import { type AppRouteId, appRoutes } from "@/config/routes";

export type SiteLink =
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
	return link.href ?? appRoutes[link.routeId];
}

const availableRoutes: Readonly<Record<string, string>> = appRoutes;

function getAvailableRouteLink(
	label: string,
	routeId: string,
): SiteLink | null {
	const href = availableRoutes[routeId];
	return href ? { label, href } : null;
}

function omitMissingLinks<T>(items: Array<T | null>): T[] {
	return items.filter((item): item is T => item !== null);
}

const homeLink: SiteLink = {
	label: "Home",
	href: availableRoutes.home ?? "/",
};
const settingsLink = getAvailableRouteLink("Settings", "settings");
const dashboardLink: SiteLink = {
	label: "Dashboard",
	href: availableRoutes.login ?? availableRoutes.home ?? "/",
};

export const defaultSiteLayout: SiteLayoutDocument = {
	header: {
		cta: dashboardLink,
		menuGroups: [
			{
				label: "Start",
				link: homeLink,
				links: omitMissingLinks<SiteLink>([
					{ label: "Hero", href: "/#home-hero" },
					settingsLink,
				]),
			},
		],
		mobile: {
			closeAriaLabel: "Close navigation",
			menuLabel: "Menu",
			openAriaLabel: "Open navigation",
		},
		navLinks: omitMissingLinks<SiteNavLink>([
			{
				...homeLink,
				sections: [
					{
						label: "Hero",
						href: "/#home-hero",
						description: "Primary home page introduction.",
					},
				],
			},
			settingsLink,
		]),
		search: {
			ariaLabel: "Search pages",
			clearLabel: "Clear",
			noResultsText: "No matching pages",
		},
		searchGroups: [
			{
				label: "Home",
				link: homeLink,
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
		],
		topNavLinks: omitMissingLinks([homeLink, settingsLink]),
	},
	socialLinks: [
		{ label: "X", icon: "x", href: "" },
		{ label: "Instagram", icon: "instagram", href: "" },
		{ label: "LinkedIn", icon: "linked-in", href: "" },
		{ label: "Meta", icon: "meta", href: "" },
		{ label: "You Tube", icon: "youtube", href: "" },
	],
	footer: {
		navLinks: omitMissingLinks([homeLink, settingsLink]),
	},
};
