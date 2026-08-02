import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import Logo from "./Logo";
import { catalogContract } from "./Logo.catalog";

const meta = {
	id: "branding-logo",
	title: "Branding/Logo",
	component: Logo,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VariantsSizesAndTones: Story = {
	render: () => (
		<div className="grid gap-6">
			<div className="flex flex-wrap items-end gap-6">
				{(["sm", "md", "lg"] as const).map((size) => (
					<Logo aria-label={`${size} full logo`} key={size} size={size} />
				))}
			</div>
			<div className="flex flex-wrap items-end gap-6">
				{(["sm", "md", "lg"] as const).map((size) => (
					<Logo
						aria-label={`${size} logo mark`}
						key={size}
						size={size}
						variant="mark"
					/>
				))}
			</div>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText("sm full logo")).toHaveClass("h-[24px]");
		await expect(canvas.getByLabelText("lg full logo")).toHaveClass("h-[48px]");
		await expect(canvas.getByLabelText("md logo mark")).toHaveClass("w-[34px]");
	},
};

export const SurfaceTones: Story = {
	render: () => (
		<div className="grid gap-4 sm:grid-cols-2">
			<div className="flex min-h-24 items-center justify-center rounded-lg bg-background p-5">
				<Logo aria-label="Dark logo on light surface" tone="dark" />
			</div>
			<div className="flex min-h-24 items-center justify-center rounded-lg bg-foreground p-5">
				<Logo aria-label="Light logo on dark surface" tone="light" />
			</div>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByLabelText("Dark logo on light surface"),
		).toHaveClass("text-foreground");
		await expect(
			canvas.getByLabelText("Light logo on dark surface"),
		).toHaveClass("text-background");
	},
};

export const SemanticRendering: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-6">
			<Logo aria-label="Homepage brand link" href="/" />
			<Logo
				aria-label="Standalone brand mark"
				as="span"
				href=""
				interactive={false}
				variant="mark"
			/>
		</div>
	),
	play: async ({ canvas }) => {
		const link = canvas.getByRole("link", { name: "Homepage brand link" });
		await expect(link).toHaveAttribute("href", "/");
		await expect(
			canvas.getByRole("img", { name: "Standalone brand mark" }),
		).not.toHaveAttribute("tabindex");
	},
};
