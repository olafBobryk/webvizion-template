"use client";

import { useState } from "react";
import { MotionScope } from "@/components/ui/foundations/MotionProvider";
import type { MotionMoment } from "@/components/ui/foundations/motionTiming";
import * as Reveal from "@/components/ui/motion/reveal";
import { Button } from "@/components/ui/primitives/Button";
import { Card, Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import {
	InternalPage,
	InternalPageHeader,
} from "../../_components/InternalPage";

const colorBlocks = ["bg-red-500", "bg-sky-500", "bg-emerald-500"];
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
			<Card.Header>
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
			background="panel"
			border="subtle"
			gap="sm"
			padding="sm"
			radius="float"
			elevation="panel"
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
			radius="float"
			elevation="card"
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

	return (
		<QaCard
			title="Reveal API"
			code="<Reveal.Sequence><Reveal.Item /></Reveal.Sequence>"
			expected="Global participants and nested sequences share one application scheduler."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Replay sequence
			</Button>
			<div key={runId} className="grid gap-4 xl:grid-cols-2">
				<Reveal.Item>
					<PreviewPanel>
						<Text as="h3" variant="headingXs">
							Reveal.Item
						</Text>
						<Text variant="body" tone="muted">
							Standalone content joins the global scheduler.
						</Text>
					</PreviewPanel>
				</Reveal.Item>
				<Reveal.Sequence className="grid gap-3">
					<Reveal.Item>
						<PreviewPanel>
							<Text as="h3" variant="headingXs">
								Reveal.Sequence
							</Text>
							<Text variant="body" tone="muted">
								Children stagger relative to one scheduled boundary.
							</Text>
						</PreviewPanel>
					</Reveal.Item>
				</Reveal.Sequence>
				<PreviewPanel>
					<Reveal.Text as="div" variant="bodyStrong">
						Reveal.Text character stagger
					</Reveal.Text>
				</PreviewPanel>
				<PreviewPanel>
					<Text variant="bodyStrong" as="span">
						<Reveal.Scramble
							text="Reveal.Scramble resolves text"
							maintainSpace
						/>
					</Text>
				</PreviewPanel>
				<Panel
					background="panel"
					border="subtle"
					overflow="hidden"
					padding="none"
					radius="float"
					elevation="panel"
				>
					<Reveal.Image
						src="/test/placeholder-portrait.jpg"
						alt="Reveal image demo"
						fill
						sizes="(min-width: 1280px) 50vw, 100vw"
						className="w-full"
						contentClassName="aspect-[4/3] w-full overflow-hidden"
						imageClassName="object-cover"
					/>
				</Panel>
				<Reveal.Sequence
					className="grid gap-3 xl:col-span-2 sm:grid-cols-3"
					stagger={0.18}
				>
					{colorBlocks.map((className, index) => (
						<Reveal.Item key={className}>
							<ColorBlock
								className={className}
								label={`Reveal.Sequence ${index + 1}`}
							/>
						</Reveal.Item>
					))}
				</Reveal.Sequence>
			</div>
		</QaCard>
	);
}

function RevealNumericStatsQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="Reveal Numeric Stats"
			code='<Reveal.Number animation="countUp" />'
			expected="Number effects participate directly in the nearest sequence."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Reset stats
			</Button>
			<Reveal.Sequence
				key={runId}
				className="grid gap-3 sm:grid-cols-2"
				stagger={0.12}
			>
				{numericStats.map((stat) => (
					<Reveal.Item key={stat.label}>
						<PreviewPanel className="flex min-h-32 flex-col justify-between">
							<Reveal.Number
								animation="countUp"
								as="p"
								className="m-0 text-4xl font-semibold leading-none tracking-normal tabular-nums text-foreground sm:text-5xl"
								data-motion-numeric-value={stat.value}
								text={stat.value}
							/>
							<Text variant="caption" tone="muted" className="mt-3 block">
								{stat.label}
							</Text>
						</PreviewPanel>
					</Reveal.Item>
				))}
			</Reveal.Sequence>
		</QaCard>
	);
}

function NestedSequenceQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="Nested Sequences"
			code="<Reveal.Sequence><Reveal.Sequence /></Reveal.Sequence>"
			expected="A nested sequence enters its parent once, then staggers its own children."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Replay nesting
			</Button>
			<Reveal.Sequence
				key={runId}
				className="grid gap-3 sm:grid-cols-2"
				stagger={0.16}
			>
				<Reveal.Item>
					<ColorBlock className="bg-red-500" label="outer child" />
				</Reveal.Item>
				<Reveal.Sequence className="grid gap-3" stagger={0.12}>
					<Reveal.Item>
						<ColorBlock className="bg-red-500" label="group child 1" />
					</Reveal.Item>
					<Reveal.Item>
						<ColorBlock className="bg-sky-500" label="group child 2" />
					</Reveal.Item>
					<Reveal.Item>
						<ColorBlock className="bg-emerald-500" label="group child 3" />
					</Reveal.Item>
				</Reveal.Sequence>
			</Reveal.Sequence>
		</QaCard>
	);
}

function LateMountSequenceQa() {
	const [showLateItem, setShowLateItem] = useState(false);

	return (
		<QaCard
			title="Late-mounted Participant"
			code="{ready ? <Reveal.Item /> : null}"
			expected="A participant mounted after its sequence starts forms a new local batch."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setShowLateItem((current) => !current)}
			>
				{showLateItem ? "Remove late item" : "Mount late item"}
			</Button>
			<Reveal.Sequence className="grid gap-3" stagger={0.2}>
				<Reveal.Item>
					<ColorBlock className="bg-violet-600" label="initial item" />
				</Reveal.Item>
				{showLateItem ? (
					<Reveal.Item>
						<ColorBlock className="bg-fuchsia-500" label="late item" />
					</Reveal.Item>
				) : null}
			</Reveal.Sequence>
		</QaCard>
	);
}

function StructuralSequenceQa() {
	const [runId, setRunId] = useState(0);

	return (
		<QaCard
			title="Structural Sequence"
			code="<Reveal.Sequence><Reveal.Image /><Reveal.Sequence /></Reveal.Sequence>"
			expected="Each nested boundary keeps relative ordering without arbitrary dependency strings."
		>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setRunId((current) => current + 1)}
			>
				Replay structure
			</Button>
			<Reveal.Sequence key={runId} stagger={0.18}>
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
					<Panel
						background="panel"
						border="subtle"
						overflow="hidden"
						padding="none"
						radius="float"
						elevation="panel"
					>
						<Reveal.Image
							src="/test/placeholder-square.jpg"
							alt="Structural sequence media"
							fill
							sizes="(min-width: 1024px) 50vw, 100vw"
							loadStrategy="wait-for-load"
							className="w-full"
							contentClassName="aspect-[4/3] w-full overflow-hidden"
							imageClassName="object-cover"
						/>
					</Panel>
					<div className="flex flex-col gap-4">
						<Reveal.Sequence className="grid gap-3" stagger={0.18}>
							<Reveal.Item>
								<ColorBlock className="bg-cyan-400" label="content 1" />
							</Reveal.Item>
							<Reveal.Item>
								<ColorBlock className="bg-blue-600" label="content 2" />
							</Reveal.Item>
						</Reveal.Sequence>
						<Text variant="bodyStrong" as="span">
							<Reveal.Scramble
								text="Accent joins the structural sequence."
								maintainSpace
							/>
						</Text>
					</div>
				</div>
			</Reveal.Sequence>
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
			<Reveal.Sequence className="grid gap-3 md:grid-cols-3">
				{colorBlocks.map((className, index) => (
					<Reveal.Item key={className}>
						<ColorBlock
							className={className}
							label={`immediate ${index + 1}`}
						/>
					</Reveal.Item>
				))}
			</Reveal.Sequence>
		</QaCard>
	);
}

export default function MotionPlaygroundPage() {
	return (
		<InternalPage maxWidth="wide" className="gap-8">
			<InternalPageHeader
				title="Motion system QA"
				description="Checks scoped timing, global reveal batches, structural sequences, and automation mode."
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
				<NestedSequenceQa />
				<LateMountSequenceQa />
				<StructuralSequenceQa />
				<DisabledModeQa />
			</div>
		</InternalPage>
	);
}
