import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Accordion } from "./Accordion";
import { catalogContract } from "./Accordion.catalog";

const meta = {
	id: "ui-misc-accordion",
	title: "UI/Misc/Accordion",
	component: Accordion,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DisclosureContract: Story = {
	args: {
		title: "Billing details",
		description: "Invoice and tax information",
		onOpenChange: fn(),
		children: <p>Billing content</p>,
		forceReducedMotion: true,
	},
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", { name: /billing details/i });
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await expect(canvas.getByText("Billing content")).toBeVisible();
		await expect(args.onOpenChange).toHaveBeenCalledWith(true);
	},
};

export const CardAndSkeleton: Story = {
	args: { title: "Project access" },
	render: () => (
		<div className="grid w-[min(36rem,90vw)] gap-5">
			<Accordion.Card defaultOpen forceReducedMotion>
				<Accordion.Header>
					<Accordion.Title>Project access</Accordion.Title>
					<Accordion.Description>
						Who can open this project
					</Accordion.Description>
				</Accordion.Header>
				<Accordion.Content>Members inherit workspace access.</Accordion.Content>
				<Accordion.Footer>Access is audited.</Accordion.Footer>
			</Accordion.Card>
			<Accordion.Card.Skeleton
				open
				title="Project access"
				description="Who can open this project"
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: /project access/i }),
		).toHaveAttribute("aria-expanded", "true");
		await expect(
			canvas.getByText("Members inherit workspace access."),
		).toBeVisible();
	},
};

export const CompactRowFamily: Story = {
	args: { title: "Compact disclosure" },
	render: () => (
		<div className="grid w-[min(36rem,90vw)] gap-2">
			<Accordion
				description="Closed without a leading icon."
				title="Compact disclosure"
			>
				This borderless row is closed by default.
			</Accordion>
			<Accordion
				defaultOpen
				description="Open with a leading icon."
				title="Open disclosure"
			>
				Open content keeps the same horizontal edge as its trigger.
			</Accordion>
			<Accordion disabled title="Disabled disclosure">
				Disabled content.
			</Accordion>
			<Accordion.Skeleton
				description="Closed without a leading icon."
				title="Compact disclosure"
			/>
			<Accordion.Skeleton
				description="Open with a leading icon."
				leadingIcon
				open
				title="Open disclosure"
			/>
			<Accordion.Skeleton
				title="Skeleton without a trailing icon"
				trailingIcon={false}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		const disabled = canvas.getByRole("button", {
			name: /disabled disclosure/i,
		});
		await expect(disabled).toBeDisabled();
		await expect(
			canvas.getByRole("button", { name: /open disclosure/i }),
		).toHaveAttribute("aria-expanded", "true");
		await expect(
			canvas
				.getByText("Skeleton without a trailing icon")
				.closest('[aria-hidden="true"]'),
		).toHaveAttribute("aria-hidden", "true");
	},
};
