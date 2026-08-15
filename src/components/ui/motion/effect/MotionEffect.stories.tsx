import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { focusRing } from "@/components/ui/foundations/focus";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import type { MotionCompositionMetadata } from "../compositionMetadata";
import * as MotionSource from "../source";
import * as MotionEffect from "./index";
import { catalogContract } from "./MotionEffect.catalog";

const meta = {
	id: "ui-motion-motion-effect",
	title: "UI/Motion/MotionEffect",
	component: MotionEffect.Entrance,
	subcomponents: {
		"MotionEffect.TextStagger": MotionEffect.TextStagger,
		"MotionEffect.TextHighlight": MotionEffect.TextHighlight,
		"MotionEffect.Divider": MotionEffect.Divider,
		"MotionEffect.TextShift": MotionEffect.TextShift,
		"MotionEffect.TextReplay": MotionEffect.TextReplay,
		"MotionEffect.UnderlineText": MotionEffect.UnderlineText,
		"MotionEffect.Parallax": MotionEffect.Parallax,
		"MotionEffect.FrameWidth": MotionEffect.FrameWidth,
		"MotionEffect.Scramble": MotionEffect.Scramble,
		"MotionEffect.Number": MotionEffect.Number,
		"MotionEffect.Clip": MotionEffect.Clip,
		"MotionEffect.GridClip": MotionEffect.GridClip,
		"MotionEffect.ScaleFade": MotionEffect.ScaleFade,
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
} satisfies Meta<typeof MotionEffect.Entrance>;

export default meta;
type Story = StoryObj<typeof meta>;
type HoverTextReplayStory = StoryObj<{
	stagger: number;
	text: string;
	timing: MotionSource.Timing;
}>;

function EffectTeachingSurface() {
	const [active, setActive] = useState(true);
	return (
		<div className="grid max-w-6xl gap-6 p-8">
			<Button
				onClick={() => setActive((value) => !value)}
				size="sm"
				variant="secondary"
			>
				Toggle all effects
			</Button>
			<MotionSource.Root
				className="grid gap-8"
				strategy={{ type: "boolean", active, timing: "grand" }}
			>
				<div className="grid gap-5 md:grid-cols-3">
					<MotionEffect.Entrance>
						<Panel padding="md">Entrance</Panel>
					</MotionEffect.Entrance>
					<MotionEffect.Parallax magnitude={18}>
						<Panel padding="md">Parallax</Panel>
					</MotionEffect.Parallax>
					<MotionEffect.Clip
						finalRadius={16}
						origin={{ block: "start", inline: "start" }}
						variant="corner"
					>
						<Panel padding="md">Generic clip content</Panel>
					</MotionEffect.Clip>
				</div>
				<MotionEffect.TextShift className="text-4xl font-semibold">
					Measured text shift
				</MotionEffect.TextShift>
				<MotionEffect.Divider />
				<MotionEffect.FrameWidth
					className="h-48"
					contentClassName="grid place-items-center"
					coverClassName="bg-background"
					endInset={32}
					endRadius={{ tl: 24, tr: 24, br: 24, bl: 24 }}
					frameClassName="bg-primary/15"
					startInset={0}
				>
					<Text variant="bodyStrong">Framed width</Text>
				</MotionEffect.FrameWidth>
			</MotionSource.Root>
		</div>
	);
}

export const EffectGallery: Story = {
	args: { children: <span>Effect content</span> },
	render: () => <EffectTeachingSurface />,
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText("Entrance")).toBeInTheDocument();
		await expect(canvas.getByText("Generic clip content")).toBeInTheDocument();
		await expect(canvas.getByText("Framed width")).toBeInTheDocument();
		await expect(
			canvasElement.querySelectorAll("[data-motion-effect]").length,
		).toBeGreaterThanOrEqual(6);
		await userEvent.click(
			canvas.getByRole("button", { name: "Toggle all effects" }),
		);
		await expect(canvas.getByText("Measured text shift")).toBeInTheDocument();
		await userEvent.click(
			canvas.getByRole("button", { name: "Toggle all effects" }),
		);
		await expect(canvas.getByText("Entrance")).toBeVisible();
	},
};

