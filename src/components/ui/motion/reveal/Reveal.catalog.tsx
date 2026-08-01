"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { Panel } from "../../primitives/surfaces";
import { Text } from "../../primitives/Text";
import * as Reveal from "./index";

const showcaseStats = [
	{ label: "Signals grouped", value: "128+" },
	{ label: "Iteration speed", value: "5x" },
	{ label: "Coverage range", value: "300%" },
	{ label: "Review window", value: "24/7" },
] as const;
function StorySurface({
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
function FamilyShowcase() {
	const [runId, setRunId] = useState(0);

	return (
		<main className="min-h-screen bg-background p-5 text-foreground sm:p-8 lg:p-12">
			<div className="mx-auto grid max-w-6xl gap-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Family showcase
						</Text>
						<Text variant="bodyStrong">
							One scheduler, nested structural boundaries, seven public owners
						</Text>
					</div>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => setRunId((current) => current + 1)}
					>
						Replay choreography
					</Button>
				</div>

				<Reveal.Sequence key={runId} className="grid gap-5" stagger={0.16}>
					<div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
						<Reveal.Sequence
							className="flex min-h-[28rem] flex-col justify-center gap-5 rounded-2xl border border-foreground/10 bg-card p-6 sm:p-9"
							stagger={0.12}
						>
							<Reveal.Text as="h1" variant="headingPage">
								Motion should reveal the hierarchy.
							</Reveal.Text>
							<Reveal.Highlight
								as="p"
								variant="headingXs"
								highlight="one coordinated scene"
							>
								Compose every entrance as one coordinated scene.
							</Reveal.Highlight>
							<Reveal.Item>
								<Text tone="muted" className="max-w-xl">
									A Sequence joins the global scheduler once, then owns the
									relative order of its Item, Text, Highlight, Scramble, Number,
									and Image participants.
								</Text>
							</Reveal.Item>
							<Reveal.Sequence className="flex flex-wrap gap-2" stagger={0.08}>
								<Reveal.Item>
									<Button variant="primary">Primary action</Button>
								</Reveal.Item>
								<Reveal.Item>
									<Button variant="ghost">Secondary path</Button>
								</Reveal.Item>
							</Reveal.Sequence>
						</Reveal.Sequence>

						<Panel
							background="panel"
							border="subtle"
							overflow="hidden"
							padding="none"
							radius="panel"
							elevation="panel"
							className="min-h-[28rem]"
						>
							<Reveal.Image
								src="/test/placeholder-square.jpg"
								alt="Charcoal and coral shapes in the Reveal family showcase"
								fill
								sizes="(min-width: 1024px) 45vw, 100vw"
								loadStrategy="wait-for-load"
								revealVariant="corner-clip"
								revealOrigin="bottom-left"
								revealFinalRadius={24}
								contentClassName="h-full min-h-[28rem]"
								imageClassName="object-cover"
								overlay={
									<Panel
										background="page"
										border="subtle"
										gap="none"
										padding="sm"
										radius="float"
										elevation="card"
										className="absolute inset-x-4 bottom-4 bg-background/85 backdrop-blur-sm"
									>
										<Text variant="bodyStrong">Image owns its reveal mask</Text>
										<Text variant="caption" tone="muted" className="mt-1 block">
											Overlay content stays inside the same clip boundary.
										</Text>
									</Panel>
								}
							/>
						</Panel>
					</div>

					<Reveal.Sequence
						className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
						stagger={0.1}
					>
						{showcaseStats.map((stat) => (
							<StorySurface
								key={stat.label}
								className="min-h-32 justify-between"
							>
								<Reveal.Number
									animation="countUp"
									as="p"
									className="m-0 text-4xl font-semibold leading-none tabular-nums"
									text={stat.value}
								/>
								<Text variant="caption" tone="muted">
									{stat.label}
								</Text>
							</StorySurface>
						))}
					</Reveal.Sequence>

					<StorySurface>
						<Text variant="caption" tone="muted">
							Scramble participates directly in the same structural order
						</Text>
						<Reveal.Scramble
							text="A stable final string remains available to assistive technology."
							textVariant="bodyStrong"
							maintainSpace
						/>
					</StorySurface>
				</Reveal.Sequence>
			</div>
		</main>
	);
}
function SequenceOwnershipHarness() {
	const [runId, setRunId] = useState(0);
	const [showLateItem, setShowLateItem] = useState(false);

	return (
		<div className="grid max-w-4xl gap-4">
			<div className="flex flex-wrap gap-2">
				<Button
					size="sm"
					variant="secondary"
					onClick={() => setRunId((current) => current + 1)}
				>
					Replay nesting
				</Button>
				<Button
					size="sm"
					variant="ghost"
					onClick={() => setShowLateItem((current) => !current)}
				>
					{showLateItem ? "Remove late item" : "Mount late item"}
				</Button>
			</div>

			<Reveal.Sequence
				key={runId}
				className="grid gap-3 md:grid-cols-2"
				stagger={0.14}
			>
				<Reveal.Item>
					<StorySurface className="min-h-32 justify-end bg-primary/10">
						<Text variant="bodyStrong">Outer child</Text>
					</StorySurface>
				</Reveal.Item>
				<Reveal.Sequence className="grid gap-3" stagger={0.1}>
					{["Nested child one", "Nested child two", "Nested child three"].map(
						(label) => (
							<Reveal.Item key={label}>
								<StorySurface>
									<Text>{label}</Text>
								</StorySurface>
							</Reveal.Item>
						),
					)}
					{showLateItem ? (
						<Reveal.Item>
							<StorySurface className="border-primary/40 bg-primary/10">
								<Text variant="bodyStrong">Late-mounted child</Text>
							</StorySurface>
						</Reveal.Item>
					) : null}
				</Reveal.Sequence>
			</Reveal.Sequence>
		</div>
	);
}
function InteractionHandoffHarness() {
	const [activationCount, setActivationCount] = useState(0);

	return (
		<div className="grid max-w-lg gap-3">
			<Reveal.Item asChild handoffAfterReveal deferInteractionUntilRevealed>
				<Button
					variant="primary"
					onClick={() => setActivationCount((current) => current + 1)}
				>
					Activate after reveal
				</Button>
			</Reveal.Item>
			<Text aria-live="polite" variant="caption" tone="muted">
				Activations: {activationCount}
			</Text>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => <FamilyShowcase />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid max-w-6xl gap-4 md:grid-cols-2">
			<StorySurface>
				<Text variant="bodyStrong">Ignore image load</Text>
				<Text variant="caption" tone="muted">
					The scheduler does not wait for the asset.
				</Text>
				<Reveal.Image
					src="/test/placeholder-portrait.jpg"
					alt="Abstract blue portrait revealed without a load gate"
					fill
					loading="eager"
					sizes="(min-width: 768px) 50vw, 100vw"
					contentClassName="aspect-[4/3] overflow-hidden rounded-lg"
					imageClassName="object-cover"
				/>
			</StorySurface>
			<StorySurface>
				<Text variant="bodyStrong">Wait for image load</Text>
				<Text variant="caption" tone="muted">
					The participant becomes ready only after the image resolves.
				</Text>
				<Reveal.Image
					src="/test/placeholder-square.jpg"
					alt="Charcoal and coral shapes revealed after loading"
					fill
					sizes="(min-width: 768px) 50vw, 100vw"
					loadStrategy="wait-for-load"
					contentClassName="aspect-[4/3] overflow-hidden rounded-lg"
					imageClassName="object-cover"
					fallback={
						<div className="h-full w-full animate-pulse bg-foreground/10" />
					}
				/>
			</StorySurface>
			<StorySurface>
				<Text variant="bodyStrong">Corner clip and overlay</Text>
				<Text variant="caption" tone="muted">
					The overlay stays inside the image's reveal mask.
				</Text>
				<Reveal.Image
					src="/test/placeholder-portrait.jpg"
					alt="Abstract blue portrait with an owned overlay"
					fill
					sizes="(min-width: 768px) 50vw, 100vw"
					revealVariant="corner-clip"
					revealOrigin="top-left"
					revealFinalRadius={16}
					contentClassName="aspect-[4/3] overflow-hidden rounded-lg"
					imageClassName="object-cover"
					overlay={
						<Panel
							background="page"
							border="subtle"
							gap="none"
							padding="xs"
							radius="float"
							elevation="card"
							className="absolute inset-x-3 bottom-3 bg-background/85 backdrop-blur-sm"
						>
							<Text variant="bodyStrong">Overlay content</Text>
						</Panel>
					}
				/>
			</StorySurface>
			<StorySurface>
				<Text variant="bodyStrong">Failed load fallback</Text>
				<Text variant="caption" tone="muted">
					A load error must not leave the scheduler or layout suspended.
				</Text>
				<Reveal.Image
					src="/test/missing-reveal-image.png"
					alt="Unavailable abstract asset"
					fill
					sizes="(min-width: 768px) 50vw, 100vw"
					loadStrategy="wait-for-load"
					contentClassName="aspect-[4/3] overflow-hidden rounded-lg"
					imageClassName="object-cover"
					fallback={
						<div className="grid h-full place-items-center bg-foreground/5 p-6 text-center">
							<Text variant="caption" tone="muted">
								Image unavailable
							</Text>
						</div>
					}
				/>
			</StorySurface>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<Reveal.Sequence className="grid max-w-4xl gap-5" stagger={0.08}>
			<StorySurface>
				<Text variant="caption" tone="muted">
					Character stagger
				</Text>
				<Reveal.Text as="h2" variant="headingLg">
					A readable reveal
				</Reveal.Text>
			</StorySurface>
			<StorySurface>
				<Text variant="caption" tone="muted">
					Substring emphasis
				</Text>
				<Reveal.Highlight highlight="shared motion" variant="headingXs">
					Use shared motion inside a complete sentence.
				</Reveal.Highlight>
			</StorySurface>
			<div className="grid gap-3 md:grid-cols-2">
				<StorySurface>
					<Text variant="caption" tone="muted">
						Text scramble
					</Text>
					<Reveal.Scramble text="Stable final text" maintainSpace />
				</StorySurface>
				<StorySurface>
					<Text variant="caption" tone="muted">
						Numeric scramble
					</Text>
					<Reveal.Scramble text="Build 2048" mode="numeric" maintainSpace />
				</StorySurface>
			</div>
			<div className="grid gap-3 sm:grid-cols-3">
				{(["countUp", "reveal", "scroll"] as const).map((animation) => (
					<StorySurface key={animation}>
						<Text variant="caption" tone="muted">
							{animation}
						</Text>
						<Reveal.Number
							animation={animation}
							text="42 projects"
							className="text-3xl font-semibold tabular-nums"
						/>
					</StorySurface>
				))}
			</div>
		</Reveal.Sequence>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview4() {
	const render = () => <SequenceOwnershipHarness />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview5() {
	const render = () => <InteractionHandoffHarness />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-motion-reveal",
	name: "Reveal",
	role: "Entrance-motion family coordinated by the site-level reveal scheduler.",
	importStatement: 'import * as Reveal from "@/components/ui/motion/reveal";',
	chooseWhen: [
		"Entrance motion materially improves hierarchy or narrative presentation.",
	],
	chooseInstead: [
		"Use CSS transitions for micro-interactions and static content when motion adds no meaning.",
	],
	compounds: [
		"Reveal.Sequence",
		"Reveal.Item",
		"Reveal.Image",
		"Reveal.Text",
		"Reveal.Highlight",
		"Reveal.Scramble",
		"Reveal.Number",
	],
	exclusions: [
		"GlobalRevealScheduler, scheduler context, participant hooks, and NumericCountUpText.",
	],
	guarantees: [
		{
			label: "Family composition and replayable choreography",
			storyId: "ui-motion-reveal--family-composition",
		},
		{
			label: "Image loading, masking, overlay, and fallback strategies",
			storyId: "ui-motion-reveal--image-contract",
		},
		{
			label: "Accessible text and numeric effects",
			storyId: "ui-motion-reveal--text-effects",
		},
		{
			label: "Nested and late-mounted sequence ownership",
			storyId: "ui-motion-reveal--sequence-ownership",
		},
		{
			label: "Interactive-child handoff",
			storyId: "ui-motion-reveal--interaction-handoff",
		},
	],

	family: "UI",
	group: "Motion",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "family-composition",
			name: "Family composition and replayable choreography",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "image-contract",
			name: "Image loading, masking, overlay, and fallback strategies",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "text-effects",
			name: "Accessible text and numeric effects",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
		{
			id: "sequence-ownership",
			name: "Nested and late-mounted sequence ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview4,
		},
		{
			id: "interaction-handoff",
			name: "Interactive-child handoff",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview5,
		},
	],
});
