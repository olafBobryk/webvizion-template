import type {
	SiteLayoutDocument,
	SiteLink,
	SiteMenuGroup,
	SiteNavLink,
	SiteNavSection,
	SiteSocialLink,
} from "@/app/(site)/_components/layout/siteLayout";
import { isStaticAppSurfaceId } from "@/lib/routes";

type UnknownRecord = Record<string, unknown>;

export type PayloadSiteLinkInput = {
	href?: string;
	kind: "href" | "surface";
	label: string;
	surfaceId?: string;
};

export type PayloadSiteLayoutInput = {
	footer: {
		navLinks: PayloadSiteLinkInput[];
	};
	header: {
		cta: PayloadSiteLinkInput;
		menuGroups: Array<{
			icon?: string;
			label: string;
			link?: PayloadSiteLinkInput;
			links?: PayloadSiteLinkInput[];
		}>;
		mobile: {
			closeAriaLabel: string;
			menuLabel: string;
			openAriaLabel: string;
		};
		navLinks: Array<
			PayloadSiteLinkInput & {
				sections?: Array<
					PayloadSiteLinkInput & {
						description?: string;
						icon?: string;
					}
				>;
			}
		>;
		search: {
			ariaLabel: string;
			clearLabel: string;
			noResultsText: string;
		};
		searchGroups: Array<{
			icon?: string;
			label: string;
			link?: PayloadSiteLinkInput;
			links?: PayloadSiteLinkInput[];
		}>;
		topNavLinks: PayloadSiteLinkInput[];
	};
	socialLinks: Array<{
		href: string;
		icon: string;
		label: string;
	}>;
};

function asRecord(value: unknown, path: string): UnknownRecord {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`Payload site layout requires an object at ${path}.`);
	}
	return value as UnknownRecord;
}

function requiredString(value: unknown, path: string): string {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(
			`Payload site layout requires a non-empty string at ${path}.`,
		);
	}
	return value;
}

function optionalString(value: unknown, path: string): string | undefined {
	if (value === undefined || value === null || value === "") return undefined;
	return requiredString(value, path);
}

function optionalArray(value: unknown, path: string): unknown[] | undefined {
	if (value === undefined || value === null) return undefined;
	if (!Array.isArray(value)) {
		throw new Error(`Payload site layout requires an array at ${path}.`);
	}
	return value;
}

function normalizeLink(
	value: unknown,
	path: string,
	allowUnavailableSurface: boolean,
): SiteLink | null {
	const input = asRecord(value, path);
	const label = requiredString(input.label, `${path}.label`);
	const kind = requiredString(input.kind, `${path}.kind`);

	if (kind === "href") {
		if (input.surfaceId !== undefined && input.surfaceId !== null) {
			throw new Error(`${path} cannot define both href and surfaceId.`);
		}
		return {
			href: requiredString(input.href, `${path}.href`),
			label,
		};
	}

	if (kind === "surface") {
		if (input.href !== undefined && input.href !== null) {
			throw new Error(`${path} cannot define both surfaceId and href.`);
		}
		const surfaceId = requiredString(input.surfaceId, `${path}.surfaceId`);
		if (!isStaticAppSurfaceId(surfaceId)) {
			if (allowUnavailableSurface) return null;
			throw new Error(
				`Payload site layout references unavailable required surface ${surfaceId} at ${path}.`,
			);
		}
		return { label, surfaceId };
	}

	throw new Error(`${path}.kind must be either "surface" or "href".`);
}

function normalizeOptionalLink(
	value: unknown,
	path: string,
): SiteLink | undefined {
	if (value === undefined || value === null) return undefined;
	return normalizeLink(value, path, true) ?? undefined;
}

function normalizeLinks(value: unknown, path: string): SiteLink[] {
	return (optionalArray(value, path) ?? [])
		.map((link, index) => normalizeLink(link, `${path}[${index}]`, true))
		.filter((link): link is SiteLink => link !== null);
}

function normalizeNavSection(
	value: unknown,
	path: string,
): SiteNavSection | null {
	const input = asRecord(value, path);
	const link = normalizeLink(input, path, true);
	if (!link) return null;
	const description = optionalString(input.description, `${path}.description`);
	const icon = optionalString(input.icon, `${path}.icon`);
	return {
		...link,
		...(description ? { description } : {}),
		...(icon ? { icon } : {}),
	};
}

function normalizeNavLink(value: unknown, path: string): SiteNavLink | null {
	const input = asRecord(value, path);
	const link = normalizeLink(input, path, true);
	if (!link) return null;
	const sectionInputs = optionalArray(input.sections, `${path}.sections`);
	const sections = sectionInputs
		?.map((section, index) =>
			normalizeNavSection(section, `${path}.sections[${index}]`),
		)
		.filter((section): section is SiteNavSection => section !== null);
	return {
		...link,
		...(sectionInputs ? { sections } : {}),
	};
}

