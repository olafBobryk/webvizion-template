import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { focusRing } from "@/components/ui/foundations/focus";
import * as MotionEffect from "@/components/ui/motion/effect";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import type { MotionCompositionMetadata } from "../compositionMetadata";
import * as MotionSource from "./index";
import { catalogContract } from "./MotionSource.catalog";

function StrategyTeachingSurface() {
	const [active, setActive] = useState(false);
	return (
		<div className="grid max-w-5xl gap-6 p-8 md:grid-cols-3">
			<div className="grid gap-2">
				<Text variant="caption" tone="muted">
					Root hover
				</Text>
				<div
					className="rounded-lg border border-subtle p-5 text-xl"
					data-testid="direct-hover-boundary"
				>
					<MotionSource.Root
						asChild
						strategy={{ type: "hover", timing: "component" }}
					>
						<Link
							className={`inline-flex rounded-sm ${focusRing.visibleDefault}`}
							href="/direct-source"
						>
							<MotionEffect.UnderlineText>
								Hover or focus this text
							</MotionEffect.UnderlineText>
						</Link>
					</MotionSource.Root>
				</div>
			</div>
			<div className="grid gap-2">
				<Text variant="caption" tone="muted">
					Nearest owner
				</Text>
				<Link
					data-motion-owner
					className={`rounded-lg border border-subtle p-5 text-xl ${focusRing.visibleDefault}`}
					href="/owner-source"
				>
					<MotionSource.Root as="span" strategy={{ type: "owner-hover" }}>
						<MotionEffect.UnderlineText>
							Owner hover wraps this title across lines
						</MotionEffect.UnderlineText>
					</MotionSource.Root>
				</Link>
			</div>
			<Panel padding="md">
				<Button
					onClick={() => setActive((value) => !value)}
					size="sm"
					variant="secondary"
				>
					Toggle boolean
				</Button>
				<MotionSource.Root strategy={{ type: "boolean", active }}>
					<MotionEffect.TextHighlight className="mt-4 block text-lg">
						Boolean progress highlights this copy.
					</MotionEffect.TextHighlight>
				</MotionSource.Root>
			</Panel>
			<MotionSource.Root
				className="md:col-span-3"
				strategy={{ type: "in-view", once: false }}
			>
				<MotionEffect.Entrance>
					<Panel padding="md">
						In-view source uses the same Entrance effect.
					</Panel>
				</MotionEffect.Entrance>
			</MotionSource.Root>
		</div>
	);
}

const meta = {
	id: "ui-motion-motion-source",
	title: "UI/Motion/MotionSource",
	component: MotionSource.Root,
	subcomponents: { "MotionSource.Sequence": MotionSource.Sequence },
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
} satisfies Meta<typeof MotionSource.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StrategyMatrix: Story = {
	args: {
		children: <span>Source content</span>,
		strategy: { type: "boolean", active: true },
	},
	render: () => <StrategyTeachingSurface />,
	play: async ({ canvas }) => {
		const direct = canvas.getByRole("link", {
			name: "Hover or focus this text",
		});
		const directBoundary = canvas.getByTestId("direct-hover-boundary");
		const owner = canvas.getByRole("link", {
			name: "Owner hover wraps this title across lines",
		});
		await expect(direct).toHaveAttribute(
			"data-motion-source-strategy",
			"hover",
		);
		await expect(direct).toHaveAttribute(
			"data-motion-source-timing",
			"component",
		);
		await waitFor(() => expect(allLinesHidden(direct)).toBe(true));
		await userEvent.hover(directBoundary);
		await waitFor(() => expect(allLinesHidden(direct)).toBe(true));
		await userEvent.unhover(directBoundary);
		await userEvent.hover(direct);
		await waitFor(() => expect(allLinesDrawn(direct)).toBe(true));
		await userEvent.unhover(direct);
		await waitFor(() => expect(allLinesHidden(direct)).toBe(true));
		await expect(owner).toHaveAttribute("data-motion-owner");
		await userEvent.hover(owner);
		await waitFor(() => expect(allLinesDrawn(owner)).toBe(true));
		await userEvent.unhover(owner);
		await waitFor(() => expect(allLinesHidden(owner)).toBe(true));
		await userEvent.tab();
		await expect(direct).toHaveFocus();
		await waitFor(() => expect(allLinesDrawn(direct)).toBe(true));
		await userEvent.click(
			canvas.getByRole("button", { name: "Toggle boolean" }),
		);
		await expect(
			canvas.getByText("Boolean progress highlights this copy."),
		).toBeVisible();
	},
};

