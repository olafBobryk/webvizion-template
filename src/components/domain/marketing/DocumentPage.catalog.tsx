"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DocumentPage } from "./DocumentPage";

const documentPageProps = {
	date: "2026-08-15T12:00:00.000Z",
	title: "Motion and interaction guidelines",
	markdown: `## Overview

Motion should clarify hierarchy, causality, and change. It should never be required to understand the interface.

## Details

The document owner composes canonical page metadata with pure Markdown rendering.`,
};

function CatalogPreview() {
	return <DocumentPage {...documentPageProps} />;
}

export const catalogContract = defineCatalogOwnerContract({
	id: "domain-marketing-document-page",
	name: "DocumentPage",
	role: "Product-neutral marketing document page composition for canonical title, update date, divider, and Markdown body.",
	importStatement:
		'import { DocumentPage } from "@/components/domain/marketing";',
	chooseWhen: [
		"A marketing route presents one dated document whose authored body is Markdown.",
	],
	chooseInstead: [
		"Use Markdown.Render when a caller already owns the surrounding page title, metadata, and layout.",
		"Use registered marketing sections for section-based landing pages such as the home page.",
	],
	compounds: [],
	exclusions: [
		"Content loading, Payload records, route metadata, or slug resolution.",
		"Page-local typography variants or eyebrow styling overrides.",
	],
	guarantees: [
		{
			label: "Dated document composition",
			storyId: "domain-marketing-document-page--document-pattern",
		},
	],
	family: "Domain",
	group: "Marketing",
	previewTargets: [
		{
			id: "document-pattern",
			name: "Dated document composition",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview,
		},
	],
});
