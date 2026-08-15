import type {
	DocumentMarketingPageDocument,
	HomeHeroSectionBlock,
	HomeMarketingPageDocument,
	MarkdownDocumentContentBlock,
	MarketingLink,
	MarketingPageBySlug,
	MarketingPageDocument,
	MarketingPageSlug,
	TemplateServiceSurfaceId,
} from "@/lib/marketing-content/types";
import {
	marketingPageSlugs,
	templateServiceSurfaceIds,
} from "@/lib/marketing-content/types";
import { isStaticAppSurfaceId } from "@/lib/routes";

type UnknownRecord = Record<string, unknown>;

type PayloadHomeHeroInput = {
	blockType: "homeHero";
	cta:
		| { href: string; kind: "href"; label: string }
		| { kind: "surface"; label: string; surfaceId: string };
	descriptions: Array<{ text: string }>;
	headline: string;
	id?: string;
	services: Array<{
		description: string;
		serviceId: string;
		surfaceIds: TemplateServiceSurfaceId[];
		title: string;
	}>;
};

type PayloadMarkdownDocumentInput = {
	blockType: "markdownDocument";
	date: string;
	id?: string;
	markdown: string;
};

export type PayloadHomeMarketingPageInput = {
	description: string;
	layout: PayloadHomeHeroInput[];
	slug: "home";
	title: string;
};

export type PayloadDocumentMarketingPageInput = {
	description: string;
	layout: [PayloadMarkdownDocumentInput];
	slug: "document";
	title: string;
};

export type PayloadMarketingPageInput =
	| PayloadDocumentMarketingPageInput
	| PayloadHomeMarketingPageInput;

function asRecord(value: unknown, path: string): UnknownRecord {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`Payload marketing page requires an object at ${path}.`);
	}
	return value as UnknownRecord;
}

function requiredString(value: unknown, path: string) {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(
			`Payload marketing page requires a non-empty string at ${path}.`,
		);
	}
	return value;
}

function requiredDateString(value: unknown, path: string) {
	const date = requiredString(value, path);
	if (Number.isNaN(Date.parse(date))) {
		throw new Error(
			`Payload marketing page requires a valid date string at ${path}.`,
		);
	}
	return date;
}

function optionalString(value: unknown, path: string) {
	if (value === undefined || value === null || value === "") return undefined;
	return requiredString(value, path);
}

function requiredArray(value: unknown, path: string) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new Error(
			`Payload marketing page requires a non-empty array at ${path}.`,
		);
	}
	return value;
}

function normalizeLink(value: unknown, path: string): MarketingLink {
	const input = asRecord(value, path);
	const kind = requiredString(input.kind, `${path}.kind`);
	const label = requiredString(input.label, `${path}.label`);

	if (kind === "surface") {
		if (input.href !== undefined && input.href !== null) {
			throw new Error(`${path} cannot define both href and surfaceId.`);
		}
		const surfaceId = requiredString(input.surfaceId, `${path}.surfaceId`);
		if (!isStaticAppSurfaceId(surfaceId)) {
			throw new Error(
				`Payload marketing page references unavailable surface ${surfaceId} at ${path}.`,
			);
		}
		return { label, surfaceId };
	}

	if (kind === "href") {
		if (input.surfaceId !== undefined && input.surfaceId !== null) {
			throw new Error(`${path} cannot define both href and surfaceId.`);
		}
		return {
			href: requiredString(input.href, `${path}.href`),
			label,
		};
	}

	throw new Error(`${path}.kind must be either "surface" or "href".`);
}

const templateServiceSurfaceIdSet = new Set<string>(templateServiceSurfaceIds);

function normalizeServiceSurfaceIds(value: unknown, path: string) {
	return requiredArray(value, path).map((surfaceId, index) => {
		const itemPath = `${path}[${index}]`;
		const normalized = requiredString(surfaceId, itemPath);
		if (!templateServiceSurfaceIdSet.has(normalized)) {
			throw new Error(
				`Payload marketing page has unsupported service surface ${normalized} at ${itemPath}.`,
			);
		}
		return normalized as TemplateServiceSurfaceId;
	});
}

function normalizeHomeHero(value: unknown, path: string): HomeHeroSectionBlock {
	const input = asRecord(value, path);
	const id = optionalString(input.id, `${path}.id`);

	return {
		blockType: "homeHero",
		...(id ? { id } : {}),
		cta: normalizeLink(input.cta, `${path}.cta`),
		descriptions: requiredArray(input.descriptions, `${path}.descriptions`).map(
			(description, index) => {
				const itemPath = `${path}.descriptions[${index}]`;
				const item = asRecord(description, itemPath);
				return { text: requiredString(item.text, `${itemPath}.text`) };
			},
		),
		headline: requiredString(input.headline, `${path}.headline`),
		services: requiredArray(input.services, `${path}.services`).map(
			(service, index) => {
				const itemPath = `${path}.services[${index}]`;
				const item = asRecord(service, itemPath);
				return {
					description: requiredString(
						item.description,
						`${itemPath}.description`,
					),
					id: requiredString(item.serviceId, `${itemPath}.serviceId`),
					surfaceIds: normalizeServiceSurfaceIds(
						item.surfaceIds,
						`${itemPath}.surfaceIds`,
					),
					title: requiredString(item.title, `${itemPath}.title`),
				};
			},
		),
	};
}

