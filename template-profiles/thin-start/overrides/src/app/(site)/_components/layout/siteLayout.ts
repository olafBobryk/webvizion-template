import { type AppRouteId, appRoutes } from "@/config/routes";

export type HeaderIconName = "close" | "menu" | "search" | "dot";

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
	socialLinks: Array<{
		label: string;
		icon: HeaderIconName;
		href: string;
	}>;
	footer: {
		navLinks: SiteLink[];
	};
};

export function getSiteLinkHref(link: SiteLink) {
	return link.routeId ? appRoutes[link.routeId] : link.href;
}

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
				link: { label: "Home", routeId: "home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
			{
				label: "Build",
				icon: "dot",
				links: [
					{ label: "Home", routeId: "home" },
					{ label: "Contact", routeId: "contact" },
				],
			},
		],
		mobile: {
			closeAriaLabel: "Close navigation",
			menuLabel: "Menu",
			openAriaLabel: "Open navigation",
		},
		navLinks: [
			{
				label: "Home",
				routeId: "home",
				sections: [
					{
						label: "Hero",
						href: "/#home-hero",
						description: "Primary home page introduction.",
					},
				],
			},
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
				link: { label: "Home", routeId: "home" },
				links: [{ label: "Hero", href: "/#home-hero" }],
			},
		],
		topNavLinks: [{ label: "Home", routeId: "home" }],
	},
	socialLinks: [],
	footer: {
		navLinks: [{ label: "Home", routeId: "home" }],
	},
};