function TextEffectsTeachingSurface() {
	const [active] = useState(true);
	return (
		<MotionSource.Root
			className="grid max-w-4xl gap-7 p-8"
			strategy={{ type: "boolean", active, timing: "grand" }}
		>
			<MotionEffect.TextStagger as="h2" variant="headingLg">
				A stable character stagger
			</MotionEffect.TextStagger>
			<MotionEffect.TextHighlight
				as="p"
				highlight="shared progress"
				variant="headingXs"
			>
				Every text effect consumes shared progress.
			</MotionEffect.TextHighlight>
			<MotionEffect.TextReplay
				className="text-xl uppercase tracking-[0.18em]"
				repeats={2}
				text="Replay text"
			/>
			<div className="grid gap-4 md:grid-cols-2">
				<Panel padding="md">
					<MotionEffect.Scramble
						maintainSpace
						text="Seeded deterministic scramble"
					/>
				</Panel>
				<Panel padding="md">
					<MotionEffect.Scramble
						maintainSpace
						mode="numeric"
						text="Build 2048"
					/>
				</Panel>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{(["countUp", "scroll"] as const).map((animation) => (
					<Panel key={animation} padding="md">
						<Text variant="caption" tone="muted">
							{animation}
						</Text>
						<MotionEffect.Number
							animation={animation}
							className="mt-3 text-4xl font-semibold"
							text="42 projects"
						/>
					</Panel>
				))}
			</div>
		</MotionSource.Root>
	);
}

export const TextEffects: Story = {
	args: { children: <span>Text effect</span> },
	render: () => <TextEffectsTeachingSurface />,
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText("A stable character stagger")).toBeVisible();
		await expect(
			canvas.getAllByText("Seeded deterministic scramble").length,
		).toBeGreaterThanOrEqual(1);
		await expect(
			canvasElement.querySelectorAll('[data-motion-effect="number"]'),
		).toHaveLength(2);
	},
};

function TextStaggerTeachingSurface() {
	const [active, setActive] = useState(false);
	return (
		<div className="grid max-w-5xl gap-8 p-8">
			<Button
				onClick={() => setActive((value) => !value)}
				size="sm"
				variant="secondary"
			>
				{active ? "Reverse text staggers" : "Complete text staggers"}
			</Button>
			<MotionSource.Root
				className="grid gap-8"
				strategy={{ type: "boolean", active, timing: "grand" }}
			>
				<MotionEffect.TextStagger
					as="h2"
					className="max-w-3xl"
					variant="headingLg"
				>
					Graphemes keep emoji 👩🏽‍💻 together.
				</MotionEffect.TextStagger>
				<MotionEffect.TextStagger
					className="block w-80 text-3xl leading-tight"
					treatment="blur"
					unit="words"
				>
					Words, punctuation, and wrapping stay intact across lines.
				</MotionEffect.TextStagger>
				<MotionEffect.TextStagger
					blurOffset="0.9em"
					blurRadius={8}
					className="text-4xl font-medium"
					segments={[
						{ text: "186", unit: "graphemes" },
						{
							className: "font-semibold italic",
							text: " creates liquidity structures",
							unit: "words",
						},
					]}
					treatment="blur"
				/>
				<MotionEffect.TextStagger
					className="max-w-md text-2xl leading-relaxed"
					dir="rtl"
					lang="ar"
					treatment="blur"
					unit="words"
				>
					النص العربي يحافظ على الاتجاه وعلامات الترقيم.
				</MotionEffect.TextStagger>
				<MotionEffect.TextStagger lang="ja" treatment="blur" unit="words">
					流動性構造をつくる
				</MotionEffect.TextStagger>
			</MotionSource.Root>
		</div>
	);
}

