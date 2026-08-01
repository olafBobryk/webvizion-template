import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { memberRolePresentation } from "../../../_lib/entities/member/presentation";
import { MemberRoleChip } from "./MemberRoleChip";
import { catalogContract } from "./MemberRoleChip.catalog";

const roles = ["owner", "admin", "member"] as const;
const meta = {
	id: "dashboard-entity-member-role-chip",
	title: "Dashboard/Entities/Member/MemberRoleChip",
	component: MemberRoleChip,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "todo" },
	},
} satisfies Meta<typeof MemberRoleChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RolesAndLoading: Story = {
	args: { label: "Member", tone: "neutral" },

	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			{roles.map((role) => (
				<MemberRoleChip
					key={role}
					label={memberRolePresentation[role].shortLabel}
					tone={memberRolePresentation[role].tone}
				/>
			))}
			<MemberRoleChip.Skeleton />
		</div>
	),
};
