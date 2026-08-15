import assert from "node:assert/strict";
import config from "@payload-config";
import { getPayload } from "payload";
import { fallbackMarketingPages } from "@/lib/marketing-content/fallback";
import { isPayloadConfigured } from "@/payload/isPayloadConfigured";
import {
	normalizePayloadMarketingPage,
	serializeMarketingPageForPayload,
} from "@/payload/marketingPageDocument";

async function main() {
	const mode = process.argv[2];
	if (mode !== "--seed" && mode !== "--verify") {
		throw new Error("Use --seed or --verify.");
	}
	if (!isPayloadConfigured()) {
		throw new Error(
			"Marketing-page backfill requires DATABASE_URL and PAYLOAD_SECRET in the local environment.",
		);
	}

	const payload = await getPayload({ config });
	for (const page of Object.values(fallbackMarketingPages)) {
		if (mode === "--seed") {
			const existing = await payload.find({
				collection: "pages",
				depth: 0,
				limit: 1,
				overrideAccess: true,
				where: { slug: { equals: page.slug } },
			});
			const data = {
				...serializeMarketingPageForPayload(page),
				_status: "published" as const,
			};
			const current = existing.docs[0];
			if (current) {
				await payload.update({
					collection: "pages",
					id: current.id,
					data,
					depth: 0,
					overrideAccess: true,
				});
			} else {
				await payload.create({
					collection: "pages",
					data,
					depth: 0,
					overrideAccess: true,
				});
			}
		}

		const readback = await payload.find({
			collection: "pages",
			draft: false,
			depth: 0,
			limit: 1,
			overrideAccess: true,
			where: { slug: { equals: page.slug } },
		});
		const rawPage = readback.docs[0];
		if (rawPage?._status !== "published") {
			throw new Error(
				`Payload marketing-page readback is not published for ${page.slug}.`,
			);
		}
		assert.deepStrictEqual(
			normalizePayloadMarketingPage(rawPage, page.slug),
			page,
			`Normalized Payload page ${page.slug} differs from the committed fallback.`,
		);
	}

	console.log(
		mode === "--seed"
			? "Seeded and verified the published Payload marketing pages."
			: "Verified the published Payload marketing pages.",
	);
}

void main();