export const SharedScrollScene: Story = {
	args: { children: <span>Scroll content</span>, strategy: { type: "scroll" } },
	render: () => (
		<div className="min-h-[220vh] overflow-hidden bg-foreground px-8 py-[80vh] text-background">
			<MotionSource.Root
				className="mx-auto grid max-w-5xl gap-8"
				strategy={{
					type: "scroll",
					offset: ["start 85%", "start 25%"],
					staticProgress: 1,
				}}
			>
				<MotionEffect.TextShift className="whitespace-nowrap text-6xl font-semibold">
					Shared scene text
				</MotionEffect.TextShift>
				<MotionEffect.TextReplay
					className="text-2xl uppercase tracking-[0.2em]"
					repeats={2}
					text="Scroll down"
				/>
				<MotionEffect.Divider />
			</MotionSource.Root>
		</div>
	),
	play: async ({ canvasElement }) => {
		const source = canvasElement.querySelector(
			'[data-motion-source-strategy="scroll"]',
		);
		await expect(source).toBeInTheDocument();
		await expect(source?.querySelectorAll("[data-motion-effect]")).toHaveLength(
			3,
		);
	},
};

export const RevealSequence: Story = {
	args: { children: <span>Reveal content</span>, strategy: { type: "reveal" } },
	render: () => (
		<MotionSource.Sequence
			className="grid max-w-3xl gap-4 p-8 sm:grid-cols-3"
			stagger={0.1}
		>
			{["First", "Second", "Third"].map((label) => (
				<MotionSource.Root key={label} strategy={{ type: "reveal" }}>
					<MotionEffect.Entrance>
						<Panel padding="md">{label} participant</Panel>
					</MotionEffect.Entrance>
				</MotionSource.Root>
			))}
		</MotionSource.Sequence>
	),
	play: async ({ canvas, canvasElement }) => {
		const sequence = canvasElement.querySelector(
			"[data-motion-source-sequence]",
		);
		await expect(sequence).toHaveAttribute(
			"data-motion-source-sequence-once",
			"false",
		);
		await waitFor(() =>
			expect(canvas.getByText("First participant")).toBeVisible(),
		);
		await expect(
			canvasElement.querySelectorAll('[data-motion-source-strategy="reveal"]'),
		).toHaveLength(3);
		await waitFor(
			() => {
				const effects = Array.from(
					canvasElement.querySelectorAll<HTMLElement>(
						'[data-motion-effect="entrance"]',
					),
				);
				expect(effects).toHaveLength(3);
				expect(
					effects.every(
						(effect) => Number.parseFloat(effect.style.opacity) >= 0.99,
					),
				).toBe(true);
			},
			{ timeout: 3000 },
		);
	},
};

