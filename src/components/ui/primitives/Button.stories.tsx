import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { catalogContract } from "./Button.catalog";

const meta = {
	id: "ui-primitives-button",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Button",
	component: Button,
	subcomponents: {
		"Button.Skeleton": Button.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: {
				component: formatCatalogOwnerContract(catalogContract),
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "ghost", "inverse"],
		},
		tone: {
			control: "select",
			options: ["default", "danger"],
		},
		size: {
			control: "select",
			options: ["none", "sm", "md", "lg", "xl", "chip", "icon", "icon-sm"],
		},
	},
	args: {
		children: "Continue",
		size: "md",
		variant: "secondary",
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ActionHierarchy: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Repeat this hierarchy decision: primary for the principal action, secondary for a standard action, and ghost for a navigation-style or low-emphasis action.",
			},
		},
	},
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button variant="primary">Publish</Button>
			<Button variant="secondary">Save draft</Button>
			<Button variant="ghost">Cancel</Button>
		</div>
	),
};

export const DestructiveMeaning: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'Danger is semantic tone, not a separate hierarchy. Pair tone="danger" with the appropriate primary, secondary, or ghost variant.',
			},
		},
	},
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button tone="danger" variant="primary">
				Delete permanently
			</Button>
			<Button tone="danger" variant="secondary">
				Remove member
			</Button>
			<Button tone="danger" variant="ghost">
				Discard
			</Button>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "Delete permanently" }),
		).toHaveClass("bg-primary");
		await expect(
			canvas.getByRole("button", { name: "Remove member" }),
		).toBeVisible();
		await expect(canvas.getByRole("button", { name: "Discard" })).toBeVisible();
	},
};

export const SizesAndIcons: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Sizes own their shell and icon spacing. Use icon sizes for icon-only controls with an accessible name.",
			},
		},
	},
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button>
			<Button size="lg" leadingIcon="plus">
				Create
			</Button>
			<Button aria-label="Continue" leadingIcon="arrow-right" size="icon" />
		</div>
	),
};

export const AsyncStateParity: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The loading state keeps live content in flow, while Button.Skeleton reserves the same component-owned dimensions during initial loading.",
			},
		},
	},
	render: () => (
		<div className="grid gap-4">
			<div className="flex items-center gap-3">
				<Button variant="primary">Save changes</Button>
				<Button loading variant="primary">
					Save changes
				</Button>
			</div>
			<div className="flex items-center gap-3">
				<Button.Skeleton variant="primary">Save changes</Button.Skeleton>
				<Button disabled variant="secondary">
					Unavailable
				</Button>
			</div>
		</div>
	),
};

export const ButtonLikeLink: Story = {
	args: {
		children: "Open dashboard",
		href: "/dashboard",
		variant: "primary",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Pass href when navigation should retain Button presentation; the primitive owns the Next.js link rendering.",
			},
		},
	},
};

export const InteractionContract: Story = {
	args: {
		children: "Save changes",
		onClick: fn(),
		variant: "primary",
	},
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", { name: "Save changes" });
		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();
		button.focus();
		await expect(button).toHaveFocus();
	},
};
