import assert from "node:assert/strict";
import { fallbackSiteLayout } from "@/lib/marketing-content/fallback";
import { serializeSiteLayoutForPayload } from "@/lib/marketing-content/payloadSiteLayout";
import {
	getConfiguredSiteLayout,
	getMarketingContentSource,
} from "@/payload/siteLayoutSource";

async function main() {
	let fallbackReadCalled = false;
	assert.strictEqual(
		await getConfiguredSiteLayout({
			configured: false,
			mode: "fallback",
			readPayload: async () => {
				fallbackReadCalled = true;
				return {};
			},
		}),
		fallbackSiteLayout,
	);
	assert.equal(fallbackReadCalled, false);

	assert.deepStrictEqual(
		await getConfiguredSiteLayout({
			configured: true,
			mode: "payload",
			readPayload: async () =>
				serializeSiteLayoutForPayload(fallbackSiteLayout),
		}),
		fallbackSiteLayout,
	);

	await assert.rejects(
		getConfiguredSiteLayout({ configured: false, mode: "payload" }),
		/requires DATABASE_URL and PAYLOAD_SECRET/,
	);
	await assert.rejects(
		getConfiguredSiteLayout({
			configured: true,
			mode: "payload",
			readPayload: async () => {
				throw new Error("database unavailable");
			},
		}),
		/database unavailable/,
	);
	await assert.rejects(
		getConfiguredSiteLayout({
			configured: true,
			mode: "payload",
			readPayload: async () => ({}),
		}),
		/requires an object at siteLayout.header/,
	);
	assert.throws(
		() => getMarketingContentSource("unexpected"),
		/MARKETING_CONTENT_SOURCE/,
	);

	console.log("Guarded Payload site-layout source selection verified.");
}

void main();
