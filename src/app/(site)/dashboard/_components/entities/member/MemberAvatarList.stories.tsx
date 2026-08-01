import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberAvatarList } from "./MemberAvatarList";
import { catalogContract } from "./MemberAvatarList.catalog";

const members = ["Taylor Morgan", "Avery Chen", "Sam Rivera", "Robin Park"].map(
	(name, index) =>
		getMemberPresentation({
			createdAt: "2026-01-12T08:00:00.000Z",
			id: `membership-avatar-${index}`,
			organizationId: "organization-story",
			role: "member",
			user: {
				email: `${name.toLowerCase().replace(" ", ".")}@averlo.local`,
				id: `user-avatar-${index}`,
				name,
				profilePictureUrl: "/test/placeholder-portrait.jpg",
			},
		}),
);

const meta = {
	id: "dashboard-entity-member-avatar-list",
	title: "Dashboard/Entities/Member/MemberAvatarList",
	component: MemberAvatarList,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "todo" },
	},
} satisfies Meta<typeof MemberAvatarList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LiveAndLoading: Story = {
	args: { members },

	render: () => (
		<div className="grid gap-6">
			<MemberAvatarList members={members} />
			<MemberAvatarList.Skeleton count={3} />
		</div>
	),
};
