import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Skeleton } from "./Skeleton";
import { SuspenseBoundary } from "./SuspenseBoundary";
import { catalogContract } from "./SuspenseBoundary.catalog";

const meta = {
	id: "ui-misc-suspense-boundary",
	title: "UI/Misc/SuspenseBoundary",
	component: SuspenseBoundary,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof SuspenseBoundary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ControlledStates: Story = {
	args: { children: <p>Account ready</p> },
	render: () => (
		<div className="grid gap-5">
			<SuspenseBoundary
				loading
				fallback={<p>Loading account</p>}
				forceReducedMotion
			>
				<p>Account ready</p>
			</SuspenseBoundary>
			<SuspenseBoundary
				error
				errorFallback={{
					title: "Account unavailable",
					description: "Try again later.",
				}}
				forceReducedMotion
			>
				<p>Hidden account</p>
			</SuspenseBoundary>
			<SuspenseBoundary forceReducedMotion>
				<p>Resolved account</p>
			</SuspenseBoundary>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Loading account")).toBeVisible();
		await expect(canvas.getByText("Account unavailable")).toBeVisible();
		await expect(canvas.getByText("Resolved account")).toBeVisible();
		await expect(canvas.queryByText("Hidden account")).not.toBeInTheDocument();
	},
};
export const GhostParity: Story = {
	args: { children: <p>Owner details</p> },
	render: () => (
		<SuspenseBoundary
			ghost
			loading
			forceReducedMotion
			fallback={
				<div className="grid gap-2">
					<Skeleton className="h-5 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
			}
		>
			<div className="grid gap-2">
				<h3>Account owner</h3>
				<p>Owner details</p>
			</div>
		</SuspenseBoundary>
	),
	play: async ({ canvas }) => {
		const hidden = canvas
			.getByText("Account owner")
			.closest('[aria-hidden="true"]');
		await expect(hidden).toHaveAttribute("aria-hidden", "true");
		await expect(
			canvas.getAllByRole("generic", { hidden: true }).length,
		).toBeGreaterThan(0);
	},
};
