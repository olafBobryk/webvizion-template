import { fallbackMarketingPages } from "@/lib/marketing-content/fallback";
import type {
	MarketingPageDocument,
	MarketingPageSlug,
} from "@/lib/marketing-content/types";
import { isPayloadConfigured } from "@/payload/isPayloadConfigured";
import { normalizePayloadMarketingPage } from "@/payload/marketingPageDocument";
import { getMarketingContentSource } from "@/payload/siteLayoutSource";

type MarketingPageSourceOptions = {
	configured?: boolean;
	mode?: string;
	readPayload?: (slug: MarketingPageSlug) => Promise<unknown>;
};

async function readPublishedPayloadMarketingPage(slug: MarketingPageSlug) {
	const [{ getPayload }, { default: config }] = await Promise.all([
		import("payload"),
		import("@payload-config"),
	]);
	const payload = await getPayload({ config });
	const result = await payload.find({
		collection: "pages",
		draft: false,
		depth: 0,
		limit: 1,
		overrideAccess: true,
		where: { slug: { equals: slug } },
	});
	const page = result.docs[0];
	if (!page) {
		throw new Error(
			`Payload has no published marketing page for slug ${slug}.`,
		);
	}
	return page;
}

export async function getConfiguredMarketingPage(
	slug: MarketingPageSlug,
	options: MarketingPageSourceOptions = {},
): Promise<MarketingPageDocument> {
	const mode = getMarketingContentSource(options.mode);
	if (mode === "fallback") return fallbackMarketingPages[slug];

	if (
		options.configured === false ||
		(!options.configured && !isPayloadConfigured())
	) {
		throw new Error(
			"MARKETING_CONTENT_SOURCE=payload requires DATABASE_URL and PAYLOAD_SECRET.",
		);
	}

	const rawPage = await (
		options.readPayload ?? readPublishedPayloadMarketingPage
	)(slug);
	return normalizePayloadMarketingPage(rawPage, slug);
}