export const RevealViewportReentry: Story = {
	args: { children: <span>Replay content</span>, strategy: { type: "reveal" } },
	render: () => (
		<div className="min-h-[260vh] bg-background p-8">
			<MotionSource.Sequence
				className="grid max-w-3xl gap-4 sm:grid-cols-3"
				stagger={0.1}
			>
				{["First", "Second", "Third"].map((label) => (
					<MotionSource.Root key={label} strategy={{ type: "reveal" }}>
						<MotionEffect.Entrance>
							<Panel padding="md">{label} replay participant</Panel>
						</MotionEffect.Entrance>
					</MotionSource.Root>
				))}
			</MotionSource.Sequence>
			<Text className="mt-[190vh]" tone="muted" variant="caption">
				Scroll back to the top to replay the staggered batch.
			</Text>
		</div>
	),
	play: async ({ canvasElement }) => {
		const view = canvasElement.ownerDocument.defaultView;
		if (!view) throw new Error("Story viewport is unavailable.");
		const sequence = canvasElement.querySelector(
			"[data-motion-source-sequence]",
		);
		const effects = () =>
			Array.from(
				canvasElement.querySelectorAll<HTMLElement>(
					'[data-motion-effect="entrance"]',
				),
			);
		const allAtOpacity = (opacity: number) =>
			effects().length === 3 &&
			effects().every(
				(effect) =>
					Math.abs(Number.parseFloat(effect.style.opacity) - opacity) < 0.01,
			);

		view.scrollTo(0, 0);
		await expect(sequence).toHaveAttribute(
			"data-motion-source-sequence-once",
			"false",
		);
		await expect(sequence).toHaveAttribute(
			"data-motion-source-sequence-stagger",
			"0.1",
		);
		await waitFor(() => expect(allAtOpacity(1)).toBe(true), { timeout: 3000 });

		view.scrollTo(0, canvasElement.ownerDocument.documentElement.scrollHeight);
		await waitFor(() => expect(allAtOpacity(0)).toBe(true), { timeout: 3000 });

		view.scrollTo(0, 0);
		await waitFor(() => expect(allAtOpacity(1)).toBe(true), { timeout: 3000 });
	},
};

function FooterHeadingHandoffSurface() {
	const [active, setActive] = useState(false);
	return (
		<section
			aria-label="Footer heading handoff composition"
			className="grid min-h-[30rem] content-end gap-8 bg-background p-8 text-foreground"
		>
			<Button
				onClick={() => setActive((value) => !value)}
				size="sm"
				variant="primary"
			>
				{active ? "Reset footer heading" : "Complete footer heading"}
			</Button>
			<MotionSource.Root
				strategy={{ type: "boolean", active, timing: "grand" }}
			>
				<Text as="h2" theme="dark" variant="headingPage">
					<MotionEffect.TextStagger
						as="span"
						className="block"
						range={[0, 0.72]}
						theme="dark"
						treatment="blur"
						unit="words"
					>
						Finish the story
					</MotionEffect.TextStagger>
					<MotionEffect.TextShift className="mt-2 block" range={[0.18, 1]}>
						<MotionEffect.TextStagger
							as="span"
							theme="dark"
							treatment="blur"
							unit="words"
						>
							with a clear next step
						</MotionEffect.TextStagger>
					</MotionEffect.TextShift>
				</Text>
			</MotionSource.Root>
		</section>
	);
}

export const FooterHeadingHandoff: Story = {
	args: {
		children: <span>Footer heading handoff</span>,
		strategy: { type: "boolean", active: false },
	},
	parameters: {
		motionComposition: {
			effects: ["text-stagger", "text-shift"],
			focusHints: ["shell", "page"],
			role: "footer-heading-handoff",
			schemaVersion: 1,
			staticPattern: "split-heading",
			sources: ["boolean"],
			status: "approved",
		} satisfies MotionCompositionMetadata,
	},
	render: () => <FooterHeadingHandoffSurface />,
	play: async ({ canvas, canvasElement }) => {
		await expect(
			canvas.getByRole("heading", { name: /finish the story/i }),
		).toBeInTheDocument();
		await expect(
			canvasElement.querySelectorAll('[data-motion-effect="text-stagger"]'),
		).toHaveLength(2);
		await expect(
			canvasElement.querySelector('[data-motion-effect="text-shift"]'),
		).not.toBeNull();
		await userEvent.click(
			canvas.getByRole("button", { name: "Complete footer heading" }),
		);
		const firstToken = canvasElement.querySelector<HTMLElement>(
			"[data-motion-effect-text-stagger-token] > span",
		);
		if (!firstToken)
			throw new Error("Footer heading did not render text tokens.");
		await waitFor(() =>
			expect(Number(getComputedStyle(firstToken).opacity)).toBe(1),
		);
	},
};

