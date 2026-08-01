import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ProfilePictureInput } from "./ProfilePictureInput";
import { catalogContract } from "./ProfilePictureInput.catalog";

const onChange = fn();
const onValidationError = fn();
const meta = {
	id: "ui-input-profile-picture-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Files/ProfilePictureInput",
	component: ProfilePictureInput,
	subcomponents: {
		"ProfilePictureInput.Skeleton": ProfilePictureInput.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ProfilePictureInput>;
export default meta;
type Story = StoryObj;

export const FileContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<ProfilePictureInput
			acceptedMimeTypes={["image/png"]}
			currentUrl="/test/placeholder-portrait.jpg"
			layout="file-row"
			name="Averlo user"
			onChange={onChange}
			onValidationError={onValidationError}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		onValidationError.mockClear();
		const input = canvasElement.querySelector('input[type="file"]');
		if (!(input instanceof HTMLInputElement))
			throw new Error("Profile file input missing");
		await userEvent.upload(
			input,
			new File(["image"], "profile.jpg", { type: "image/jpeg" }),
		);
		await expect(onValidationError).toHaveBeenCalledWith(
			"Only JPG, PNG, and WebP images are accepted.",
		);
		await expect(canvas.getByRole("alert")).toHaveTextContent(
			"Only JPG, PNG, and WebP images are accepted.",
		);
	},
};

export const LayoutsAndSkeletons: Story = {
	render: () => (
		<div className="grid gap-6">
			<ProfilePictureInput
				currentUrl="/test/placeholder-portrait.jpg"
				name="Averlo user"
				onChange={() => {}}
			/>
			<ProfilePictureInput.Skeleton layout="file-row" />
		</div>
	),
};
