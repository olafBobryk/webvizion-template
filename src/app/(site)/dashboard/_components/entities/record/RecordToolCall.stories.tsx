import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { getRecordToolPresentation } from "../../../_lib/entities/record/presentation";
import { RecordToolCall } from "./RecordToolCall";
import { catalogContract } from "./RecordToolCall.catalog";

const completed = getRecordToolPresentation({
	input: { id: "north-star" },
	output: {
		record: {
			id: "north-star",
			slug: "north-star",
			status: "active",
			title: "North star",
			url: "/dashboard/records/north-star",
		},
	},
	state: "completed",
	toolName: "record_get",
});

const approval = getRecordToolPresentation({
	input: { id: "north-star", title: "North star" },
	state: "approval-requested",
	toolName: "record_delete",
});

const listReport = getRecordToolPresentation({
	input: { includeArchived: false },
	output: {
		items: [
			{
				descriptionMarkdown: "The current launch brief.",
				id: "north-star",
				slug: "north-star",
				status: "active",
				title: "North star",
				updatedAt: "2026-08-01T12:00:00.000Z",
				url: "/dashboard/records/north-star",
			},
		],
		total: 1,
	},
	state: "completed",
	toolName: "records_list",
});

const createApproval = getRecordToolPresentation({
	input: {
		descriptionMarkdown: "Prepared by the Assistant for review.",
		status: "draft",
		title: "Quarterly plan",
	},
	state: "approval-requested",
	toolName: "record_create",
});

const updateApproval = getRecordToolPresentation({
	input: {
		descriptionMarkdown:
			"## Updated scope\n\nPrepared by the Assistant for review.",
		id: "north-star",
		title: "North star launch plan",
	},
	state: "approval-requested",
	toolName: "record_update",
});

const unchangedUpdateApproval = getRecordToolPresentation({
	input: {
		descriptionMarkdown: "The current launch brief.",
		id: "north-star",
		title: "North star",
	},
	state: "approval-requested",
	toolName: "record_update",
});

const archiveApproval = getRecordToolPresentation({
	input: { id: "north-star" },
	state: "approval-requested",
	toolName: "record_archive",
});

const currentNorthStar = listReport.items[0];

const readyCurrentPreview = currentNorthStar
	? { item: currentNorthStar, status: "ready" as const }
	: { message: "Current Record unavailable.", status: "error" as const };

const streamingInput = getRecordToolPresentation({
	input: { id: "launch-brief", title: "Updated" },
	state: "input-streaming",
	toolName: "record_update",
});

const availableInput = getRecordToolPresentation({
	input: { query: "launch" },
	state: "input-available",
	toolName: "records_list",
});

const meta = {
	id: "dashboard-entity-record-tool-call",
	title: "Dashboard/Entities/Record/RecordToolCall",
	component: RecordToolCall,
	subcomponents: { "RecordToolCall.Skeleton": RecordToolCall.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "todo" },
		docs: {
			description: {
				component:
					"Record-owned adapter for the private Assistant tool lifecycle frame. Record is the only current entity tool family.",
			},
		},
	},
} satisfies Meta<typeof RecordToolCall>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CompletedAndLoading: Story = {
	args: { presentation: completed },

	render: () => (
		<div className="grid gap-6">
			<RecordToolCall presentation={completed} />
			<RecordToolCall.Skeleton />
		</div>
	),
	play: async ({ canvas }) => {
		const frame = canvas.getAllByText("Get record")[0]?.closest("section");
		if (!frame) throw new Error("Tool frame is missing.");
		await expect(frame).toHaveAttribute("data-surface-role", "card");
		await expect(frame).toHaveAttribute("data-elevation", "card");
		await expect(frame).toHaveClass("shadow-sm");
	},
};

export const ListReport: Story = {
	args: { presentation: listReport },
};

export const ProgressiveInputStates: Story = {
	args: { presentation: streamingInput },
	render: () => (
		<div className="grid gap-6">
			<RecordToolCall presentation={streamingInput} />
			<RecordToolCall presentation={availableInput} />
		</div>
	),
};

