"use client";

import { useState } from "react";
import * as Markdown from "@/components/composites/markdown";
import { Chip } from "@/components/ui/misc";
import { Text } from "@/components/ui/primitives/Text";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

const MARKDOWN_RENDERER_DEMO_MARKDOWN = [
	"# Markdown Renderer",
	"",
	"This renderer maps plain markdown onto the template design system and supports [internal links](/internal/demo), [external links](https://example.com), **strong copy**, _emphasis_, ~~deleted text~~, <u>underlined text</u>, and `inlineCode`.",
	"",
	"::button[Open Reference]{href=/internal/reference variant=primary size=md}",
	"",
	"::button[Small Ghost Action]{href=/internal/demo variant=ghost size=sm}",
	"",
	"## Lists",
	"",
	"- Unordered item",
	"- Another item with **bold copy**",
	"- [x] Completed task",
	"- [ ] Incomplete task",
	"",
	"1. Ordered item",
	"2. Another ordered item",
	"",
	"## Quote",
	"",
	"> Markdown should stay compact while still rendering through the design system.",
	"",
	"## Code",
	"",
	"```tsx",
	"type MarkdownButton = {",
	"  label: string;",
	"  href: string;",
	'  variant?: "primary" | "secondary" | "ghost" | "inverse";',
	'  tone?: "default" | "danger";',
	'  size?: "sm" | "md" | "lg" | "xl";',
	"};",
	"```",
	"",
	"## Image",
	"",
	"![Soft abstract blob](/test/blob.png)",
	"",
	"## Table",
	"",
	"| Element | Covered |",
	"| --- | ---: |",
	"| Headings | yes |",
	"| Tables | yes |",
	"| Button directive | yes |",
	"",
	"Raw HTML remains escaped text: &lt;unsafe-component&gt;blocked&lt;/unsafe-component&gt;",
].join("\n");

const MARKDOWN_EDITOR_DEMO_MARKDOWN = [
	"## Project note",
	"",
	"Draft **rich content**, _emphasis_, ~~revisions~~, and `inline code` through the application toolbar.",
	"",
	"> The rich canvas and rendered output share the same stored Markdown string.",
	"",
	"- Ordinary bullet",
	"- Another ordinary bullet",
	"",
	"Checklist:",
	"",
	"- [x] Confirm the source-owned toolbar",
	"- [ ] Review the current-system adaptations",
	"",
	"```ts",
	"const density = 'shared';",
	"```",
	"",
	"| Surface | State |",
	"| --- | --- |",
	"| Editor | Populated |",
	"| Renderer | Synchronized |",
	"",
	"::button[Open Reference]{href=/internal/reference variant=primary tone=default size=md}",
].join("\n");

const MARKDOWN_EDITOR_INVALID_MARKDOWN = [
	"## Source fallback",
	"",
	"<unclosed-component",
].join("\n");

export const compositesMarkdownDemoPage: DemoPage = {
	id: "composites-markdown",
	slug: ["composites", "markdown"],
	title: "Composites: Markdown",
	description: "Design-system markdown rendering with a button directive",
	groups: [
		{
			id: "markdown-renderer",
			title: "Markdown Renderer",
			description:
				"Default document and compact dashboard densities share the same authored-content contract in rendered and editable modes.",
			columns: "grid-cols-1",
			items: [
				{
					id: "markdown-renderer-live",
					kind: "component",
					name: "Markdown.Render",
					label: "Broad markdown coverage",
					related: relatedMap["Markdown.Render"],
					Render() {
						return (
							<div className="max-w-3xl">
								<Markdown.Render markdown={MARKDOWN_RENDERER_DEMO_MARKDOWN} />
							</div>
						);
					},
				},
				{
					id: "markdown-editor-live",
					kind: "component",
					name: "Markdown.Editor",
					label: "Full authoring and synchronized output",
					Render() {
						const [markdown, setMarkdown] = useState(
							MARKDOWN_EDITOR_DEMO_MARKDOWN,
						);
						return (
							<div className="grid max-w-3xl gap-4">
								<Markdown.Editor
									ariaLabel="Project note"
									defaultMarkdown={markdown}
									density="default"
									mentions={[
										{
											id: "4b533f14-6dd0-4dbf-9f73-212be08f5211",
											label: "Ada Lovelace",
										},
									]}
									onChange={setMarkdown}
								/>
								<div className="grid gap-2">
									<Text as="h4" tone="muted" variant="caption">
										Rendered output
									</Text>
									<Markdown.Render
										density="default"
										markdown={markdown}
										resolveUserMention={() => (
											<Chip color="info">@Ada Lovelace</Chip>
										)}
										variant="result"
									/>
								</div>
							</div>
						);
					},
				},
				{
					id: "markdown-editor-responsive",
					kind: "component",
					name: "Markdown.Editor",
					label: "Compact dashboard authoring and synchronized output",
					Render() {
						const [markdown, setMarkdown] = useState(
							MARKDOWN_EDITOR_DEMO_MARKDOWN,
						);
						return (
							<div className="grid max-w-3xl gap-4">
								<Markdown.Editor
									ariaLabel="Compact project note"
									defaultMarkdown={markdown}
									density="compact"
									mentions={[
										{
											id: "4b533f14-6dd0-4dbf-9f73-212be08f5211",
											label: "Ada Lovelace",
										},
									]}
									onChange={setMarkdown}
								/>
								<div className="grid gap-2">
									<Text as="h4" tone="muted" variant="caption">
										Rendered output
									</Text>
									<Markdown.Render
										density="compact"
										markdown={markdown}
										variant="result"
									/>
								</div>
							</div>
						);
					},
				},
				{
					id: "markdown-editor-invalid-source",
					kind: "component",
					name: "Markdown.Editor",
					label: "Invalid Markdown source mode",
					Render() {
						return (
							<div className="max-w-3xl">
								<Markdown.Editor
									ariaLabel="Invalid Markdown source mode"
									defaultMarkdown={MARKDOWN_EDITOR_INVALID_MARKDOWN}
								/>
							</div>
						);
					},
				},
				{
					id: "markdown-editor-field-error",
					kind: "component",
					name: "Markdown.Editor",
					label: "Field-owned server validation",
					related: relatedMap["Markdown.Editor"],
					Render() {
						return (
							<div className="max-w-3xl">
								<Markdown.Editor
									ariaLabel="Markdown editor with a field error"
									defaultMarkdown={
										"## Project note\n\nKeep the correction attached to its editor."
									}
									density="compact"
									error="The project note could not be saved in this form."
								/>
							</div>
						);
					},
				},
				{
					id: "markdown-editor-disabled",
					kind: "component",
					name: "Markdown.Editor",
					label: "Disabled state",
					Render() {
						return (
							<div className="max-w-3xl">
								<Markdown.Editor
									ariaLabel="Disabled Markdown editor"
									defaultMarkdown={
										"## Read only\n\nDisabled editors retain their document geometry.\n\n- [x] Completed read-only task"
									}
									density="compact"
									disabled
								/>
							</div>
						);
					},
				},
			],
		},
	],
};
