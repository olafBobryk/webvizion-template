import { cache } from "react";
import { getConfiguredMarketingPage, getConfiguredSiteLayout } from "./source";
import type {
	MarketingPageDocument,
	MarketingPageSlug,
	SiteLayoutDocument,
} from "./types";

const getCachedMarketingPage = cache(
	async (slug: MarketingPageSlug): Promise<MarketingPageDocument> =>
		getConfiguredMarketingPage(slug),
);

export async function getMarketingPage(slug: MarketingPageSlug) {
	return getCachedMarketingPage(slug);
}

export async function getSiteLayout(): Promise<SiteLayoutDocument> {
	return getConfiguredSiteLayout();
}
