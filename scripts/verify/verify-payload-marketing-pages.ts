import assert from "node:assert/strict";
import { fallbackHomePage } from "@/lib/marketing-content/fallback";
import {
	normalizePayloadMarketingPage,
	serializeMarketingPageForPayload,
} from "@/payload/marketingPageDocument";
import { getConfiguredMarketingPage } from "@/payload/marketingPageSource";

async function main() {
	let fallbackReadCalled = false;
	assert.strictEqual(
		await getConfiguredMarketingPage("home", {
			configured: false,
			mode: "fallback",
			readPayload: async () => {
				fallbackReadCalled = true;
				return {};
			},
		}),
		fallbackHomePage,
	);
	assert.equal(fallbackReadCalled, false);

	const serialized = serializeMarketingPageForPayload(fallbackHomePage);
	assert.deepStrictEqual(
		normalizePayloadMarketingPage(serialized, "home"),
		fallbackHomePage,
	);
	assert.deepStrictEqual(
		await getConfiguredMarketingPage("home", {
			configured: true,
			mode: "payload",
			readPayload: async () => serialized,
		}),
		fallbackHomePage,
	);

	await assert.rejects(
		getConfiguredMarketingPage("home", {
			configured: false,
			mode: "payload",
		}),
		/requires DATABASE_URL and PAYLOAD_SECRET/,
	);
	await assert.rejects(
		getConfiguredMarketingPage("home", {
			configured: true,
			mode: "payload",
			readPayload: async () => {
				throw new Error("database unavailable");
			},
		}),
		/database unavailable/,
	);
	await assert.rejects(
		getConfiguredMarketingPage("home", {
			configured: true,
			mode: "payload",
			readPayload: async () => ({}),
		}),
		/requires a non-empty string at marketingPage.slug/,
	);
	await assert.rejects(
		getConfiguredMarketingPage("home", {
			configured: true,
			mode: "payload",
			readPayload: async () => ({ ...serialized, slug: "other" }),
		}),
		/unsupported slug other/,
	);

	console.log("Guarded Payload marketing-page source selection verified.");
}

void main();
