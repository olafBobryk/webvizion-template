import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { PhoneInput } from "./PhoneInput";
import { catalogContract } from "./PhoneInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-phone-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Text/PhoneInput",
	component: PhoneInput,
	subcomponents: { "PhoneInput.Skeleton": PhoneInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof PhoneInput>;
export default meta;
type Story = StoryObj;

export const PhoneContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<div className="w-80">
			<PhoneInput
				defaultCountry="US"
				e164Name="phoneE164"
				label="Phone"
				onChange={onChange}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const input = canvas.getByRole("combobox", { name: "Phone" });
		await expect(input).toHaveAttribute("type", "tel");
		await userEvent.type(input, "4155552671");
		await expect(onChange).toHaveBeenLastCalledWith("+14155552671");
		await expect(input).toHaveAttribute("aria-controls");
		await expect(canvas.getByDisplayValue("+14155552671")).toHaveAttribute(
			"type",
			"hidden",
		);
		await userEvent.keyboard("{Escape}");
	},
};

export const SkeletonParity: Story = {
	render: () => <PhoneInput.Skeleton label="Phone" />,
};
