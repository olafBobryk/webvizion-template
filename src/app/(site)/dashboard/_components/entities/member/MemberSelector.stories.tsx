import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberSelector } from "./MemberSelector";
import { catalogContract } from "./MemberSelector.catalog";

const members = [
	["Taylor Morgan", "taylor@averlo.local", "owner"],
	["Avery Chen", "avery@averlo.local", "admin"],
	["Sam Rivera", "sam@averlo.local", "member"],
].map(([name, email, role], index) =>
	getMemberPresentation({
		createdAt: "2026-01-12T08:00:00.000Z",
		id: `membership-story-${index}`,
		organizationId: "organization-story",
		role: role as "admin" | "member" | "owner",
		user: {
			email,
			id: `user-story-${index}`,
			name,
			profilePictureUrl: "/test/placeholder-portrait.jpg",
		},
	}),
);

function ControlledMemberSelector() {
	const [value, setValue] = useState<string | null>(members[0].id);
	return (
		<div className="w-80">
			<MemberSelector members={members} onChange={setValue} value={value} />
		</div>
	);
}

const meta = {
	id: "dashboard-entity-member-selector",
	title: "Dashboard/Entities/Member/MemberSelector",
	component: MemberSelector,
	subcomponents: { "MemberSelector.Skeleton": MemberSelector.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "todo" },
	},
} satisfies Meta<typeof MemberSelector>;

export default meta;
type Story = StoryObj;

export const Selection: Story = {
	render: () => <ControlledMemberSelector />,
	play: async ({ canvas, canvasElement }) => {
		const input = canvas.getByRole("combobox", { name: "Owner" });
		await expect(input).toHaveValue("Taylor Morgan");
		await userEvent.click(input);
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(
			await body.findByRole("option", { name: /Avery Chen/ }),
		);
		await expect(input).toHaveValue("Avery Chen");
	},
};

export const Loading: Story = {
	render: () => (
		<div className="w-80">
			<MemberSelector.Skeleton />
		</div>
	),
};
