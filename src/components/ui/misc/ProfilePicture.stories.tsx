import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Icon } from "@/components/ui/icons/Icon";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ProfilePicture, ProfilePictureStack } from "./ProfilePicture";
import { catalogContract } from "./ProfilePicture.catalog";

const meta = {
	id: "ui-misc-profile-picture",
	title: "UI/Misc/ProfilePicture",
	component: ProfilePicture,
	subcomponents: { ProfilePictureStack },
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ProfilePicture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const FallbackContract: Story = {
	render: () => (
		<div className="flex items-end gap-3">
			<ProfilePicture
				name="Ada Lovelace"
				size="sm"
				src="/test/placeholder-portrait.jpg"
			/>
			<ProfilePicture
				fallback="?"
				alt="Unknown profile"
				size="lg"
				tone="neutral"
			/>
			<ProfilePicture
				alt="Organization"
				fallback={<Icon name="building" size="sm" />}
				size="md"
			/>
			<ProfilePicture.Skeleton size="xl" />
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		await expect(
			canvas.getByRole("img", { name: "Ada Lovelace profile picture" }),
		).toBeVisible();
		await expect(
			canvas.getByRole("img", { name: "Unknown profile" }),
		).toHaveTextContent("?");
		await expect(
			canvas.getByRole("img", { name: "Organization" }).querySelector("svg"),
		).toBeInTheDocument();
		await expect(
			canvasElement.querySelector(
				'[data-slot="profile-picture"][aria-hidden="true"]',
			),
		).toBeInTheDocument();
	},
};
export const StackContract: Story = {
	render: () => (
		<ProfilePictureStack
			ariaLabel="Project members"
			maxVisible={2}
			items={[
				{ id: "ada", name: "Ada Lovelace" },
				{ id: "grace", name: "Grace Hopper" },
				{ id: "alan", name: "Alan Turing" },
				{ id: "katherine", name: "Katherine Johnson" },
			]}
		/>
	),
	play: async ({ canvas }) => {
		const stack = canvas.getByRole("img", { name: "Project members" });
		await expect(stack).toBeVisible();
		await expect(stack).toHaveTextContent("+2");
	},
};
