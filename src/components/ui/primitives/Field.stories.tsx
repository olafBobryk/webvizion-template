import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { Field } from "./Field";
import { catalogContract } from "./Field.catalog";
import { InputFrame, inputVariants } from "./InputFrame";

const meta = {
	id: "ui-primitives-field",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Field",
	component: Field,
	subcomponents: { "Field.Skeleton": Field.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				component: formatCatalogOwnerContract(catalogContract),
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const LabelDescriptionAndErrorRelationships: Story = {
	parameters: {
		a11y: { test: "error" },
	},
	render: () => (
		<Field
			label="Project name"
			description="Use a name teammates will recognize."
			message="A project name is required."
			tone="error"
			required
			inputId="project-name"
			descriptionId="project-name-description"
			messageId="project-name-message"
		>
			<InputFrame fullWidth tone="error">
				<input
					id="project-name"
					aria-describedby="project-name-description"
					aria-errormessage="project-name-message"
					aria-invalid="true"
					className={inputVariants()}
				/>
			</InputFrame>
		</Field>
	),
	play: async ({ canvas }) => {
		const input = canvas.getByRole("textbox", { name: /project name/i });
		await expect(input).toHaveAccessibleDescription(
			"Use a name teammates will recognize.",
		);
		await expect(input).toHaveAttribute(
			"aria-errormessage",
			"project-name-message",
		);
		await expect(canvas.getByRole("alert")).toHaveTextContent(
			"A project name is required.",
		);
	},
};

export const SuccessAndLabelAction: Story = {
	parameters: {
		a11y: { test: "error" },
	},
	render: () => (
		<Field
			label="Slug"
			labelAction={
				<Button size="none" variant="ghost">
					Generate
				</Button>
			}
			message="Available"
			tone="success"
			inputId="project-slug"
			messageId="project-slug-message"
		>
			<InputFrame fullWidth tone="success">
				<input
					id="project-slug"
					className={inputVariants()}
					defaultValue="averlo"
				/>
			</InputFrame>
		</Field>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("textbox", { name: "Slug" })).toHaveValue(
			"averlo",
		);
		await expect(
			canvas.getByRole("button", { name: "Generate" }),
		).toBeVisible();
		await expect(canvas.getByText("Available")).toBeVisible();
	},
};

export const SkeletonParity: Story = {
	render: () => (
		<Field.Skeleton label="Project name" fullWidth>
			Project name
		</Field.Skeleton>
	),
};
