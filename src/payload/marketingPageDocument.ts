import type {
	HomeHeroSectionBlock,
	MarketingLink,
	MarketingPageDocument,
	MarketingPageSlug,
	MarketingSection,
	TemplateServiceSurfaceId,
} from "@/lib/marketing-content/types";
import {
	marketingPageSlugs,
	templateServiceSurfaceIds,
} from "@/lib/marketing-content/types";
import { isStaticAppSurfaceId } from "@/lib/routes";

type UnknownRecord = Record<string, unknown>;

export type PayloadMarketingPageInput = {
	description: string;
	layout: Array<{
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
	}>;
	slug: MarketingPageSlug;
	title: string;
};

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

function normalizeSection(value: unknown, path: string): MarketingSection {
	const input = asRecord(value, path);
	const blockType = requiredString(input.blockType, `${path}.blockType`);
	if (blockType === "homeHero") return normalizeHomeHero(input, path);
	throw new Error(
		`Payload marketing page has unsupported blockType ${blockType} at ${path}.`,
	);
}

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

	return {
		description: requiredString(input.description, "marketingPage.description"),
		layout: requiredArray(input.layout, "marketingPage.layout").map(
			(section, index) =>
				normalizeSection(section, `marketingPage.layout[${index}]`),
		),
		slug: slug as MarketingPageSlug,
		title: requiredString(input.title, "marketingPage.title"),
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
	page: MarketingPageDocument,
): PayloadMarketingPageInput {
	return {
		description: page.description,
		layout: page.layout.map((section) => ({
			blockType: "homeHero",
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
		})),
		slug: page.slug,
		title: page.title,
	};
}
