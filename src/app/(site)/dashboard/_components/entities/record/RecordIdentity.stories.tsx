import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RecordIdentity } from "./RecordIdentity";
import { catalogContract } from "./RecordIdentity.catalog";

const presentation = { slugLabel: "north-star", title: "North star" };
const sizes = ["sm", "md", "lg", "xl"] as const;
const variants = ["default", "actor"] as const;

const meta = {
	id: "dashboard-entity-record-identity",
	title: "Dashboard/Entities/Record/RecordIdentity",
	component: RecordIdentity,
	subcomponents: { "RecordIdentity.Skeleton": RecordIdentity.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"Record-owned identity presentation. Default includes the slug; actor is the compact title-only form.",
			},
		},
	},
} satisfies Meta<typeof RecordIdentity>;
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
							<RecordIdentity
								avatarSize={avatarSize}
								presentation={presentation}
								variant={variant}
							/>
							<RecordIdentity.Skeleton
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
