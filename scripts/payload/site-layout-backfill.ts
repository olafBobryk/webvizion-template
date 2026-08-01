import assert from "node:assert/strict";
import config from "@payload-config";
import { getPayload } from "payload";
import { fallbackSiteLayout } from "@/lib/marketing-content/fallback";
import {
	normalizePayloadSiteLayout,
	serializeSiteLayoutForPayload,
} from "@/lib/marketing-content/payloadSiteLayout";
import { isPayloadConfigured } from "@/payload/isPayloadConfigured";

async function main() {
	const mode = process.argv[2];

	if (mode !== "--seed" && mode !== "--verify") {
		throw new Error("Use --seed or --verify.");
	}

	if (!isPayloadConfigured()) {
		throw new Error(
			"Site-layout backfill requires DATABASE_URL and PAYLOAD_SECRET in the local environment.",
		);
	}

	const payload = await getPayload({ config });

	if (mode === "--seed") {
		await payload.updateGlobal({
			slug: "site-layout",
			data: {
				...serializeSiteLayoutForPayload(fallbackSiteLayout),
				_status: "published",
			},
			depth: 0,
			overrideAccess: true,
			context: {
				siteLayoutBackfill: true,
			},
		});
	}

	const rawLayout = await payload.findGlobal({
		slug: "site-layout",
		draft: false,
		depth: 0,
		overrideAccess: true,
	});

	if (rawLayout._status !== "published") {
		throw new Error("Payload site-layout readback is not published.");
	}

	assert.deepStrictEqual(
		normalizePayloadSiteLayout(rawLayout),
		fallbackSiteLayout,
		"Normalized Payload site-layout readback differs from the committed fallback.",
	);

	console.log(
		mode === "--seed"
			? "Seeded and verified the published Payload site-layout global."
			: "Verified the published Payload site-layout global.",
	);
}

void main();
