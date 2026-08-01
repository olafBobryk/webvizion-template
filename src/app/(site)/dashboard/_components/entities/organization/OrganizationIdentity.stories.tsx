import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getOrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import { OrganizationIdentity } from "./OrganizationIdentity";
import { catalogContract } from "./OrganizationIdentity.catalog";

const presentation = getOrganizationPresentation({
	id: "organization-story",
	name: "Averlo Studio",
	profilePictureUrl: "/test/placeholder-square.jpg",
	role: "owner",
	slug: "averlo-studio",
});
const sizes = ["sm", "md", "lg", "xl"] as const;
const variants = ["default", "actor"] as const;
const visuals = ["profile-picture", "icon"] as const;

const meta = {
	id: "dashboard-entity-organization-identity",
	title: "Dashboard/Entities/Organization/OrganizationIdentity",
	component: OrganizationIdentity,
	subcomponents: {
		"OrganizationIdentity.Skeleton": OrganizationIdentity.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"Default identity scales only its name with avatar size; actor remains compact. Both support profile-picture and icon visuals.",
			},
		},
	},
} satisfies Meta<typeof OrganizationIdentity>;
export default meta;
type Story = StoryObj<typeof meta>;

export const VariantsSizesAndVisuals: Story = {
	args: { presentation },

	render: () => (
		<div className="grid max-w-4xl gap-10">
			{visuals.map((visual) => (
				<section className="grid gap-6" key={visual}>
					<h2 className="font-semibold capitalize">{visual}</h2>
					{variants.map((variant) => (
						<div className="grid gap-4" key={variant}>
							<h3 className="font-medium capitalize">{variant}</h3>
							{sizes.map((avatarSize) => (
								<div className="grid gap-3 sm:grid-cols-2" key={avatarSize}>
									<OrganizationIdentity
										avatarSize={avatarSize}
										presentation={presentation}
										variant={variant}
										visual={visual}
									/>
									<OrganizationIdentity.Skeleton
										avatarSize={avatarSize}
										variant={variant}
										visual={visual}
									/>
								</div>
							))}
						</div>
					))}
				</section>
			))}
		</div>
	),
};
