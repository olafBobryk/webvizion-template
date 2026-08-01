import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getAccountPresentation } from "../../../_lib/entities/account/presentation";
import { AccountIdentity } from "./AccountIdentity";
import { catalogContract } from "./AccountIdentity.catalog";

const presentation = getAccountPresentation({
	membership: {
		createdAt: "2026-01-12T08:00:00.000Z",
		id: "membership-story-account",
		organizationId: "organization-story",
		role: "owner",
		status: "active",
		userId: "user-story-account",
	},
	organization: {
		id: "organization-story",
		mode: "multi",
		name: "Averlo Studio",
		slug: "averlo-studio",
	},
	user: {
		email: "taylor@averlo.local",
		id: "user-story-account",
		name: "Taylor Morgan",
		profilePictureUrl: "/test/placeholder-portrait.jpg",
	},
});

const sizes = ["sm", "md", "lg", "xl"] as const;
const variants = ["default", "actor"] as const;

const meta = {
	id: "dashboard-entity-account-identity",
	title: "Dashboard/Entities/Account/AccountIdentity",
	component: AccountIdentity,
	subcomponents: { "AccountIdentity.Skeleton": AccountIdentity.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"Account-owned identity presentation. Default includes email; actor is the compact name-only form.",
			},
		},
	},
} satisfies Meta<typeof AccountIdentity>;

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
							<AccountIdentity
								avatarSize={avatarSize}
								presentation={presentation}
								variant={variant}
							/>
							<AccountIdentity.Skeleton
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
