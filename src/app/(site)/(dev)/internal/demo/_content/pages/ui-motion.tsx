"use client";

import { useState } from "react";
import { Chip, Skeleton } from "@/components/ui/misc";
import * as AutoCycle from "@/components/ui/motion/auto-cycle";
import { LetterWave } from "@/components/ui/motion/LetterWave";
import * as Reveal from "@/components/ui/motion/reveal";
import * as Scroll from "@/components/ui/motion/scroll";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { useTouchScreen } from "@/hooks/useTouchScreen";
import { DemoMediaFrame, imageSwitcherDemoImages } from "../mediaFixtures";
import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

const autoCycleDemoItems = [
	{
		title: "Brief",
		description: "Gather the highest-risk user need before motion begins.",
	},
	{
		title: "Sequence",
		description:
			"Cycle through items after app readiness or a visibility gate.",
	},
	{
		title: "Refine",
		description: "Pause on hover or focus so users can inspect one state.",
	},
];

const scrollHighlightBaseColor = "rgb(var(--color-foreground-rgb) / 0.45)";

const scrollHighlightTargetColor = "rgb(var(--color-primary-rgb) / 1)";

const revealNumericStats = [
	{
		value: "128+",
		label: "Signals grouped",
	},
	{
		value: "5x",
		label: "Iteration speed",
	},
	{
		value: "300%",
		label: "Coverage range",
	},
	{
		value: "24/7",
		label: "Review window",
	},
];

function AutoCycleDemo() {
	return (
		<AutoCycle.Root
			count={autoCycleDemoItems.length}
			intervalMs={1800}
			className="grid gap-3"
		>
			<AutoCycleDemoContent />
		</AutoCycle.Root>
	);
}

function RevealNumericStatsDemo() {
	return (
		<Reveal.Sequence className="grid gap-3 sm:grid-cols-2" stagger={0.12}>
			{revealNumericStats.map((stat) => (
				<Reveal.Item key={stat.label}>
					<Panel
						background="surface"
						border="subtle"
						padding="sm"
						radius="sm"
						shadow="none"
						className="flex min-h-32 flex-col justify-between"
					>
						<Reveal.Number
							animation="countUp"
							as="p"
							className="m-0 text-4xl font-semibold leading-none tracking-normal tabular-nums text-foreground sm:text-5xl"
							data-demo-numeric-value={stat.value}
							text={stat.value}
						/>
						<Text variant="caption" tone="muted" className="mt-3 block">
							{stat.label}
						</Text>
					</Panel>
				</Reveal.Item>
			))}
		</Reveal.Sequence>
	);
}

function TouchScreenStatusDemo() {
	const isTouchScreen = useTouchScreen();

	return (
		<Panel
			background="surface"
			border="subtle"
			padding="sm"
			radius="sm"
			shadow="none"
		>
			<Text variant="bodyStrong">
				{isTouchScreen ? "Touch / coarse pointer" : "Hover / fine pointer"}
			</Text>
			<Text variant="caption" tone="muted" className="mt-2 block">
				{isTouchScreen
					? "Use this branch for touch-safe controls and hover fallbacks."
					: "Use this branch for hover previews and pointer-rich controls."}
			</Text>
		</Panel>
	);
}

function AutoCycleDemoContent() {
	const { activeIndex, getItemProps, progress, setActive } =
		AutoCycle.useController();

	return (
		<div className="grid gap-3">
			<div className="h-1 overflow-hidden rounded-full bg-foreground/10">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: `${Math.round(progress * 100)}%` }}
				/>
			</div>
			<div className="grid gap-2 sm:grid-cols-3">
				{autoCycleDemoItems.map((item, index) => (
					<Button
						key={item.title}
						type="button"
						size="none"
						variant="secondary"
						align="left"
						className="w-full rounded-lg p-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
						contentClassName="flex-col items-start gap-1"
						onClick={() => setActive(index)}
						{...getItemProps(index)}
					>
						<Text variant="bodyStrong">{item.title}</Text>
						<Text variant="caption" tone="muted">
							{item.description}
						</Text>
					</Button>
				))}
			</div>
			<Text variant="caption" tone="muted">
				Active index: {activeIndex + 1} / {autoCycleDemoItems.length}
			</Text>
		</div>
	);
}

