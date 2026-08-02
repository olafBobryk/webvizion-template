import {
	getAvailableInternalRouteLink,
	getAvailableSiteSurfaceLink,
	getSiteLinkHref,
	type SiteLink,
	type SiteSocialLink,
} from "@/app/(site)/_components/layout/siteLayout";

export { getSiteLinkHref as getMarketingLinkHref };

export const publicSocialLinks: SiteSocialLink[] = [
	{
		label: "GitHub",
		icon: "github",
		href: "https://github.com/olafBobryk/averlo-next-template",
	},
	{
		label: "Instagram",
		icon: "instagram",
		href: "https://www.instagram.com/averlo.co/",
	},
	{
		label: "TikTok",
		icon: "tiktok",
		href: "https://www.tiktok.com/@averloagency",
	},
	{
		label: "LinkedIn",
		icon: "linked-in",
		href: "https://www.linkedin.com/company/averlo",
	},
];

export function getMarketingSiteLinks() {
	const home: SiteLink = getAvailableSiteSurfaceLink(
		"Home",
		"marketing.home",
	) ?? { label: "Home", href: "/" };
	const settings = getAvailableSiteSurfaceLink(
		"Settings",
		"marketing.settings",
	);
	const contact = getAvailableSiteSurfaceLink("Contact", "marketing.contact");
	const dashboard: SiteLink = getAvailableSiteSurfaceLink(
		"Dashboard",
		"auth.login",
	) ??
		getAvailableSiteSurfaceLink("Dashboard", "marketing.home") ?? {
			label: "Dashboard",
			href: "/",
		};

	return {
		contact,
		dashboard,
		demo: getAvailableInternalRouteLink("Component Export", "demo"),
		dictionary: getAvailableInternalRouteLink("Dictionary", "dictionary"),
		home,
		intelligence: getAvailableInternalRouteLink("Intelligence", "intelligence"),
		playground: getAvailableInternalRouteLink("Playground", "playground"),
		reference: getAvailableInternalRouteLink("Reference", "reference"),
		settings,
	};
}
