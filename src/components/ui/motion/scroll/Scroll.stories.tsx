import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import * as Scroll from "./index";
import { catalogContract } from "./Scroll.catalog";

function ScrollNarrative() {
	const [run, setRun] = useState(0);
	return (
		<div className="bg-background px-6 py-12 sm:px-12" key={run}>
			<button
				className="mb-16 rounded-button-sm border border-foreground/15 px-3 py-2 text-sm"
				onClick={() => setRun((current) => current + 1)}
				type="button"
			>
				Replay scroll story
			</button>
			<div className="mx-auto grid max-w-3xl gap-36">
				<p className="max-w-2xl text-3xl font-medium leading-tight sm:text-5xl">
					<Scroll.Highlight variant="viewport">
						Scroll gives narrative emphasis to copy without removing it from the
						document.
					</Scroll.Highlight>
				</p>
				<Scroll.Lag className="max-w-lg">
					<div className="rounded-xl border border-foreground/10 bg-surface p-6">
						Lag lets a supporting detail arrive with the same content-first
						fallback.
					</div>
				</Scroll.Lag>
				<Scroll.Width
					className="h-64"
					contentClassName="grid place-items-center p-8 text-center"
					coverClassName="bg-background"
					endInset={28}
					frameClassName="rounded-2xl bg-primary/15"
					startInset={0}
				>
					<p className="max-w-sm text-xl font-medium">
						Width owns the framed reveal while this content remains ordinary
						DOM.
					</p>
				</Scroll.Width>
				<Scroll.Parallax magnitude={28}>
					<div className="ml-auto max-w-md rounded-xl bg-foreground px-6 py-10 text-background">
						Parallax is a surface treatment, not a second copy or interaction
						model.
					</div>
				</Scroll.Parallax>
			</div>
		</div>
	);
}
const meta = {
	id: "ui-motion-scroll",
	title: "UI/Motion/Scroll",
	component: Scroll.Parallax,
	subcomponents: {
		"Scroll.Highlight": Scroll.Highlight,
		"Scroll.Lag": Scroll.Lag,
		"Scroll.Width": Scroll.Width,
	},
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Scroll.Parallax>;
export default meta;
type Story = StoryObj<typeof meta>;
export const HighlightContract: Story = {
	args: { children: <span>Readable highlighted copy</span> },
	render: () => (
		<div className="min-h-[120vh] p-12">
			<p className="max-w-xl text-3xl">
				<Scroll.Highlight variant="viewport" active>
					Readable highlighted copy
				</Scroll.Highlight>
			</p>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("Readable highlighted copy"),
		).toBeInTheDocument();
	},
};
export const TransformFamily: Story = {
	args: { children: <span>Transformation content</span> },
	render: () => (
		<div className="grid min-h-[140vh] gap-10 overflow-hidden p-12">
			<Scroll.Lag data-testid="lag">
				<div className="rounded-xl bg-surface p-8">
					Velocity lag remains content
				</div>
			</Scroll.Lag>
			<Scroll.Parallax data-testid="parallax" magnitude={24}>
				<div className="rounded-xl bg-primary/10 p-8">
					Parallax remains content
				</div>
			</Scroll.Parallax>
			<Scroll.Width
				data-testid="width"
				className="h-52"
				frameClassName="bg-surface"
				contentClassName="grid place-items-center"
				coverClassName="bg-background"
				startInset={0}
				endInset={32}
			>
				<p>Width remains content</p>
			</Scroll.Width>
		</div>
	),
	play: async ({ canvas }) => {
		const lag = canvas.getByTestId("lag");
		const parallax = canvas.getByTestId("parallax");
		const width = canvas.getByTestId("width");
		await expect(lag).toHaveTextContent("Velocity lag remains content");
		await expect(parallax).toHaveTextContent("Parallax remains content");
		await expect(width).toHaveTextContent("Width remains content");
		await waitFor(() =>
			expect(parallax.getAttribute("style")).toContain(
				"will-change: transform",
			),
		);
		await waitFor(() =>
			expect(
				width.querySelector('[style*="will-change: border-radius"]'),
			).toBeInTheDocument(),
		);
	},
};

export const NarrativeComposition: Story = {
	args: { children: <span>Scroll narrative</span> },
	render: () => <ScrollNarrative />,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "Replay scroll story" }),
		).toBeVisible();
		await expect(
			canvas.getByText(/Scroll gives narrative emphasis to copy/i),
		).toBeVisible();
		await expect(
			canvas.getByText(/Width owns the framed reveal/i),
		).toBeVisible();
	},
};