export const TextStaggerModes: Story = {
	args: { children: <span>Text stagger modes</span> },
	parameters: {
		motionComposition: {
			effects: ["text-stagger"],
			focusHints: ["section", "page"],
			role: "controlled-text-stagger",
			schemaVersion: 1,
			staticPattern: "standalone-text",
			sources: ["boolean"],
			status: "approved",
		} satisfies MotionCompositionMetadata,
	},
	render: () => <TextStaggerTeachingSurface />,
	play: async ({ canvas, canvasElement }) => {
		const roots = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(
				'[data-motion-effect="text-stagger"]',
			),
		);
		await expect(roots).toHaveLength(5);
		await expect(roots[0]?.querySelector(".sr-only")).toHaveTextContent(
			"Graphemes keep emoji 👩🏽‍💻 together.",
		);
		await expect(roots[2]?.querySelector(".sr-only")).toHaveTextContent(
			"186 creates liquidity structures",
		);
		const graphemeUnits = Array.from(
			roots[0]?.querySelectorAll<HTMLElement>(
				"[data-motion-effect-text-stagger-token]",
			) ?? [],
		);
		await expect(
			graphemeUnits.filter((unit) => unit.textContent === "👩🏽‍💻"),
		).toHaveLength(1);
		await expect(
			roots[1]?.querySelector<HTMLElement>(
				"[data-motion-effect-text-stagger-token]",
			),
		).toHaveTextContent("Words,");
		await waitFor(() => {
			const wordLines = new Set(
				Array.from(
					roots[1]?.querySelectorAll<HTMLElement>(
						"[data-motion-effect-text-stagger-token]",
					) ?? [],
				).map((unit) => unit.offsetTop),
			);
			expect(wordLines.size).toBeGreaterThan(1);
		});
		await expect(
			roots[2]?.querySelectorAll(
				'[data-motion-effect-text-stagger-segment="0"]',
			),
		).toHaveLength(3);
		await expect(
			roots[2]?.querySelectorAll(
				'[data-motion-effect-text-stagger-segment="1"]',
			).length,
		).toBeGreaterThan(1);
		await expect(
			roots[4]?.querySelectorAll("[data-motion-effect-text-stagger-token]")
				.length,
		).toBeGreaterThan(1);
		await expect(roots[3]).toHaveAttribute("dir", "rtl");

		const firstVisual = roots[0]?.querySelector<HTMLElement>(
			"[data-motion-effect-text-stagger-token] > span",
		);
		if (!firstVisual)
			throw new Error("TextStagger visual token was not rendered.");
		await waitFor(() =>
			expect(Number(getComputedStyle(firstVisual).opacity)).toBe(0),
		);
		await userEvent.click(
			canvas.getByRole("button", { name: "Complete text staggers" }),
		);
		await waitFor(() =>
			expect(Number(getComputedStyle(firstVisual).opacity)).toBe(1),
		);
	},
};

function GridClipTeachingSurface() {
	const [active, setActive] = useState(false);
	return (
		<div className="grid gap-6 p-8">
			<Button
				onClick={() => setActive((value) => !value)}
				size="sm"
				variant="secondary"
			>
				{active ? "Reverse grid clip" : "Complete grid clip"}
			</Button>
			<div className="grid justify-items-start gap-6 overflow-x-auto">
				{[
					["landscape", "h-80 w-[56rem]"],
					["portrait", "h-96 w-80"],
				].map(([name, size]) => (
					<MotionSource.Root
						className={size}
						key={name}
						strategy={{ type: "boolean", active, timing: "grand" }}
					>
						<MotionEffect.GridClip
							className="h-full"
							data-testid={`grid-clip-${name}`}
						>
							<div className="h-full bg-[radial-gradient(circle_at_25%_20%,var(--color-primary),transparent_36%),linear-gradient(135deg,var(--color-foreground),var(--color-surface))]" />
						</MotionEffect.GridClip>
					</MotionSource.Root>
				))}
			</div>
		</div>
	);
}

export const GridClipMedia: Story = {
	args: { children: <span>Grid-clipped media</span> },
	parameters: {
		motionComposition: {
			effects: ["grid-clip"],
			focusHints: ["section", "page"],
			role: "grid-clipped-media",
			schemaVersion: 1,
			staticPattern: "media-frame",
			sources: ["boolean"],
			status: "approved",
		} satisfies MotionCompositionMetadata,
	},
	render: () => <GridClipTeachingSurface />,
	play: async ({ canvas, userEvent }) => {
		const landscape = canvas.getByTestId("grid-clip-landscape");
		const portrait = canvas.getByTestId("grid-clip-portrait");
		await expect(
			Number(landscape.dataset.motionGridClipColumns),
		).toBeGreaterThan(Number(portrait.dataset.motionGridClipColumns));
		await expect(
			landscape.querySelectorAll("[data-motion-grid-clip-tile]").length,
		).toBeGreaterThan(0);
		await userEvent.click(
			canvas.getByRole("button", { name: "Complete grid clip" }),
		);
		await waitFor(() =>
			expect(landscape).toHaveAttribute(
				"data-motion-grid-clip-complete",
				"true",
			),
		);
	},
};

