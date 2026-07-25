"use client";

import { useState } from "react";
import type { MotionMoment } from "@/components/ui/foundations/motionTiming";
import { MotionScope, Reveal } from "@/components/ui/motion";
import { RevealGroup, RevealGroupItem } from "@/components/ui/motion/reveal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import {
	InternalPage,
	InternalPageHeader,
} from "../../_components/InternalPage";

const colorBlocks = ["bg-red-500", "bg-sky-500", "bg-emerald-500"];
const numericStartStage = "motion-playground-numeric-start";

const numericStats = [
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

const characterCases = [
	{
		label: "Productive",
		expressive: -1,
		description: "Shortest scoped reveal timing.",
	},
	{
		label: "Neutral",
		expressive: 0,
		description: "Template default timing.",
	},
	{
		label: "Expressive",
		expressive: 1,
		description: "Longest scoped reveal timing.",
	},
];

const momentCases = [
	{ moment: "feedback", label: "Feedback" },
	{ moment: "interaction", label: "Interaction" },
	{ moment: "disclosure", label: "Disclosure" },
	{ moment: "overlay", label: "Overlay" },
	{ moment: "reveal", label: "Reveal" },
	{ moment: "ambient", label: "Ambient" },
	{ moment: "scroll", label: "Scroll" },
] as const satisfies ReadonlyArray<{
	moment: MotionMoment;
	label: string;
}>;

function MotionTravelTrack({
	active,
	motionClassName = "motion-reveal",
}: {
	active: boolean;
	motionClassName?: string;
}) {
	return (
		<div className="relative h-14 w-full overflow-hidden rounded-lg bg-foreground/5">
			<div
				aria-hidden="true"
				className={[
					"absolute top-2 size-10 rounded-lg bg-primary transition-[left,rotate]",
					motionClassName,
					active ? "left-[calc(100%-3rem)] rotate-6" : "left-2 rotate-0",
				].join(" ")}
				data-motion-travel-box=""
			/>
		</div>
	);
}

function QaCard({
	title,
	code,
	expected,
	children,
}: {
	title: string;
	code: string;
	expected: string;
	children: React.ReactNode;
}) {
	return (
		<Card>
			<Card.Header className="border-b">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Card.Title>{title}</Card.Title>
					<code className="rounded-md bg-foreground/5 px-3 py-1.5 text-xs text-foreground">
						{code}
					</code>
				</div>
				<Card.Description>{expected}</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-4">{children}</Card.Content>
		</Card>
	);
}

function PreviewPanel({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Panel
			background="surface"
			border="subtle"
			gap="sm"
			padding="sm"
			radius="sm"
			shadow="none"
			className={className}
		>
			{children}
		</Panel>
	);
}

function ColorBlock({
	className,
	label,
}: {
	className: string;
	label: string;
}) {
	return (
		<Panel
			background="transparent"
			border="subtle"
			padding="sm"
			radius="sm"
			shadow="sm"
			className={`flex min-h-28 items-end ${className}`}
		>
			<span className="rounded bg-background/85 px-2 py-1 text-xs font-medium text-foreground">
				{label}
			</span>
		</Panel>
	);
}

function MotionCharacterQa() {
	const [expanded, setExpanded] = useState(false);

	return (
		<QaCard
			title="Motion Character"
			code="<MotionScope expressive={...}>"
			expected="Run the comparison: productive resolves fastest, neutral sits in the middle, expressive lingers longest."
		>
			<Button
				size="sm"
				variant={expanded ? "primary" : "secondary"}
				onClick={() => setExpanded((current) => !current)}
			>
				Run comparison
			</Button>
			<div className="grid gap-3 md:grid-cols-3">
				{characterCases.map((item) => (
					<MotionScope key={item.label} expressive={item.expressive}>
						<PreviewPanel className="flex flex-col gap-3">
							<div className="flex flex-col gap-1">
								<Text variant="bodyStrong">{item.label}</Text>
								<Text variant="caption" tone="muted">
									{item.description}
								</Text>
							</div>
							<div className="h-4 overflow-hidden rounded-full bg-foreground/10">
								<div
									className={[
										"h-full rounded-full bg-primary transition-[width,background-color] motion-reveal",
										expanded ? "w-full" : "w-8",
									].join(" ")}
								/>
							</div>
							<MotionTravelTrack active={expanded} />
						</PreviewPanel>
					</MotionScope>
				))}
			</div>
		</QaCard>
	);
}

function TimingMomentsQa() {
	const [active, setActive] = useState(false);

	return (
		<QaCard
			title="Timing Moments"
			code="motion-{moment}"
			expected="Every moment travels the same distance; only timing and easing should differ."
		>
			<Button
				size="sm"
				variant={active ? "primary" : "secondary"}
				onClick={() => setActive((current) => !current)}
			>
				Replay moments
			</Button>
			<div className="grid gap-3 md:grid-cols-2">
				{momentCases.map((item) => (
					<PreviewPanel key={item.moment}>
						<div className="grid gap-3">
							<div className="flex flex-col gap-1">
								<Text variant="bodyStrong">{item.label}</Text>
								<Text variant="caption" tone="muted">
									{item.moment}
								</Text>
							</div>
							<MotionTravelTrack
								active={active}
								motionClassName={`motion-${item.moment}`}
							/>
						</div>
					</PreviewPanel>
				))}
			</div>
		</QaCard>
	);
}

function RevealApiQa() {
	const [runId, setRunId] = useState(0);
	const [active, setActive] = useState(true);

	return (
		<QaCard
			title="Reveal API"
			code="<Reveal.Root><Reveal.List><Reveal.Item />"
			expected="The public namespace demos Root, Scene, Item, List, Image, Text, and Scramble from one import."
		>
			<div className="flex flex-wrap gap-2">
				<Button
					size="sm"
					variant="secondary"
					onClick={() => setRunId((current) => current + 1)}
				>
					Reset root
				</Button>
				<Button
					size="sm"
					variant={active ? "primary" : "secondary"}
					onClick={() => setActive((current) => !current)}
				>
					{active ? "Close active gate" : "Open active gate"}
				</Button>
			</div>
			<Reveal.Root>
				<div key={runId} className="grid gap-4 xl:grid-cols-2">
					<Reveal.Item useViewport={false}>
						<PreviewPanel>
							<Text as="h3" variant="headingXs">
								Reveal.Root
							</Text>
							<Text variant="body" tone="muted">
								The resettable scheduler wraps this whole demo.
							</Text>
						</PreviewPanel>
					</Reveal.Item>
					<Reveal.Scene>
						<Reveal.Item useViewport={false}>
							<PreviewPanel>
								<Text as="h3" variant="headingXs">
									Reveal.Scene
								</Text>
								<Text variant="body" tone="muted">
									Scene context is available for staged children.
								</Text>
							</PreviewPanel>
						</Reveal.Item>
					</Reveal.Scene>
					<Reveal.Item useViewport={false}>
						<PreviewPanel>
							<Text as="h3" variant="headingXs">
								Reveal.Item
							</Text>
							<Text variant="body" tone="muted">
								Standalone root-scheduled content.
							</Text>
						</PreviewPanel>
					</Reveal.Item>
					<PreviewPanel>
						<Reveal.Text as="div" variant="bodyStrong" useViewport={false}>
							Reveal.Text character stagger
						</Reveal.Text>
					</PreviewPanel>
					<PreviewPanel>
						<Text variant="bodyStrong" as="span">
							<Reveal.Scramble
								text="Reveal.Scramble resolves text"
								maintainSpace
								useViewport={false}
							/>
						</Text>
					</PreviewPanel>
					<Panel
						background="surface"
						border="subtle"
						overflow="hidden"
						padding="none"
						radius="sm"
						shadow="none"
					>
						<Reveal.Image
							src="/test/blob.png"
							alt="Reveal image demo"
							fill
							sizes="(min-width: 1280px) 50vw, 100vw"
							className="w-full"
							useViewport={false}
							contentClassName="aspect-[4/3] w-full overflow-hidden"
							imageClassName="object-cover"
						/>
					</Panel>
					<Reveal.List
						active={active}
						className="grid gap-3 xl:col-span-2 sm:grid-cols-3"
						stagger={0.18}
					>
						{colorBlocks.map((className, index) => (
							<Reveal.Item key={className} useViewport={false}>
								<ColorBlock
									className={className}
									label={`Reveal.List ${index + 1}`}
								/>
							</Reveal.Item>
						))}
					</Reveal.List>
				</div>
			</Reveal.Root>
		</QaCard>
	);
}

function RevealNumericStatsQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="Reveal Numeric Stats"
			code='<Reveal.Numeric animation="countUp" />'
			expected="Stats enter through a Reveal.List, then each value counts after the list start stage."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Reset stats
			</Button>
			<Reveal.Root key={runId}>
				<Reveal.Scene>
					<Reveal.List
						className="grid gap-3 sm:grid-cols-2"
						stagger={0.12}
						unlockOnStartStage={numericStartStage}
						viewportAmount={0.08}
					>
						{numericStats.map((stat) => (
							<Reveal.Item key={stat.label}>
								<PreviewPanel className="flex min-h-32 flex-col justify-between">
									<Reveal.Numeric
										animation="countUp"
										as="p"
										className="m-0 text-4xl font-semibold leading-none tracking-normal tabular-nums text-foreground sm:text-5xl"
										data-motion-numeric-value={stat.value}
										text={stat.value}
										useViewport={false}
										waitFor={numericStartStage}
									/>
									<Text variant="caption" tone="muted" className="mt-3 block">
										{stat.label}
									</Text>
								</PreviewPanel>
							</Reveal.Item>
						))}
					</Reveal.List>
				</Reveal.Scene>
			</Reveal.Root>
		</QaCard>
	);
}

function RevealGroupCompatibilityQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="RevealGroup Alias"
			code="<RevealGroup>"
			expected="The compatibility boundary export schedules once through the root while its wrapper stays visually stable."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Reset group
			</Button>
			<Reveal.Root key={runId}>
				<RevealGroup className="grid gap-3 sm:grid-cols-3" stagger={0.16}>
					<RevealGroupItem>
						<ColorBlock className="bg-red-500" label="group child 1" />
					</RevealGroupItem>
					<RevealGroupItem>
						<ColorBlock className="bg-sky-500" label="group child 2" />
					</RevealGroupItem>
					<RevealGroupItem>
						<ColorBlock className="bg-emerald-500" label="group child 3" />
					</RevealGroupItem>
				</RevealGroup>
			</Reveal.Root>
		</QaCard>
	);
}

function RevealGroupItemCompatibilityQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="RevealGroupItem Alias"
			code="<RevealGroupItem>"
			expected="The compatibility child export joins its nearest RevealGroup queue and falls back to root scheduling outside a group."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Reset items
			</Button>
			<Reveal.Root key={runId}>
				<div className="grid gap-4 xl:grid-cols-2">
					<RevealGroup className="grid gap-3" stagger={0.2}>
						<RevealGroupItem>
							<ColorBlock className="bg-violet-600" label="inside group 1" />
						</RevealGroupItem>
						<RevealGroupItem>
							<ColorBlock className="bg-fuchsia-500" label="inside group 2" />
						</RevealGroupItem>
					</RevealGroup>
					<RevealGroupItem>
						<ColorBlock className="bg-stone-500" label="fallback item" />
					</RevealGroupItem>
				</div>
			</Reveal.Root>
		</QaCard>
	);
}

function SceneGateQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="Scene Gates"
			code="<Reveal.Scene after unlock>"
			expected="Media unlocks content, content unlocks the accent. The sequence should read image, blocks, then scramble."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Reset gates
			</Button>
			<Reveal.Root key={runId}>
				<Reveal.Scene>
					<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
						<Panel
							background="surface"
							border="subtle"
							overflow="hidden"
							padding="none"
							radius="sm"
							shadow="none"
						>
							<Reveal.Image
								src="/test/mercury.png"
								alt="Motion scene media"
								fill
								sizes="(min-width: 1024px) 50vw, 100vw"
								loadStrategy="wait-for-load"
								after="app"
								unlock="media"
								className="w-full"
								contentClassName="aspect-[4/3] w-full overflow-hidden"
								imageClassName="object-cover"
							/>
						</Panel>
						<div className="flex flex-col gap-4">
							<Reveal.List
								after="media"
								unlock="content"
								className="grid gap-3"
								stagger={0.18}
							>
								<Reveal.Item>
									<ColorBlock className="bg-cyan-400" label="content 1" />
								</Reveal.Item>
								<Reveal.Item>
									<ColorBlock className="bg-blue-600" label="content 2" />
								</Reveal.Item>
							</Reveal.List>
							<Text variant="bodyStrong" as="span">
								<Reveal.Scramble
									text="Accent waits for content."
									after="content"
									maintainSpace
								/>
							</Text>
						</div>
					</div>
				</Reveal.Scene>
			</Reveal.Root>
		</QaCard>
	);
}

function DisabledModeQa() {
	return (
		<QaCard
			title="Disabled Mode"
			code="?motion=off&reveal=off"
			expected="With the automation query, these blocks should render immediately with no hidden transform state."
		>
			<Reveal.Root disabled>
				<Reveal.List className="grid gap-3 md:grid-cols-3" active={false}>
					{colorBlocks.map((className, index) => (
						<Reveal.Item key={className}>
							<ColorBlock
								className={className}
								label={`immediate ${index + 1}`}
							/>
						</Reveal.Item>
					))}
				</Reveal.List>
			</Reveal.Root>
		</QaCard>
	);
}

export default function MotionPlaygroundPage() {
	return (
		<InternalPage maxWidth="wide" className="gap-8">
			<InternalPageHeader
				title="Motion system QA"
				description="Checks for scoped motion character, timing, reveal primitives, scene gates, and automation mode."
				action={
					<Button
						href="/internal/playground"
						size="sm"
						variant="ghost"
						className="w-fit"
					>
						Back to playground
					</Button>
				}
			/>

			<div className="grid w-full items-start gap-5 xl:grid-cols-2">
				<MotionCharacterQa />
				<TimingMomentsQa />
				<RevealApiQa />
				<RevealNumericStatsQa />
				<RevealGroupCompatibilityQa />
				<RevealGroupItemCompatibilityQa />
				<SceneGateQa />
				<DisabledModeQa />
			</div>
		</InternalPage>
	);
}
