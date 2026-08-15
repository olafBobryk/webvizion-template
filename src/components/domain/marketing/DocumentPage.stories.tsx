import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DocumentPage } from "./DocumentPage";
import { catalogContract } from "./DocumentPage.catalog";

const meta = {
	id: "domain-marketing-document-page",
	title: "Domain/Marketing/DocumentPage",
	component: DocumentPage,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof DocumentPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DocumentPattern: Story = {
	args: {
		date: "2026-08-15T12:00:00.000Z",
		title: "Motion and interaction guidelines",
		markdown: `## Overview

Motion should clarify hierarchy, causality, and change. It should never be required to understand the interface.

## Details

The document owner composes canonical page metadata with pure Markdown rendering.`,
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
		await expect(
			canvas.getByRole("heading", {
				level: 1,
				name: "Motion and interaction guidelines",
			}),
		).toBeVisible();
		const date = canvas.getByText("Updated Saturday, 15th August");
		await expect(date).toBeVisible();
		await expect(date).toHaveClass("text-xs", "font-normal");
		await expect(date).toHaveClass("text-muted-foreground");
		expect(date.className).not.toMatch(/uppercase|tracking-/);
		await expect(
			canvas.getByRole("heading", { level: 2, name: "Overview" }),
		).toBeVisible();
		await expect(
			canvasElement.querySelector('[data-slot="document-page-divider"]'),
		).toBeInTheDocument();
		await expect(
			canvasElement.querySelector('[data-slot="markdown-renderer"]'),
		).toHaveAttribute("data-variant", "result");
		await expect(canvasElement.querySelectorAll("main")).toHaveLength(1);
	},
};