function GeometricMediaTeachingSurface() {
	const [active, setActive] = useState(false);
	return (
		<div className="grid max-w-6xl gap-6 p-8">
			<Button
				onClick={() => setActive((value) => !value)}
				size="sm"
				variant="secondary"
			>
				{active ? "Reverse media effects" : "Complete media effects"}
			</Button>
			<MotionSource.Root
				className="grid gap-5 md:grid-cols-2"
				strategy={{ type: "boolean", active, timing: "grand" }}
			>
				<MotionEffect.Clip
					axis="inline"
					className="min-h-48 rounded-xl bg-primary/15 p-6"
					origin="start"
				>
					Inline-start inset in LTR
				</MotionEffect.Clip>
				<MotionEffect.Clip
					axis="inline"
					className="min-h-48 rounded-xl bg-primary/15 p-6 text-right"
					dir="rtl"
					origin="start"
				>
					بداية السطر في RTL
				</MotionEffect.Clip>
				<MotionEffect.Clip
					className="min-h-48 rounded-xl bg-foreground p-6 text-background"
					origin={{ block: "start", inline: "end" }}
					variant="corner"
				>
					Logical corner reveal
				</MotionEffect.Clip>
				<MotionEffect.Clip
					className="min-h-48 bg-primary/20 p-6"
					fromRadius={12}
					origin={{ x: "calc(100% - 2rem)", y: "2rem" }}
					toRadius={175}
					variant="radial"
				>
					Custom radial origin
				</MotionEffect.Clip>
				<MotionEffect.Clip className="min-h-64 md:col-span-2" finalRadius={24}>
					<MotionEffect.ScaleFade asChild>
						<div className="grid h-full min-h-64 place-items-center bg-[linear-gradient(135deg,var(--color-primary),var(--color-background))] p-8 text-3xl font-semibold">
							Clip geometry plus independent scale and fade
						</div>
					</MotionEffect.ScaleFade>
				</MotionEffect.Clip>
			</MotionSource.Root>
		</div>
	);
}

export const GeometricMediaEffects: Story = {
	args: { children: <span>Geometric media effects</span> },
	render: () => <GeometricMediaTeachingSurface />,
	play: async ({ canvas, canvasElement }) => {
		const clips = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(
				'[data-motion-effect="clip"]',
			),
		);
		const scaleFade = canvasElement.querySelector<HTMLElement>(
			'[data-motion-effect="scale-fade"]',
		);
		if (!scaleFade) throw new Error("ScaleFade composition was not rendered.");
		await expect(clips).toHaveLength(5);
		await waitFor(() =>
			expect(clips[1]).toHaveAttribute(
				"data-motion-effect-clip-direction",
				"rtl",
			),
		);
		await expect(clips[3]).toHaveAttribute(
			"data-motion-effect-clip-variant",
			"radial",
		);
		await waitFor(() =>
			expect(getComputedStyle(clips[3] as HTMLElement).clipPath).toContain(
				"12%",
			),
		);
		await waitFor(() =>
			expect(Number(getComputedStyle(scaleFade).opacity)).toBeCloseTo(0.56, 2),
		);
		await userEvent.click(
			canvas.getByRole("button", { name: "Complete media effects" }),
		);
		await waitFor(() =>
			expect(getComputedStyle(clips[3] as HTMLElement).clipPath).toContain(
				"175%",
			),
		);
		await waitFor(() =>
			expect(Number(getComputedStyle(scaleFade).opacity)).toBe(1),
		);
	},
};

