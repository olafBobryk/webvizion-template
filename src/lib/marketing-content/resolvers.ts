import { fallbackMarketingPages } from "./fallback";
import { getConfiguredSiteLayout } from "./source";
import type {
	MarketingPageDocument,
	MarketingPageSlug,
	SiteLayoutDocument,
} from "./types";

const MENU_GROUP_LINK_LIMIT = 6;

const limitMenuGroupLinks = (
	groups: SiteLayoutDocument["header"]["menuGroups"],
) =>
	groups.map((group) => ({
		...group,
		links: group.links?.slice(0, MENU_GROUP_LINK_LIMIT),
	}));

const limitSiteLayoutMenuGroups = (
	layout: SiteLayoutDocument,
): SiteLayoutDocument => ({
	...layout,
	header: {
		...layout.header,
		menuGroups: limitMenuGroupLinks(layout.header.menuGroups),
		searchGroups: limitMenuGroupLinks(layout.header.searchGroups),
	},
});

export async function getMarketingPage(
	slug: MarketingPageSlug,
): Promise<MarketingPageDocument> {
	return fallbackMarketingPages[slug] ?? fallbackMarketingPages.home;
}

export async function getSiteLayout(): Promise<SiteLayoutDocument> {
	return limitSiteLayoutMenuGroups(await getConfiguredSiteLayout());
}
