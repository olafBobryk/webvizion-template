import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberMention } from "./MemberMention";
import { catalogContract } from "./MemberMention.catalog";

const presentation = getMemberPresentation({
	createdAt: "2026-01-12T08:00:00.000Z",
	id: "membership-mention",
	organizationId: "organization-story",
	role: "member",
	user: {
		email: "avery@averlo.local",
		id: "user-mention",
		name: "Avery Chen",
		profilePictureUrl: "/test/placeholder-portrait.jpg",
	},
});

const meta = {
	id: "dashboard-entity-member-mention",
	title: "Dashboard/Entities/Member/MemberMention",
	component: MemberMention,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
	},
} satisfies Meta<typeof MemberMention>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LiveAndLoading: Story = {
	args: { presentation },

	render: () => (
		<p>
			Assigned to <MemberMention presentation={presentation} /> ·{" "}
			<MemberMention.Skeleton />
		</p>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("link", { name: "@Avery Chen" }),
		).toHaveAttribute("href", presentation.href);
	},
};