export const ProposedCreateApproval: Story = {
	args: { onApprove: fn(), onDeny: fn(), presentation: createApproval },
	render: (args) => <RecordToolCall {...args} />,
	play: async ({ args, canvas }) => {
		const frame = canvas.getByText("Create record").closest("section");
		if (!frame) throw new Error("Create tool frame is missing.");
		await expect(frame).toHaveAttribute("data-surface-role", "card");
		await expect(
			frame.querySelectorAll('[data-surface-role="card"]'),
		).toHaveLength(0);
		await expect(canvas.queryByText("Current")).toBeNull();
		await expect(canvas.getAllByText("Quarterly plan")[0]).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
		await expect(args.onApprove).toHaveBeenCalledOnce();
	},
};

export const UpdateApprovalProposal: Story = {
	args: {
		onApprove: fn(),
		onDeny: fn(),
		presentation: updateApproval,
		proposalPreview: readyCurrentPreview,
	},
	play: async ({ args, canvas }) => {
		const proposal = canvas
			.getByText("North star launch plan")
			.closest('[data-record-tool-proposal="true"]');
		if (!proposal) throw new Error("Record proposal is missing.");
		await expect(
			proposal.querySelectorAll('[data-surface-role="card"]'),
		).toHaveLength(0);
		await expect(
			proposal.querySelectorAll('[aria-label="Record"]'),
		).toHaveLength(1);
		await expect(
			proposal.querySelector('[data-proposal-field="status"]'),
		).toBeNull();
		await expect(canvas.getAllByText("Current").length).toBeGreaterThan(0);
		await expect(canvas.getAllByText("Proposed").length).toBeGreaterThan(0);
		await expect(canvas.getByText("North star launch plan")).toBeVisible();
		await expect(
			canvas.queryByRole("heading", { name: "Updated scope" }),
		).toBeNull();
		await expect(canvas.getByText("Updated scope").tagName).toBe("STRONG");
		await userEvent.click(canvas.getByRole("button", { name: "Decline" }));
		await expect(args.onDeny).toHaveBeenCalledOnce();
	},
};

export const UnchangedUpdateApproval: Story = {
	args: {
		onApprove: fn(),
		onDeny: fn(),
		presentation: unchangedUpdateApproval,
		proposalPreview: readyCurrentPreview,
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("No changes proposed.")).toBeVisible();
		await expect(
			canvas.queryByText("Current", { selector: "span" }),
		).toBeNull();
	},
};

export const ArchiveApproval: Story = {
	args: {
		onApprove: fn(),
		onDeny: fn(),
		presentation: archiveApproval,
		proposalPreview: readyCurrentPreview,
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Status")).toBeVisible();
		await expect(canvas.getByText("Active")).toBeVisible();
		await expect(canvas.getByText("Archived")).toBeVisible();
	},
};

export const ProposalLoading: Story = {
	args: {
		onApprove: fn(),
		onDeny: fn(),
		presentation: updateApproval,
		proposalPreview: { status: "loading" },
	},
	play: async ({ canvas }) => {
		const frame = canvas.getByText("Update record").closest("section");
		if (!frame) throw new Error("Update tool frame is missing.");
		await expect(
			frame.querySelector('[data-record-tool-proposal-skeleton="true"]'),
		).not.toBeNull();
		await expect(frame).toHaveAttribute("data-surface-role", "card");
		await expect(
			frame.querySelectorAll('[data-surface-role="card"]'),
		).toHaveLength(0);
	},
};

export const ProposalFailure: Story = {
	args: {
		onApprove: fn(),
		onDeny: fn(),
		onRetryProposal: fn(),
		presentation: updateApproval,
		proposalPreview: {
			message: "The current Record could not be loaded.",
			status: "error",
		},
	},
	play: async ({ args, canvas }) => {
		await expect(
			canvas.getByText("Could not load the current Record"),
		).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
		await expect(args.onRetryProposal).toHaveBeenCalledOnce();
	},
};

export const DestructiveApproval: Story = {
	args: {
		onApprove: fn(),
		onDeny: fn(),
		presentation: approval,
		proposalPreview: readyCurrentPreview,
	},
	render: (args) => <RecordToolCall {...args} />,
	play: async ({ args, canvas }) => {
		await expect(
			canvas.getByText("This Record will be permanently deleted."),
		).toBeVisible();
		await expect(
			canvas.queryByText("Proposed", { selector: "span" }),
		).toBeNull();
		await userEvent.click(
			canvas.getByRole("button", { name: "Delete permanently" }),
		);
		await expect(args.onApprove).toHaveBeenCalledOnce();
	},
};
