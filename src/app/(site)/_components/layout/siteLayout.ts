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

const homeLink: SiteLink = getAvailableSiteSurfaceLink(
	"Home",
	"marketing.home",
) ?? { label: "Home", href: "/" };
const settingsLink = getAvailableSiteSurfaceLink(
	"Settings",
	"marketing.settings",
);
const contactLink = getAvailableSiteSurfaceLink("Contact", "marketing.contact");
const dashboardLink: SiteLink = getAvailableSiteSurfaceLink(
	"Dashboard",
	"auth.login",
) ??
	getAvailableSiteSurfaceLink("Dashboard", "marketing.home") ?? {
		label: "Dashboard",
		href: "/",
	};
const demoLink = getAvailableInternalRouteLink("Demo", "demo");
const intelligenceLink = getAvailableInternalRouteLink(
	"Intelligence",
	"intelligence",
);
const playgroundLink = getAvailableInternalRouteLink(
	"Playground",
	"playground",
);
const dictionaryLink = getAvailableInternalRouteLink(
	"Dictionary",
	"dictionary",
);
const referenceLink = getAvailableInternalRouteLink("Reference", "reference");
const internalRouteLinks = omitMissingLinks<SiteLink>([
	demoLink,
	intelligenceLink,
	playgroundLink,
	dictionaryLink,
	referenceLink,
]);
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
		menuGroups: [
			{
				label: "Start",
				link: homeLink,
				links: omitMissingLinks<SiteLink>([
					{ label: "Hero", href: "/#home-hero" },
					contactLink,
					settingsLink,
				]),
			},
			...omitMissingLinks([developerMenuGroup]),
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
			contactLink,
			demoLink,
			intelligenceLink,
			playgroundLink,
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
				links: omitMissingLinks<SiteLink>([
					{ label: "Hero", href: "/#home-hero" },
					contactLink,
					settingsLink,
				]),
			},
			...omitMissingLinks([developerMenuGroup]),
		],
		topNavLinks: omitMissingLinks([
			homeLink,
			demoLink,
			intelligenceLink,
			playgroundLink,
			settingsLink,
		]),
	},
	socialLinks: [
		{ label: "X", icon: "x", href: "" },
		{ label: "Instagram", icon: "instagram", href: "" },
		{ label: "LinkedIn", icon: "linked-in", href: "" },
		{ label: "Meta", icon: "meta", href: "" },
		{ label: "You Tube", icon: "youtube", href: "" },
	],
	footer: {
		navLinks: omitMissingLinks([homeLink, contactLink, settingsLink]),
	},
};
