import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { FileInput, type FileInputItem } from "./FileInput";
import { catalogContract } from "./FileInput.catalog";

const onFilesRejected = fn();
function FileInputExample() {
	const [items, setItems] = useState<FileInputItem[]>([]);
	return (
		<div className="w-[560px] max-w-full">
			<FileInput
				accept="image/*"
				items={items}
				label="Assets"
				onFilesRejected={onFilesRejected}
				onItemsChange={setItems}
			/>
		</div>
	);
}
const meta = {
	id: "ui-input-file-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Files/FileInput",
	component: FileInput,
	subcomponents: { "FileInput.Skeleton": FileInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof FileInput>;
export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => <FileInputExample />,
	play: async ({ canvas, canvasElement }) => {
		onFilesRejected.mockClear();
		const input = canvasElement.querySelector('input[type="file"]');
		if (!(input instanceof HTMLInputElement))
			throw new Error("File input missing");
		await userEvent.upload(
			input,
			new File(["image"], "cover.png", { type: "image/png" }),
		);
		await expect(
			canvas.getByRole("button", { name: "Remove cover.png" }),
		).toBeInTheDocument();
		await userEvent.upload(
			input,
			new File(["text"], "notes.txt", { type: "text/plain" }),
			{ applyAccept: false },
		);
		await expect(onFilesRejected).toHaveBeenCalledOnce();
		await expect(canvas.getByRole("alert")).toHaveTextContent(
			"notes.txt is not an accepted file type.",
		);
	},
};

export const ReadOnlyAndSkeleton: Story = {
	render: () => (
		<div className="grid gap-5">
			<FileInput
				items={[]}
				label="Files"
				mode="read"
				onItemsChange={() => {}}
			/>
			<FileInput.Skeleton label="Files" />
		</div>
	),
};

export const ExternalAddControlPresentation: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<div className="w-[560px] max-w-full">
			<FileInput
				items={[
					{
						key: "portrait",
						name: "portrait.jpg",
						status: "uploaded",
						type: "image/jpeg",
						url: "/test/placeholder-portrait.jpg",
					},
					{
						key: "shapes",
						name: "shapes.jpg",
						status: "uploaded",
						type: "image/jpeg",
						url: "/test/placeholder-square.jpg",
					},
				]}
				label={null}
				onItemsChange={() => {}}
				showAddControl={false}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.queryByText("Files")).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole("button", { name: "Add file" }),
		).not.toBeInTheDocument();
		await expect(
			canvas.getByRole("button", { name: "Remove portrait.jpg" }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole("img", { name: "file-1" }).getAttribute("src"),
		).toContain("/test/placeholder-square.jpg");
	},
};

function solidPreview(color: "black" | "white") {
	return `data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="${color}"/></svg>`,
	)}`;
}

export const AdaptivePreviewActions: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<div className="w-[560px] max-w-full">
			<FileInput
				items={[
					{
						key: "bright-image",
						name: "bright.png",
						status: "uploaded",
						type: "image/svg+xml",
						unoptimized: true,
						url: solidPreview("white"),
					},
					{
						key: "dark-image",
						name: "dark.png",
						status: "uploaded",
						type: "image/svg+xml",
						unoptimized: true,
						url: solidPreview("black"),
					},
				]}
				label={null}
				onItemsChange={() => {}}
				showAddControl={false}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: "Remove bright.png" }),
			).toHaveAttribute("data-preview-shade", "light"),
		);
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: "Remove dark.png" }),
			).toHaveAttribute("data-preview-shade", "dark"),
		);
	},
};