function normalizeMenuGroup(value: unknown, path: string): SiteMenuGroup {
	const input = asRecord(value, path);
	const link = normalizeOptionalLink(input.link, `${path}.link`);
	const linkInputs = optionalArray(input.links, `${path}.links`);
	const icon = optionalString(input.icon, `${path}.icon`);
	return {
		label: requiredString(input.label, `${path}.label`),
		...(icon ? { icon } : {}),
		...(link ? { link } : {}),
		...(linkInputs
			? { links: normalizeLinks(linkInputs, `${path}.links`) }
			: {}),
	};
}

function normalizeMenuGroups(value: unknown, path: string): SiteMenuGroup[] {
	return (optionalArray(value, path) ?? []).map((group, index) =>
		normalizeMenuGroup(group, `${path}[${index}]`),
	);
}

function normalizeSocialLinks(value: unknown, path: string): SiteSocialLink[] {
	return (optionalArray(value, path) ?? []).map((link, index) => {
		const itemPath = `${path}[${index}]`;
		const input = asRecord(link, itemPath);
		return {
			href: requiredString(input.href, `${itemPath}.href`),
			icon: requiredString(input.icon, `${itemPath}.icon`),
			label: requiredString(input.label, `${itemPath}.label`),
		};
	});
}

export function normalizePayloadSiteLayout(value: unknown): SiteLayoutDocument {
	const input = asRecord(value, "siteLayout");
	const header = asRecord(input.header, "siteLayout.header");
	const mobile = asRecord(header.mobile, "siteLayout.header.mobile");
	const search = asRecord(header.search, "siteLayout.header.search");
	const footer = asRecord(input.footer, "siteLayout.footer");
	const cta = normalizeLink(header.cta, "siteLayout.header.cta", false);

	if (!cta) {
		throw new Error("Payload site layout requires an available header CTA.");
	}

	return {
		header: {
			cta,
			menuGroups: normalizeMenuGroups(
				header.menuGroups,
				"siteLayout.header.menuGroups",
			),
			mobile: {
				closeAriaLabel: requiredString(
					mobile.closeAriaLabel,
					"siteLayout.header.mobile.closeAriaLabel",
				),
				menuLabel: requiredString(
					mobile.menuLabel,
					"siteLayout.header.mobile.menuLabel",
				),
				openAriaLabel: requiredString(
					mobile.openAriaLabel,
					"siteLayout.header.mobile.openAriaLabel",
				),
			},
			navLinks: (
				optionalArray(header.navLinks, "siteLayout.header.navLinks") ?? []
			)
				.map((link, index) =>
					normalizeNavLink(link, `siteLayout.header.navLinks[${index}]`),
				)
				.filter((link): link is SiteNavLink => link !== null),
			search: {
				ariaLabel: requiredString(
					search.ariaLabel,
					"siteLayout.header.search.ariaLabel",
				),
				clearLabel: requiredString(
					search.clearLabel,
					"siteLayout.header.search.clearLabel",
				),
				noResultsText: requiredString(
					search.noResultsText,
					"siteLayout.header.search.noResultsText",
				),
			},
			searchGroups: normalizeMenuGroups(
				header.searchGroups,
				"siteLayout.header.searchGroups",
			),
			topNavLinks: normalizeLinks(
				header.topNavLinks,
				"siteLayout.header.topNavLinks",
			),
		},
		socialLinks: normalizeSocialLinks(
			input.socialLinks,
			"siteLayout.socialLinks",
		),
		footer: {
			navLinks: normalizeLinks(footer.navLinks, "siteLayout.footer.navLinks"),
		},
	};
}

function serializeLink(link: SiteLink): PayloadSiteLinkInput {
	return "surfaceId" in link
		? { kind: "surface", label: link.label, surfaceId: link.surfaceId }
		: { href: link.href, kind: "href", label: link.label };
}

function serializeMenuGroup(group: SiteMenuGroup) {
	return {
		label: group.label,
		...(group.icon ? { icon: group.icon } : {}),
		...(group.link ? { link: serializeLink(group.link) } : {}),
		...(group.links ? { links: group.links.map(serializeLink) } : {}),
	};
}

export function serializeSiteLayoutForPayload(
	layout: SiteLayoutDocument,
): PayloadSiteLayoutInput {
	return {
		header: {
			cta: serializeLink(layout.header.cta),
			menuGroups: layout.header.menuGroups.map(serializeMenuGroup),
			mobile: { ...layout.header.mobile },
			navLinks: layout.header.navLinks.map((link) => ({
				...serializeLink(link),
				...(link.sections
					? {
							sections: link.sections.map((section) => ({
								...serializeLink(section),
								...(section.description
									? { description: section.description }
									: {}),
								...(section.icon ? { icon: section.icon } : {}),
							})),
						}
					: {}),
			})),
			search: { ...layout.header.search },
			searchGroups: layout.header.searchGroups.map(serializeMenuGroup),
			topNavLinks: layout.header.topNavLinks.map(serializeLink),
		},
		socialLinks: layout.socialLinks.map((link) => ({ ...link })),
		footer: {
			navLinks: layout.footer.navLinks.map(serializeLink),
		},
	};
}
