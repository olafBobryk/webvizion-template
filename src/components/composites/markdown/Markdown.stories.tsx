import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { catalogContract } from "./Markdown.catalog";
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

const meta = {
	id: "composites-markdown",
	title: "Composites/Markdown",
	component: MarkdownRenderer,
	subcomponents: {
		"Markdown.Render.Skeleton": MarkdownRenderer.Skeleton,
		"Markdown.Editor": MarkdownEditor,
		"Markdown.Editor.Skeleton": MarkdownEditor.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof MarkdownRenderer>;

export default meta;
type Story = StoryObj;

export const RendererBreadth: Story = {
	render: () => <MarkdownRenderer markdown={teachingMarkdown} />,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("heading", { level: 1, name: "Release notes" }),
		).toBeVisible();
		const tasks = canvas.getAllByRole("checkbox");
		await expect(tasks).toHaveLength(2);
		await expect(tasks[0]).toBeChecked();
		await expect(tasks[1]).not.toBeChecked();
		await expect(canvas.getByRole("table")).toBeVisible();
		await expect(
			canvas.getByText("Allowlisted underline").closest("u"),
		).not.toBeNull();
		await expect(
			canvas.getByRole("link", { name: "Read the guide" }),
		).toHaveAttribute("href", "/docs");
	},
};

export const DensityAndVariants: Story = {
	render: () => (
		<div className="grid gap-5 lg:grid-cols-2">
			<div data-testid="markdown-owner-renderer">
				<MarkdownRenderer markdown="## Document density\n\nUse this treatment for authored pages and documents." />
			</div>
			<section
				aria-labelledby="markdown-result-label"
				className="grid content-start gap-2"
			>
				<h2 className="font-medium text-sm" id="markdown-result-label">
					Generated result
				</h2>
				<div data-testid="markdown-owner-renderer">
					<MarkdownRenderer
						density="compact"
						markdown="Compact, shell-free output belongs beneath a caller-owned label."
						variant="result"
					/>
				</div>
			</section>
		</div>
	),
	play: async ({ canvas }) => {
		const renderers = canvas
			.getAllByTestId("markdown-owner-renderer")
			.map((owner) => owner.querySelector('[data-slot="markdown-renderer"]'));
		await expect(renderers[0]).toHaveAttribute("data-variant", "contained");
		await expect(renderers[1]).toHaveAttribute("data-variant", "result");
	},
};

export const EditorAndSkeleton: Story = {
	render: () => (
		<div className="grid gap-5">
			<div data-testid="markdown-owner-editor">
				<MarkdownEditor
					ariaLabel="Article body"
					defaultMarkdown="## Editable content\n\nUse the shared authoring surface."
					error="Resolve the highlighted Markdown before saving."
				/>
			</div>
			<MarkdownEditor.Skeleton />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("Resolve the highlighted Markdown before saving."),
		).toBeVisible();
		const editor = await canvas.findByRole(
			"textbox",
			{ name: "Article body" },
			{ timeout: 5_000 },
		);
		await expect(editor).toHaveAttribute("aria-invalid", "true");
		await expect(canvas.getByTestId("markdown-owner-editor")).toBeVisible();
	},
};