export const QuoteScrollHighlight: Story = {
	args: {
		children: <span>Quote scroll highlight composition</span>,
		strategy: { type: "scroll" },
	},
	parameters: {
		motionComposition: {
			effects: ["entrance", "text-highlight", "grid-clip"],
			focusHints: ["section", "page"],
			role: "quote-scroll-highlight",
			schemaVersion: 1,
			staticPattern: "quote-with-supporting-media",
			sources: ["scroll"],
			status: "approved",
		} satisfies MotionCompositionMetadata,
	},
	render: () => (
		<div className="min-h-[220vh] bg-background px-8 py-[80vh] text-foreground">
			<section
				aria-label="Quote scroll highlight composition"
				className="mx-auto max-w-5xl"
			>
				<MotionSource.Root
					className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)] md:items-end"
					strategy={{
						offset: ["start 84%", "start 38%"],
						smooth: true,
						staticProgress: 1,
						type: "scroll",
					}}
				>
					<div className="grid gap-6">
						<MotionEffect.Entrance>
							<MotionEffect.TextHighlight
								as="blockquote"
								theme="dark"
								variant="headingLg"
							>
								A clear conviction earns attention before it asks for action.
							</MotionEffect.TextHighlight>
						</MotionEffect.Entrance>
					</div>
					<MotionEffect.GridClip className="aspect-[4/5] overflow-hidden rounded-xl">
						<div
							aria-label="Abstract supporting media"
							className="h-full bg-[radial-gradient(circle_at_30%_24%,var(--color-primary),transparent_28%),linear-gradient(145deg,var(--color-surface),var(--color-foreground))]"
							role="img"
						/>
					</MotionEffect.GridClip>
				</MotionSource.Root>
			</section>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		await expect(
			canvas.getByText(/clear conviction earns attention/i),
		).toBeInTheDocument();
		await expect(
			canvasElement.querySelector('[data-motion-source-strategy="scroll"]'),
		).not.toBeNull();
		await expect(
			canvasElement.querySelector('[data-motion-effect="text-highlight"]'),
		).not.toBeNull();
		await expect(
			canvasElement.querySelector('[data-motion-effect="grid-clip"]'),
		).not.toBeNull();
	},
};

export const ReducedMotion: Story = {
	args: { children: <span>Reduced motion</span>, strategy: { type: "scroll" } },
	beforeEach: () => {
		const previous = document.documentElement.dataset.motionOverride;
		document.documentElement.dataset.motionOverride = "off";
		return () => {
			if (previous === undefined)
				delete document.documentElement.dataset.motionOverride;
			else document.documentElement.dataset.motionOverride = previous;
		};
	},
	render: () => (
		<div className="grid max-w-xl gap-5 p-8">
			<MotionSource.Root strategy={{ type: "scroll" }}>
				<MotionEffect.Entrance>Completed scroll fallback</MotionEffect.Entrance>
			</MotionSource.Root>
			<MotionSource.Root asChild strategy={{ type: "hover" }}>
				<button className="rounded border border-subtle p-4" type="button">
					<MotionEffect.UnderlineText>
						Immediate interaction feedback
					</MotionEffect.UnderlineText>
				</button>
			</MotionSource.Root>
		</div>
	),
	play: async ({ canvas }) => {
		await waitFor(() =>
			expect(canvas.getByText("Completed scroll fallback")).toBeVisible(),
		);
		const button = canvas.getByRole("button", {
			name: "Immediate interaction feedback",
		});
		await userEvent.hover(button);
		await waitFor(() => expect(allLinesDrawn(button)).toBe(true));
	},
};

function allLinesDrawn(root: Element | null) {
	const lines = Array.from(root?.querySelectorAll("line") ?? []);
	return (
		lines.length > 0 &&
		lines.every((line) => line.getAttribute("x1") !== line.getAttribute("x2"))
	);
}

function allLinesHidden(root: Element | null) {
	const lines = Array.from(root?.querySelectorAll("line") ?? []);
	return (
		lines.length > 0 &&
		lines.every((line) => line.getAttribute("x1") === line.getAttribute("x2"))
	);
}