export const HoverTextReplay: HoverTextReplayStory = {
	args: {
		stagger: 0.4,
		text: "Featured work",
		timing: "grand",
	},
	argTypes: {
		stagger: {
			control: { max: 0.42, min: 0, step: 0.01, type: "range" },
			description:
				"Normalized progress distributed between the first and last character.",
		},
		text: { control: "text" },
		timing: {
			control: "select",
			description:
				"Shared MotionSource timing preset for the complete hover transition.",
			options: ["micro", "interactive", "component", "macro", "grand"],
		},
	},
	parameters: {
		controls: { include: ["text", "stagger", "timing"] },
	},
	render: ({ stagger, text, timing }) => (
		<div className="grid min-h-[28rem] place-items-center bg-foreground p-8 text-4xl font-medium uppercase tracking-[0.12em] text-background sm:text-6xl">
			<MotionSource.Root asChild strategy={{ type: "hover", timing }}>
				<Link className={focusRing.visibleDefault} href="/featured-work">
					<MotionEffect.TextReplay stagger={stagger} text={text} />
				</Link>
			</MotionSource.Root>
		</div>
	),
	play: async ({ args, canvas, canvasElement }) => {
		const link = canvas.getByRole("link", { name: args.text });
		const replay = canvasElement.querySelector<HTMLElement>(
			'[data-motion-effect="text-replay"]',
		);
		const outgoing = canvasElement.querySelector<HTMLElement>(
			'[data-motion-effect-text-replay-layer="outgoing"]',
		);
		const characterOffsets = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(
				"[data-motion-effect-text-replay-offset]",
			),
		).map((character) =>
			Number(character.dataset.motionEffectTextReplayOffset),
		);
		if (!outgoing)
			throw new Error("TextReplay outgoing layer was not rendered.");

		await expect(link).toHaveAttribute("href", "/featured-work");
		await expect(link).toHaveAccessibleName(args.text);
		await expect(link).toHaveAttribute("data-motion-source-strategy", "hover");
		await expect(link).toHaveAttribute(
			"data-motion-source-timing",
			args.timing,
		);
		await expect(link).toHaveClass("focus-visible:ring-3");
		await expect(replay).toHaveAttribute(
			"data-motion-effect-text-stagger",
			String(args.stagger),
		);
		await expect(characterOffsets.at(-1)).toBeGreaterThan(
			characterOffsets[0] ?? 0,
		);
		await waitFor(() =>
			expect(replayLayerOpacity(outgoing)).toBeGreaterThan(0.99),
		);

		await userEvent.hover(link);
		await waitFor(() =>
			expect(replayLayerOpacity(outgoing)).toBeLessThan(0.98),
		);
		await userEvent.unhover(link);
		await waitFor(() =>
			expect(replayLayerOpacity(outgoing)).toBeGreaterThan(0.99),
		);

		await userEvent.tab();
		await expect(link).toHaveFocus();
		await waitFor(() =>
			expect(replayLayerOpacity(outgoing)).toBeLessThan(0.98),
		);
		link.blur();
		await waitFor(() =>
			expect(replayLayerOpacity(outgoing)).toBeGreaterThan(0.99),
		);
	},
};

function DeterministicProgressHarness() {
	const [active, setActive] = useState(false);
	return (
		<div className="grid max-w-xl gap-5 p-8">
			<Button
				onClick={() => setActive((value) => !value)}
				size="sm"
				variant="secondary"
			>
				{active ? "Reverse progress" : "Complete progress"}
			</Button>
			<MotionSource.Root strategy={{ type: "boolean", active }}>
				<div className="grid gap-4">
					<MotionEffect.Scramble maintainSpace text="Signal ✦ 2048" />
					<MotionEffect.Number
						animation="countUp"
						className="text-4xl font-semibold"
						text="2048 builds"
					/>
				</div>
			</MotionSource.Root>
		</div>
	);
}

export const DeterministicProgress: Story = {
	args: { children: <span>Deterministic effect</span> },
	beforeEach: () => {
		const previous = document.documentElement.dataset.motionOverride;
		document.documentElement.dataset.motionOverride = "off";
		return () => {
			if (previous === undefined)
				delete document.documentElement.dataset.motionOverride;
			else document.documentElement.dataset.motionOverride = previous;
		};
	},
	render: () => <DeterministicProgressHarness />,
	play: async ({ canvas, canvasElement }) => {
		await waitFor(() =>
			expect(
				canvasElement.querySelector('[data-motion-source-mode="instant"]'),
			).toBeInTheDocument(),
		);
		const visual = canvasElement.querySelector<HTMLElement>(
			'[data-motion-effect-scramble-visual=""]',
		);
		if (!visual) throw new Error("Scramble visual output was not rendered.");
		const initialFrame = visual.textContent;
		await userEvent.click(
			canvas.getByRole("button", { name: "Complete progress" }),
		);
		await waitFor(() => expect(visual).toHaveTextContent("Signal ✦ 2048"));
		await expect(
			canvasElement.querySelector('[data-motion-effect="number"]'),
		).toHaveTextContent("2048 builds");
		await userEvent.click(
			canvas.getByRole("button", { name: "Reverse progress" }),
		);
		await waitFor(() => expect(visual.textContent).toBe(initialFrame));
	},
};

