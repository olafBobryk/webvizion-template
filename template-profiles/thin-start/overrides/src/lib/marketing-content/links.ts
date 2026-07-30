import { hrefFor } from "@/lib/routes";
import type { MarketingLink } from "./types";

export function getMarketingLinkHref(link: MarketingLink) {
	if (link.surfaceId) {
		return hrefFor(link.surfaceId);
	}

	return link.href;
}
