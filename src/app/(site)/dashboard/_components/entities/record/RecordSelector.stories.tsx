import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { getRecordPresentation } from "../../../_lib/entities/record/presentation";
import { RecordSelector } from "./RecordSelector";
import { catalogContract } from "./RecordSelector.catalog";

const records = [
	["North star", "north-star", "active"],
	["Launch brief", "launch-brief", "review"],
	["Working notes", "working-notes", "draft"],
].map(([title, slug, status], index) =>
	getRecordPresentation({
		archivedAt: null,
		createdAt: "2026-01-12T08:00:00.000Z",
		descriptionMarkdown: "",
		id: `record-story-${index}`,
		organizationId: "organization-story",
		ownerMemberId: null,
		properties: [],
		slug,
		status: status as "active" | "draft" | "review",
		title,
		updatedAt: "2026-08-01T08:00:00.000Z",
	}),
);

function ControlledRecordSelector() {
	const [value, setValue] = useState<string | null>(records[0].id);
	return (
		<div className="w-80">
			<RecordSelector onChange={setValue} records={records} value={value} />
		</div>
	);
}

const meta = {
	id: "dashboard-entity-record-selector",
	title: "Dashboard/Entities/Record/RecordSelector",
	component: RecordSelector,
	subcomponents: { "RecordSelector.Skeleton": RecordSelector.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "todo" },
	},
} satisfies Meta<typeof RecordSelector>;
export default meta;
type Story = StoryObj;

export const Selection: Story = {
	render: () => <ControlledRecordSelector />,
	play: async ({ canvas, canvasElement }) => {
		const input = canvas.getByRole("combobox", { name: "Record" });
		await expect(input).toHaveValue("North star");
		await userEvent.click(input);
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(
			await body.findByRole("option", { name: /Launch brief/ }),
		);
		await expect(input).toHaveValue("Launch brief");
	},
};

export const Loading: Story = {
	render: () => (
		<div className="w-80">
			<RecordSelector.Skeleton />
		</div>
	),
};
