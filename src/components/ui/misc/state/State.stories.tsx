import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ErrorState } from "./ErrorState";
import { IdleState } from "./IdleState";
import { StateIndicator } from "./State";
import { catalogContract } from "./State.catalog";

const meta = {
	id: "ui-misc-state",
	title: "UI/Misc/State",
	component: StateIndicator,
	subcomponents: { ErrorState, IdleState },
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof StateIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const VariantContract: Story = {
	render: () => (
		<div className="grid w-[36rem] max-w-full gap-8">
			<StateIndicator
				title="Route unavailable"
				description="A prerequisite is missing."
				iconName="warning"
			/>
			<IdleState
				variant="framed"
				layout="stacked"
				align="center"
				title="No projects yet"
				description="Create a project to begin."
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("Route unavailable").closest('[data-variant="plain"]'),
		).toBeInTheDocument();
		await expect(
			canvas.getByText("No projects yet").closest('[data-variant="framed"]'),
		).toBeInTheDocument();
	},
};
export const ActionContract: Story = {
	render: () => {
		const onAction = fn();
		return (
			<ErrorState
				title="Could not load members"
				description="Try the request again."
				onAction={onAction}
				actionLabel="Retry members"
			/>
		);
	},
	play: async ({ canvas }) => {
		const action = canvas.getByRole("button", { name: "Retry members" });
		action.focus();
		await expect(action).toHaveFocus();
		await userEvent.click(action);
	},
};
