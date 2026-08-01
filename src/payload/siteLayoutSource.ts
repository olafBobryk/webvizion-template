import type { SiteLayoutDocument } from "@/app/(site)/_components/layout/siteLayout";
import { fallbackSiteLayout } from "@/lib/marketing-content/fallback";
import { normalizePayloadSiteLayout } from "@/lib/marketing-content/payloadSiteLayout";
import { isPayloadConfigured } from "@/payload/isPayloadConfigured";

export type MarketingContentSource = "fallback" | "payload";

type SiteLayoutSourceOptions = {
	configured?: boolean;
	mode?: string;
	readPayload?: () => Promise<unknown>;
};

export function getMarketingContentSource(
	value = process.env.MARKETING_CONTENT_SOURCE,
): MarketingContentSource {
	if (!value || value === "fallback") return "fallback";
	if (value === "payload") return "payload";
	throw new Error(
		'MARKETING_CONTENT_SOURCE must be either "fallback" or "payload".',
	);
}

async function readPublishedPayloadSiteLayout() {
	const [{ getPayload }, { default: config }] = await Promise.all([
		import("payload"),
		import("@payload-config"),
	]);
	const payload = await getPayload({ config });
	return payload.findGlobal({
		slug: "site-layout",
		draft: false,
		depth: 0,
		overrideAccess: true,
	});
}

export async function getConfiguredSiteLayout(
	options: SiteLayoutSourceOptions = {},
): Promise<SiteLayoutDocument> {
	const mode = getMarketingContentSource(options.mode);
	if (mode === "fallback") return fallbackSiteLayout;

	if (
		options.configured === false ||
		(!options.configured && !isPayloadConfigured())
	) {
		throw new Error(
			"MARKETING_CONTENT_SOURCE=payload requires DATABASE_URL and PAYLOAD_SECRET.",
		);
	}

	const rawLayout = await (
		options.readPayload ?? readPublishedPayloadSiteLayout
	)();
	return normalizePayloadSiteLayout(rawLayout);
}
