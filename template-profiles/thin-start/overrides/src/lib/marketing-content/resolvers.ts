import { cache } from "react";
import { getConfiguredMarketingPage, getConfiguredSiteLayout } from "./source";
import type {
	MarketingPageBySlug,
	MarketingPageDocument,
	MarketingPageSlug,
	SiteLayoutDocument,
} from "./types";

const getCachedMarketingPage = cache(
	async (slug: MarketingPageSlug): Promise<MarketingPageDocument> =>
		getConfiguredMarketingPage(slug),
);

export async function getMarketingPage<TSlug extends MarketingPageSlug>(
	slug: TSlug,
): Promise<MarketingPageBySlug[TSlug]> {
	return (await getCachedMarketingPage(slug)) as MarketingPageBySlug[TSlug];
}

export async function getSiteLayout(): Promise<SiteLayoutDocument> {
	return getConfiguredSiteLayout();
}
