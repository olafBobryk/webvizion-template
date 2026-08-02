"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownRenderer } from "./MarkdownRenderer";

const teachingMarkdown = `# Release notes

Markdown output uses shared typography, links, controls, and task indicators.

- [x] Preserve semantic headings
- [ ] Verify the next release

| Surface | Owner |
| --- | --- |
| Actions | Button |
| Tasks | ChoiceIndicatorMulti |

<u>Allowlisted underline</u>

::button[Read the guide]{href=/docs variant=primary tone=default size=md}`;

function CatalogPreview1() {
	return <MarkdownRenderer markdown={teachingMarkdown} />;
}

function CatalogPreview2() {
	return (
		<div className="grid gap-5 lg:grid-cols-2">
			<MarkdownRenderer markdown="## Document density\n\nUse this treatment for authored pages and documents." />
			<section
				aria-labelledby="markdown-result-label"
				className="grid content-start gap-2"
			>
				<h2 className="font-medium text-sm" id="markdown-result-label">
					Generated result
				</h2>
				<MarkdownRenderer
					density="compact"
					markdown="Compact, shell-free output belongs beneath a caller-owned label."
					variant="result"
				/>
			</section>
		</div>
	);
}

function CatalogPreview3() {
	return (
		<div className="grid gap-5">
			<MarkdownEditor
				ariaLabel="Article body"
				defaultMarkdown="## Editable content\n\nUse the shared authoring surface."
				error="Resolve the highlighted Markdown before saving."
			/>
			<MarkdownEditor.Skeleton />
		</div>
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "composites-markdown",
	name: "Markdown",
	role: "Shared rendering, authoring, loading, and modal-form family for plain Markdown content.",
	importStatement:
		'import * as Markdown from "@/components/composites/markdown";',
	chooseWhen: [
		"A page, card, modal, assistant response, or internal fixture renders plain Markdown through shared application primitives.",
		"Full-start applications need controlled rich/source Markdown authoring with inline validation.",
		"A Markdown editor belongs inside the shared modal submission flow.",
	],
	chooseInstead: [
		"Use Text directly for fixed application copy that is not authored Markdown.",
		"Keep CMS records, route titles, metadata, page chrome, persistence, and product-specific directives in their owning adapters or routes.",
	],
	compounds: [
		"Markdown.Render",
		"Markdown.Render.Skeleton",
		"Markdown.Editor",
		"Markdown.Editor.Skeleton",
		"Markdown.EditorModalForm",
	],
	exclusions: [
		"Arbitrary JSX, HTML passthrough, data registries, or product-specific card directives.",
		"A sibling status banner for the same Markdown.Editor error.",
		"Package-owned visible toolbar, menu, or modal UI.",
		"Fetching mention data inside the renderer or editor.",
	],
	guarantees: [
		{
			label:
				"Renderer teaching breadth, semantic output, and allowlisted underline",
			storyId: "composites-markdown--renderer-breadth",
		},
		{
			label: "Density and semantic surface variants",
			storyId: "composites-markdown--density-and-variants",
		},
		{
			label: "Editor validation and skeleton ownership",
			storyId: "composites-markdown--editor-and-skeleton",
		},
	],
	family: "Composites",
	group: "Markdown",
	previewTargets: [
		{
			id: "renderer-breadth",
			name: "Renderer teaching breadth",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview1,
		},
		{
			id: "density-and-variants",
			name: "Density and semantic surface variants",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview2,
		},
		{
			id: "editor-and-skeleton",
			name: "Editor validation and skeleton ownership",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview3,
		},
	],
});
