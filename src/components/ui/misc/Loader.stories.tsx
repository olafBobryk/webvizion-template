import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Loader } from "./Loader";
import { catalogContract } from "./Loader.catalog";

const meta = {
	id: "ui-misc-loader",
	title: "UI/Misc/Loader",
	component: Loader,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Loader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StatusComposition: Story = {
	render: () => (
		<div role="status" className="flex items-center gap-2">
			<Loader data-testid="loader" size="md" />
			<span>Refreshing results</span>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("status")).toHaveTextContent(
			"Refreshing results",
		);
		await expect(canvas.getByTestId("loader")).toBeInTheDocument();
	},
};
