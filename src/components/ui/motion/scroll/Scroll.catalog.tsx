"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import * as Scroll from "./index";

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
function CatalogPreview1() {
	const render = () => (
		<div className="min-h-[120vh] p-12">
			<p className="max-w-xl text-3xl">
				<Scroll.Highlight variant="viewport" active>
					Readable highlighted copy
				</Scroll.Highlight>
			</p>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{},
		...{ children: <span>Readable highlighted copy</span> },
	} as never);
}
function CatalogPreview2() {
	const render = () => (
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
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{},
		...{ children: <span>Transformation content</span> },
	} as never);
}
function CatalogPreview3() {
	const render = () => <ScrollNarrative />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{},
		...{ children: <span>Scroll narrative</span> },
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-motion-scroll",
	name: "Scroll",
	role: "Scroll-linked presentation family for highlight, lag, parallax, and width effects.",
	importStatement: 'import * as Scroll from "@/components/ui/motion/scroll";',
	chooseWhen: [
		"Scroll position should gently explain spatial or narrative progression.",
	],
	chooseInstead: [
		"Use Reveal for one-time entrance and CSS transitions for local state changes.",
	],
	compounds: [
		"Scroll.Highlight",
		"Scroll.Lag",
		"Scroll.Parallax",
		"Scroll.Width",
	],
	exclusions: ["Page-local motion values and hardcoded springs."],
	guarantees: [
		{
			label: "Accessible highlighted copy",
			storyId: "ui-motion-scroll--highlight-contract",
		},
		{
			label: "Static-safe transformation owners",
			storyId: "ui-motion-scroll--transform-family",
		},
		{
			label: "Replayable scroll-narrative composition",
			storyId: "ui-motion-scroll--narrative-composition",
		},
	],

	family: "UI",
	group: "Motion",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "highlight-contract",
			name: "Accessible highlighted copy",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview1,
		},
		{
			id: "transform-family",
			name: "Static-safe transformation owners",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview2,
		},
		{
			id: "narrative-composition",
			name: "Replayable scroll-narrative composition",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview3,
		},
	],
});
