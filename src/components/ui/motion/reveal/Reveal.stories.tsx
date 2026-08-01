import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { Panel } from "../../primitives/surfaces";
import { Text } from "../../primitives/Text";
import * as Reveal from "./index";
import { catalogContract } from "./Reveal.catalog";

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

const meta = {
	id: "ui-motion-reveal",
	title: "UI/Motion/Reveal",
	component: Reveal.Item,
	subcomponents: {
		"Reveal.Sequence": Reveal.Sequence,
		"Reveal.Image": Reveal.Image,
		"Reveal.Text": Reveal.Text,
		"Reveal.Highlight": Reveal.Highlight,
		"Reveal.Scramble": Reveal.Scramble,
		"Reveal.Number": Reveal.Number,
	},
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Reveal.Item>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FamilyComposition: Story = {
	parameters: {
		layout: "fullscreen",
		// Axe can sample the intentionally translucent entrance frame. Completion,
		// visibility, and replay ownership remain strict in the play assertions.
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"Start here. This replayable scene demonstrates how the full family composes without wrapping specialized effects in redundant Reveal.Item owners.",
			},
		},
	},
	render: () => <FamilyShowcase />,
	play: async ({ canvas, canvasElement }) => {
		const initialHeading = canvas.getByRole("heading", {
			name: "Motion should reveal the hierarchy.",
		});
		await expect(initialHeading).toBeVisible();
		await expect(
			canvas.getByRole("img", {
				name: "Charcoal and coral shapes in the Reveal family showcase",
			}),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(
				"A stable final string remains available to assistive technology.",
				{ selector: ".sr-only" },
			),
		).toBeInTheDocument();
		const initialSequenceCount = canvasElement.querySelectorAll(
			'[data-reveal-sequence=""]',
		).length;
		await expect(initialSequenceCount).toBeGreaterThanOrEqual(4);
		await userEvent.click(
			canvas.getByRole("button", { name: "Replay choreography" }),
		);
		await waitFor(
			() =>
				expect(
					canvas.getByRole("heading", {
						name: "Motion should reveal the hierarchy.",
					}),
				).not.toBe(initialHeading),
			{ timeout: 3000 },
		);
		await waitFor(
			() => {
				const revealItems = [
					...canvasElement.querySelectorAll<HTMLElement>(
						'[data-reveal-item=""]',
					),
				];
				expect(revealItems.length).toBeGreaterThan(0);
				expect(
					revealItems.every(
						(item) => window.getComputedStyle(item).opacity === "1",
					),
				).toBe(true);
			},
			{ timeout: 6000 },
		);
	},
};

export const ImageContract: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Compare the four image decisions side by side: immediate scheduling, wait-for-load, a corner clip with owned overlay content, and a failed-load fallback.",
			},
		},
	},
	render: () => (
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
	),
	play: async ({ canvas, canvasElement }) => {
		await expect(
			canvas.getByRole("img", {
				name: "Abstract blue portrait revealed without a load gate",
			}),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole("img", {
				name: "Charcoal and coral shapes revealed after loading",
			}),
		).toBeInTheDocument();
		await waitFor(
			() => expect(canvas.getByText("Overlay content")).toBeVisible(),
			{ timeout: 3000 },
		);
		await waitFor(
			() => expect(canvas.getByText("Image unavailable")).toBeVisible(),
			{ timeout: 3000 },
		);
		await waitFor(
			() => {
				const owners = [
					...canvasElement.querySelectorAll<HTMLElement>(
						'[data-reveal-item=""]',
					),
				];
				expect(owners).toHaveLength(4);
				expect(owners.every((owner) => owner.style.opacity === "1")).toBe(true);
			},
			{ timeout: 3000 },
		);
	},
};

export const TextEffects: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Text, Highlight, Scramble, and Number are direct scheduler participants. Their visual characters are hidden from assistive technology while one stable final string remains readable.",
			},
		},
	},
	render: () => (
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
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("heading", { name: "A readable reveal" }),
		).toBeInTheDocument();
		await expect(
			canvas.getByText("Use shared motion inside a complete sentence.", {
				selector: ".sr-only",
			}),
		).toBeInTheDocument();
		await expect(
			canvas.getByText("Stable final text", { selector: ".sr-only" }),
		).toBeInTheDocument();
		await expect(
			canvas.getByText("Stable final text", {
				selector: ".relative.opacity-0",
			}),
		).toHaveAttribute("aria-hidden", "true");
		await expect(
			canvas.getAllByText("42 projects", { selector: ".sr-only" }),
		).toHaveLength(3);
	},
};

export const SequenceOwnership: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A nested Sequence enters its parent as one structural participant, then staggers its own descendants. A participant mounted after start forms a new local batch.",
			},
		},
	},
	render: () => <SequenceOwnershipHarness />,
	play: async ({ canvas, canvasElement }) => {
		await waitFor(
			() =>
				expect(
					(
						canvas
							.getByText("Nested child three")
							.closest("[data-reveal-item]") as HTMLElement | null
					)?.style.opacity,
				).toBe("1"),
			{ timeout: 3000 },
		);
		await expect(
			canvasElement.querySelectorAll('[data-reveal-sequence=""]'),
		).toHaveLength(2);
		await userEvent.click(
			canvas.getByRole("button", { name: "Mount late item" }),
		);
		await waitFor(
			() => expect(canvas.getByText("Late-mounted child")).toBeVisible(),
			{
				timeout: 2500,
			},
		);
		await userEvent.click(
			canvas.getByRole("button", { name: "Replay nesting" }),
		);
		await waitFor(
			() =>
				expect(
					(
						canvas
							.getByText("Outer child")
							.closest("[data-reveal-item]") as HTMLElement | null
					)?.style.opacity,
				).toBe("1"),
			{ timeout: 2500 },
		);
	},
};

export const InteractionHandoff: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Use asChild when the interactive child must own the DOM node. deferInteractionUntilRevealed prevents early input; handoffAfterReveal restores the child's normal transition ownership after entrance completes.",
			},
		},
	},
	render: () => <InteractionHandoffHarness />,
	play: async ({ canvas }) => {
		const lockedButton = canvas
			.getByText("Activate after reveal")
			.closest("button") as HTMLButtonElement;
		await expect(lockedButton).toHaveAttribute("inert");
		await waitFor(
			() =>
				expect(
					canvas.getByRole("button", { name: "Activate after reveal" }),
				).not.toHaveAttribute("inert"),
			{
				timeout: 3000,
			},
		);
		const button = canvas.getByRole("button", {
			name: "Activate after reveal",
		});
		await userEvent.click(button);
		await expect(canvas.getByText("Activations: 1")).toBeInTheDocument();
		button.focus();
		await expect(button).toHaveFocus();
	},
};