function normalizeMarkdownDocument(
	value: unknown,
	path: string,
): MarkdownDocumentContentBlock {
	const input = asRecord(value, path);
	const id = optionalString(input.id, `${path}.id`);

	return {
		blockType: "markdownDocument",
		...(id ? { id } : {}),
		date: requiredDateString(input.date, `${path}.date`),
		markdown: requiredString(input.markdown, `${path}.markdown`),
	};
}

function normalizeHomeSection(
	value: unknown,
	path: string,
): HomeHeroSectionBlock {
	const input = asRecord(value, path);
	const blockType = requiredString(input.blockType, `${path}.blockType`);
	if (blockType === "homeHero") return normalizeHomeHero(input, path);
	throw new Error(
		`Payload home page has unsupported blockType ${blockType} at ${path}.`,
	);
}

export function normalizePayloadMarketingPage<TSlug extends MarketingPageSlug>(
	value: unknown,
	expectedSlug: TSlug,
): MarketingPageBySlug[TSlug];
export function normalizePayloadMarketingPage(
	value: unknown,
): MarketingPageDocument;
export function normalizePayloadMarketingPage(
	value: unknown,
	expectedSlug?: MarketingPageSlug,
): MarketingPageDocument {
	const input = asRecord(value, "marketingPage");
	const slug = requiredString(input.slug, "marketingPage.slug");
	if (!marketingPageSlugs.includes(slug as MarketingPageSlug)) {
		throw new Error(`Payload marketing page has unsupported slug ${slug}.`);
	}
	if (expectedSlug && slug !== expectedSlug) {
		throw new Error(
			`Payload marketing page returned slug ${slug}; expected ${expectedSlug}.`,
		);
	}

	const description = requiredString(
		input.description,
		"marketingPage.description",
	);
	const title = requiredString(input.title, "marketingPage.title");
	const layout = requiredArray(input.layout, "marketingPage.layout");

	if (slug === "document") {
		if (layout.length !== 1) {
			throw new Error(
				"Payload document page requires exactly one Markdown document block at marketingPage.layout.",
			);
		}
		const block = asRecord(layout[0], "marketingPage.layout[0]");
		const blockType = requiredString(
			block.blockType,
			"marketingPage.layout[0].blockType",
		);
		if (blockType !== "markdownDocument") {
			throw new Error(
				`Payload document page requires a markdownDocument block at marketingPage.layout[0]; received ${blockType}.`,
			);
		}

		return {
			description,
			layout: [normalizeMarkdownDocument(block, "marketingPage.layout[0]")],
			slug: "document",
			title,
		};
	}

	return {
		description,
		layout: layout.map((section, index) =>
			normalizeHomeSection(section, `marketingPage.layout[${index}]`),
		),
		slug: "home",
		title,
	};
}

function serializeLink(link: MarketingLink) {
	if (typeof link.surfaceId === "string") {
		return {
			kind: "surface" as const,
			label: link.label,
			surfaceId: link.surfaceId,
		};
	}
	return { href: link.href, kind: "href" as const, label: link.label };
}

export function serializeMarketingPageForPayload(
	page: DocumentMarketingPageDocument,
): PayloadDocumentMarketingPageInput;
export function serializeMarketingPageForPayload(
	page: HomeMarketingPageDocument,
): PayloadHomeMarketingPageInput;
export function serializeMarketingPageForPayload(
	page: MarketingPageDocument,
): PayloadMarketingPageInput;
export function serializeMarketingPageForPayload(
	page: MarketingPageDocument,
): PayloadMarketingPageInput {
	if (page.slug === "document") {
		const [document] = page.layout;
		return {
			description: page.description,
			layout: [
				{
					blockType: "markdownDocument",
					...(document.id ? { id: document.id } : {}),
					date: document.date,
					markdown: document.markdown,
				},
			],
			slug: "document",
			title: page.title,
		};
	}

	return {
		description: page.description,
		layout: page.layout.map((section) => {
			return {
				blockType: "homeHero" as const,
				...(section.id ? { id: section.id } : {}),
				cta: serializeLink(section.cta),
				descriptions: section.descriptions.map(({ text }) => ({ text })),
				headline: section.headline,
				services: section.services.map((service) => ({
					description: service.description,
					serviceId: service.id,
					surfaceIds: [...service.surfaceIds],
					title: service.title,
				})),
			};
		}),
		slug: "home",
		title: page.title,
	};
}