export const uiMotionDemoPage: DemoPage = {
	id: "ui-motion",
	slug: ["ui", "motion"],
	title: "UI Motion",
	description: "Reveal + scroll motion",
	groups: [
		{
			id: "motion",
			title: "Motion",
			description: "Reveal + scroll motion",
			items: [
				{
					id: "reveal-global-item",
					kind: "component",
					name: "Reveal.Item",
					label: "Globally scheduled items",
					related: relatedMap["Reveal.Item"],
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<Reveal.Item>
									<Text variant="bodyStrong">Reveal 1</Text>
								</Reveal.Item>
								<Reveal.Item>
									<Text variant="bodyStrong">Reveal 2</Text>
								</Reveal.Item>
							</div>
						);
					},
				},
				{
					id: "reveal-group",
					kind: "component",
					name: "Reveal.Sequence",
					label: "Local stagger boundary",
					related: relatedMap["Reveal.Sequence"],
					Render() {
						return (
							<Reveal.Sequence className="flex flex-col gap-2" stagger={0.16}>
								<Reveal.Item>
									<Text variant="bodyStrong">Scoped reveal 1</Text>
								</Reveal.Item>
								<Reveal.Item>
									<Text variant="bodyStrong">Scoped reveal 2</Text>
								</Reveal.Item>
							</Reveal.Sequence>
						);
					},
				},
				{
					id: "reveal-image",
					kind: "component",
					name: "Reveal.Image",
					label: "Image reveal strategies",
					related: relatedMap["Reveal.Image"],
					Render() {
						return (
							<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
								<div className="flex flex-col gap-2">
									<Text variant="caption" tone="muted">
										Default: ignores image load
									</Text>
									<DemoMediaFrame>
										<Reveal.Image
											src="/test/blob.png"
											alt="Abstract blob"
											fill
											sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
											className="w-full"
											contentClassName="aspect-[4/3] w-full overflow-hidden"
											imageClassName="object-cover"
										/>
									</DemoMediaFrame>
								</div>
								<div className="flex flex-col gap-2">
									<Text variant="caption" tone="muted">
										Opt-in: waits for image load
									</Text>
									<DemoMediaFrame>
										<Reveal.Image
											src="/test/mercury.png"
											alt="Mercury-like abstract surface"
											fill
											sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
											loadStrategy="wait-for-load"
											placeholder="blur"
											blurDataURL={imageSwitcherDemoImages[0].blurDataURL}
											className="w-full"
											contentClassName="aspect-[4/3] w-full overflow-hidden"
											imageClassName="object-cover"
											fallback={<Skeleton className="h-full w-full" />}
										/>
									</DemoMediaFrame>
								</div>
								<div className="flex flex-col gap-2">
									<Text variant="caption" tone="muted">
										Corner clip with overlay
									</Text>
									<DemoMediaFrame>
										<Reveal.Image
											src="/test/blob.png"
											alt="Abstract blob with overlay"
											fill
											sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
											revealVariant="corner-clip"
											revealOrigin="top-left"
											revealFinalRadius={16}
											className="w-full"
											contentClassName="aspect-[4/3] w-full overflow-hidden"
											imageClassName="object-cover"
											overlay={
												<Panel
													background="background"
													border="subtle"
													gap="none"
													padding="xs"
													radius="sm"
													shadow="sm"
													className="absolute inset-x-3 bottom-3 bg-background/85 text-foreground backdrop-blur-sm"
												>
													<Text variant="bodyStrong">Overlay content</Text>
													<Text
														variant="caption"
														tone="muted"
														className="mt-1 block"
													>
														Content stays inside the reveal mask.
													</Text>
												</Panel>
											}
										/>
									</DemoMediaFrame>
								</div>
								<div className="flex flex-col gap-2">
									<Text variant="caption" tone="muted">
										Failed load completes with fallback
									</Text>
									<DemoMediaFrame>
										<Reveal.Image
											src="/test/missing-motion-image.png"
											alt="Unavailable abstract"
											fill
											sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
											loadStrategy="wait-for-load"
											className="w-full"
											contentClassName="aspect-[4/3] w-full overflow-hidden"
											imageClassName="object-cover"
											fallback={
												<div className="grid h-full place-items-center bg-background p-4 text-center">
													<Text variant="caption" tone="muted">
														Image unavailable
													</Text>
												</div>
											}
										/>
									</DemoMediaFrame>
								</div>
							</div>
						);
					},
				},
				{
					id: "reveal-text",
					kind: "component",
					name: "Reveal.Text",
					label: "Character stagger text",
					related: relatedMap["Reveal.Text"],
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<Reveal.Text as="h3" variant="headingSm">
									Character reveals run as one scheduled reveal item.
								</Reveal.Text>
								<Reveal.Item>
									<Text variant="body" tone="muted">
										Use it for short headlines or callouts that should feel more
										deliberate than a plain line fade.
									</Text>
								</Reveal.Item>
							</div>
						);
					},
				},
				{
					id: "reveal-highlight-text",
					kind: "component",
					name: "Reveal.Highlight",
					label: "Substring highlight reveal",
					related: relatedMap["Reveal.Highlight"],
					Render() {
						return (
							<div className="space-y-3">
								<Reveal.Highlight
									as="h3"
									variant="headingSm"
									highlight="primary signal"
								>
									Reveal one primary signal inside a longer line.
								</Reveal.Highlight>
								<Reveal.Highlight
									as="p"
									variant="body"
									tone="muted"
									highlight="LTR + RTL"
								>
									Mixed direction copy keeps LTR + RTL text stable.
								</Reveal.Highlight>
							</div>
						);
					},
				},
				{
					id: "reveal-numeric",
					kind: "component",
					name: "Reveal.Number",
					label: "Stats count-up",
					related: relatedMap["Reveal.Number"],
					Render() {
						return <RevealNumericStatsDemo />;
					},
				},
				{
					id: "letter-wave",
					kind: "component",
					name: "LetterWave",
					label: "Hover wave text",
					related: relatedMap.LetterWave,
					Render() {
						return (
							<div className="group w-fit space-y-2">
								<LetterWave as="span" variant="headingXs">
									Hover to send the wave across the label.
								</LetterWave>
								<Text variant="caption" tone="muted">
									Pair it with a parent <code>group</code> container.
								</Text>
							</div>
						);
					},
				},
				{
					id: "auto-cycle",
					kind: "component",
					name: "AutoCycle",
					label: "Auto-cycling active item",
					related: relatedMap.AutoCycle,
					Render() {
						return <AutoCycleDemo />;
					},
				},
				{
					id: "use-touch-screen",
					kind: "component",
					name: "useTouchScreen",
					label: "Pointer capability hook",
					related: relatedMap.useTouchScreen,
					Render() {
						return <TouchScreenStatusDemo />;
					},
				},
				{
					id: "reveal-image-group",
					kind: "component",
					name: "Reveal.Image + Reveal.Sequence",
					label: "Image-driven stagger",
					related: relatedMap["Reveal.Image"],
					Render() {
						const [imageSrc, setImageSrc] = useState("/test/blob.png");
						const [imageReady, setImageReady] = useState(false);

						return (
							<div className="flex flex-col gap-3">
								<div className="flex flex-wrap gap-2">
									<Button
										size="sm"
										variant="primary"
										onClick={() => setImageSrc("/test/blob.png")}
									>
										Blob
									</Button>
									<Button
										size="sm"
										variant="secondary"
										onClick={() => setImageSrc("/test/mercury.png")}
									>
										Mercury
									</Button>
								</div>
								<DemoMediaFrame>
									<Reveal.Image
										key={imageSrc}
										src={imageSrc}
										alt="Image-driven reveal"
										fill
										sizes="(min-width: 768px) 50vw, 100vw"
										className="w-full"
										contentClassName="aspect-[4/3] w-full overflow-hidden"
										imageClassName="object-cover"
										onRevealStateChange={setImageReady}
									/>
								</DemoMediaFrame>
								{imageReady ? (
									<Reveal.Sequence
										className="flex flex-col gap-2"
										stagger={0.16}
									>
										<Reveal.Item>
											<Text variant="bodyStrong">
												Caption appears after reveal
											</Text>
										</Reveal.Item>
										<Reveal.Item>
											<Text variant="body" tone="muted">
												Conditional content remains caller-owned.
											</Text>
										</Reveal.Item>
									</Reveal.Sequence>
								) : null}
							</div>
						);
					},
				},
				{
					id: "nested-reveal-sequence",
					kind: "component",
					name: "Reveal.Sequence",
					label: "Nested structural sequencing",
					related: relatedMap["Reveal.Sequence"],
					Render() {
						const [imageSrc, setImageSrc] = useState("/test/blob.png");

						return (
							<div className="flex flex-col gap-3">
								<div className="flex flex-wrap gap-2">
									<Button
										size="sm"
										variant="primary"
										onClick={() => setImageSrc("/test/blob.png")}
									>
										Blob
									</Button>
									<Button
										size="sm"
										variant="secondary"
										onClick={() => setImageSrc("/test/mercury.png")}
									>
										Mercury
									</Button>
								</div>
								<Reveal.Sequence key={imageSrc} className="flex flex-col gap-3">
									<DemoMediaFrame>
										<Reveal.Image
											src={imageSrc}
											alt="Structural sequence image"
											fill
											sizes="(min-width: 768px) 50vw, 100vw"
											loadStrategy="wait-for-load"
											className="w-full"
											contentClassName="aspect-[4/3] w-full overflow-hidden"
											imageClassName="object-cover"
										/>
									</DemoMediaFrame>
									<Reveal.Sequence
										className="flex flex-col gap-2"
										stagger={0.16}
									>
										<Reveal.Item>
											<Text variant="headingSm">
												Nested content keeps its own relative stagger.
											</Text>
										</Reveal.Item>
										<Reveal.Item>
											<Text variant="body" tone="muted">
												The outer sequence schedules each structural boundary.
											</Text>
										</Reveal.Item>
									</Reveal.Sequence>
									<Text variant="bodyStrong" as="span">
										<Reveal.Scramble
											text="Accent copy participates in structural order."
											maintainSpace
										/>
									</Text>
									<Reveal.Sequence className="flex gap-2" stagger={0.12}>
										<Reveal.Item>
											<Chip>Scene</Chip>
										</Reveal.Item>
										<Reveal.Item>
											<Chip>Unlocked</Chip>
										</Reveal.Item>
									</Reveal.Sequence>
								</Reveal.Sequence>
							</div>
						);
					},
				},
				{
					id: "scramble-reveal",
					kind: "component",
					name: "Reveal.Scramble",
					label: "Text scramble",
					related: relatedMap["Reveal.Scramble"],
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<Text variant="bodyStrong" as="span">
									<Reveal.Scramble
										text="Signal decoding in progress"
										maintainSpace
									/>
								</Text>
								<Text variant="body" as="span">
									<Reveal.Scramble
										text="Secondary line with delay"
										delay={0.1}
										maintainSpace
									/>
								</Text>
							</div>
						);
					},
				},
				{
					id: "scroll-highlight-text",
					kind: "component",
					name: "Scroll.Highlight",
					label: "Scroll-driven text emphasis",
					related: relatedMap["Scroll.Highlight"],
					Render() {
						return (
							<div className="grid gap-4">
								<div className="space-y-2">
									<Text variant="caption" tone="muted">
										Scroll character emphasis
									</Text>
									<Text variant="headingSm" as="h3">
										<Scroll.Highlight
											className="text-foreground"
											highlightRange={[0.12, 0.9]}
										>
											Clarity arrives as the section lands.
										</Scroll.Highlight>
									</Text>
								</div>
								<div className="space-y-2">
									<Text variant="caption" tone="muted">
										Viewport color emphasis
									</Text>
									<Text variant="headingSm" as="h3">
										<Scroll.Highlight
											baseColor={scrollHighlightBaseColor}
											targetColor={scrollHighlightTargetColor}
											variant="viewport"
											viewportAmount={0.62}
										>
											Viewport state can drive one clean color transition.
										</Scroll.Highlight>
									</Text>
								</div>
							</div>
						);
					},
				},
				{
					id: "scroll-lag",
					kind: "component",
					name: "Scroll.Lag",
					label: "Scroll lag",
					related: relatedMap["Scroll.Lag"],
					Render() {
						return (
							<Panel
								background="surface"
								border="subtle"
								padding="xs"
								radius="sm"
								shadow="none"
							>
								<Scroll.Lag>
									<Text variant="bodyStrong">Scroll.Lag</Text>
								</Scroll.Lag>
							</Panel>
						);
					},
				},
				{
					id: "scroll-width",
					kind: "component",
					name: "Scroll.Width",
					label: "Scroll-driven frame reveal",
					related: relatedMap["Scroll.Width"],
					Render() {
						return (
							<div className="space-y-3">
								<Text variant="body" tone="muted">
									The side masks open up as the card crosses the viewport.
								</Text>
								<div className="min-h-[18rem]">
									<Scroll.Width
										className="h-64 w-full"
										frameClassName="border border-border/10 bg-surface/70"
										contentClassName="rounded-[inherit] bg-linear-to-br from-surface via-surface/90 to-surface-secondary/70"
										coverClassName="bg-background"
										startInset={112}
										endInset={0}
										startRadius={{ tl: 40, tr: 40, br: 24, bl: 24 }}
										endRadius={{ tl: 24, tr: 24, br: 24, bl: 24 }}
										progressRange={[0.1, 0.8]}
									>
										<div className="flex h-full flex-col justify-end gap-2 p-6">
											<Text variant="headingSm">Scroll.Width</Text>
											<Text variant="body" tone="muted">
												Use it for cards or media where the frame should open
												progressively instead of snapping full width.
											</Text>
										</div>
									</Scroll.Width>
								</div>
							</div>
						);
					},
				},
				{
					id: "scroll-parallax",
					kind: "component",
					name: "Scroll.Parallax",
					label: "Scroll parallax",
					related: relatedMap["Scroll.Parallax"],
					Render() {
						return (
							<Panel
								background="surface"
								border="subtle"
								padding="xs"
								radius="sm"
								shadow="none"
							>
								<Scroll.Parallax magnitude={50}>
									<Text variant="bodyStrong">Parallax</Text>
								</Scroll.Parallax>
							</Panel>
						);
					},
				},
			],
		},
	],
};
