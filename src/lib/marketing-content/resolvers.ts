import { cache } from "react";
import { getConfiguredMarketingPage, getConfiguredSiteLayout } from "./source";
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

const getCachedMarketingPage = cache(
	async (slug: MarketingPageSlug): Promise<MarketingPageDocument> =>
		getConfiguredMarketingPage(slug),
);

export async function getMarketingPage(slug: MarketingPageSlug) {
	return getCachedMarketingPage(slug);
}

export async function getSiteLayout(): Promise<SiteLayoutDocument> {
	return limitSiteLayoutMenuGroups(await getConfiguredSiteLayout());
}
