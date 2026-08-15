import assert from "node:assert/strict";
import {
	fallbackDocumentPage,
	fallbackHomePage,
} from "@/lib/marketing-content/fallback";
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

	const serializedDocument =
		serializeMarketingPageForPayload(fallbackDocumentPage);
	assert.equal(serializedDocument.title, fallbackDocumentPage.title);
	assert.equal(serializedDocument.layout[0].date, "2026-08-15T12:00:00.000Z");
	assert.equal("title" in serializedDocument.layout[0], false);
	assert.equal("eyebrow" in serializedDocument.layout[0], false);
	assert.deepStrictEqual(
		normalizePayloadMarketingPage(serializedDocument, "document"),
		fallbackDocumentPage,
	);
	assert.throws(
		() =>
			normalizePayloadMarketingPage(
				{ ...serializedDocument, layout: [] },
				"document",
			),
		/requires a non-empty array at marketingPage.layout/,
	);
	assert.throws(
		() =>
			normalizePayloadMarketingPage(
				{
					...serializedDocument,
					layout: [serializedDocument.layout[0], serializedDocument.layout[0]],
				},
				"document",
			),
		/requires exactly one Markdown document block/,
	);
	assert.throws(
		() =>
			normalizePayloadMarketingPage(
				{
					...serializedDocument,
					layout: [{ ...serializedDocument.layout[0], date: "not-a-date" }],
				},
				"document",
			),
		/requires a valid date string at marketingPage.layout\[0\]\.date/,
	);
	assert.deepStrictEqual(
		await getConfiguredMarketingPage("document", {
			configured: true,
			mode: "payload",
			readPayload: async () => serializedDocument,
		}),
		fallbackDocumentPage,
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