function UnderlineTeachingSurface() {
	const [narrow, setNarrow] = useState(false);
	return (
		<div className="grid max-w-3xl gap-8 p-8">
			<Link
				data-motion-owner
				className={`block rounded-xl border border-subtle p-6 ${narrow ? "w-56" : "w-80"} ${focusRing.visibleDefault}`}
				href="/card-title"
			>
				<Text variant="caption" tone="muted">
					Whole-card owner
				</Text>
				<MotionSource.Root as="span" strategy={{ type: "owner-hover" }}>
					<MotionEffect.UnderlineText className="mt-12 text-3xl leading-tight">
						A wrapped card title draws continuously
					</MotionEffect.UnderlineText>
				</MotionSource.Root>
			</Link>
			<Link
				data-motion-owner
				className={`w-72 rounded-sm text-2xl ${focusRing.visibleDefault}`}
				dir="rtl"
				href="/rtl"
			>
				<MotionSource.Root as="span" strategy={{ type: "owner-hover" }}>
					<MotionEffect.UnderlineText>
						عنوان متعدد الأسطر يبدأ من اليمين
					</MotionEffect.UnderlineText>
				</MotionSource.Root>
			</Link>
			<Button
				onClick={() => setNarrow((value) => !value)}
				size="sm"
				variant="secondary"
			>
				{narrow ? "Widen card" : "Narrow card"}
			</Button>
		</div>
	);
}

export const UnderlineOwners: Story = {
	args: { children: <span>Underline content</span> },
	render: () => <UnderlineTeachingSurface />,
	play: async ({ canvas }) => {
		const card = canvas.getByRole("link", { name: /A wrapped card title/i });
		const rtl = canvas.getByRole("link", {
			name: "عنوان متعدد الأسطر يبدأ من اليمين",
		});
		await waitFor(() =>
			expect(card.querySelectorAll("line").length).toBeGreaterThan(1),
		);
		await userEvent.hover(card);
		await waitFor(() => expect(allLinesDrawn(card)).toBe(true));
		await userEvent.unhover(card);
		await waitFor(() => expect(allLinesHidden(card)).toBe(true));
		await userEvent.hover(rtl);
		await waitFor(() => expect(allLinesDrawn(rtl)).toBe(true));
		const firstLine = rtl.querySelector("line");
		await expect(Number(firstLine?.getAttribute("x2"))).toBeLessThan(
			Number(firstLine?.getAttribute("x1")),
		);
		const before = card.querySelectorAll("line").length;
		await userEvent.click(canvas.getByRole("button", { name: "Narrow card" }));
		await waitFor(() =>
			expect(card.querySelectorAll("line").length).not.toBe(before),
		);
	},
};

class EffectUsageBoundary extends Component<
	{ children: ReactNode },
	{ error: Error | null }
> {
	state = { error: null as Error | null };
	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	componentDidCatch(_error: Error, _info: ErrorInfo) {}
	render() {
		return this.state.error ? (
			<p role="alert">{this.state.error.message}</p>
		) : (
			this.props.children
		);
	}
}

export const RequiresSource: Story = {
	args: { children: <span>Missing source</span> },
	render: () => (
		<div className="grid gap-3 p-8">
			<EffectUsageBoundary>
				<MotionEffect.TextStagger>
					Unsupported text stagger
				</MotionEffect.TextStagger>
			</EffectUsageBoundary>
			<EffectUsageBoundary>
				<MotionEffect.Clip>Unsupported clip</MotionEffect.Clip>
			</EffectUsageBoundary>
			<EffectUsageBoundary>
				<MotionEffect.ScaleFade>Unsupported scale fade</MotionEffect.ScaleFade>
			</EffectUsageBoundary>
		</div>
	),
	play: async ({ canvas }) => {
		const alerts = canvas.getAllByRole("alert");
		await expect(alerts).toHaveLength(3);
		await expect(alerts[0]).toHaveTextContent(
			"MotionEffect.TextStagger must be rendered inside MotionSource.Root.",
		);
		await expect(alerts[1]).toHaveTextContent(
			"MotionEffect.Clip must be rendered inside MotionSource.Root.",
		);
		await expect(alerts[2]).toHaveTextContent(
			"MotionEffect.ScaleFade must be rendered inside MotionSource.Root.",
		);
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

function replayLayerOpacity(layer: HTMLElement) {
	return Number.parseFloat(getComputedStyle(layer).opacity);
}
