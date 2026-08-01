import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { recordStatusPresentation } from "../../../_lib/entities/record/presentation";
import { RecordStatusChip } from "./RecordStatusChip";
import { catalogContract } from "./RecordStatusChip.catalog";

const statuses = ["active", "archived", "draft", "review"] as const;
const meta = {
	id: "dashboard-entity-record-status-chip",
	title: "Dashboard/Entities/Record/RecordStatusChip",
	component: RecordStatusChip,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "todo" },
	},
} satisfies Meta<typeof RecordStatusChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const StatusesAndLoading: Story = {
	args: { label: "Draft", tone: "neutral" },

	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			{statuses.map((status) => (
				<RecordStatusChip
					key={status}
					label={recordStatusPresentation[status].shortLabel}
					tone={recordStatusPresentation[status].tone}
				/>
			))}
			<RecordStatusChip.Skeleton />
		</div>
	),
};
