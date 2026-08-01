import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberIdentity } from "./MemberIdentity";
import { catalogContract } from "./MemberIdentity.catalog";

const presentation = getMemberPresentation({
	createdAt: "2026-01-12T08:00:00.000Z",
	id: "membership-story-taylor",
	organizationId: "organization-story",
	role: "owner",
	user: {
		email: "taylor@averlo.local",
		id: "user-story-taylor",
		name: "Taylor Morgan",
		profilePictureUrl: "/test/placeholder-portrait.jpg",
	},
});
const sizes = ["sm", "md", "lg", "xl"] as const;
const variants = ["default", "actor"] as const;

const meta = {
	id: "dashboard-entity-member-identity",
	title: "Dashboard/Entities/Member/MemberIdentity",
	component: MemberIdentity,
	subcomponents: { "MemberIdentity.Skeleton": MemberIdentity.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "todo" },
		docs: {
			description: {
				component:
					"Default identity scales only its name with avatar size; actor remains compact and loading preserves that primary-name geometry.",
			},
		},
	},
} satisfies Meta<typeof MemberIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VariantsAndSizes: Story = {
	args: { presentation },

	render: () => (
		<div className="grid max-w-4xl gap-8">
			{variants.map((variant) => (
				<section className="grid gap-4" key={variant}>
					<h2 className="font-semibold capitalize">{variant}</h2>
					{sizes.map((avatarSize) => (
						<div className="grid gap-3 sm:grid-cols-2" key={avatarSize}>
							<MemberIdentity
								avatarSize={avatarSize}
								presentation={presentation}
								variant={variant}
							/>
							<MemberIdentity.Skeleton
								avatarSize={avatarSize}
								variant={variant}
							/>
						</div>
					))}
				</section>
			))}
		</div>
	),
};
