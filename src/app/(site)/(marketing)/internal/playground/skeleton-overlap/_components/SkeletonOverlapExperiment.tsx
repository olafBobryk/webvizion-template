"use client";

import * as React from "react";
import { TextInput } from "@/components/ui/input";
import { Chip, SegmentedControl } from "@/components/ui/misc";
import { Card } from "@/components/ui/primitives/Card";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import {
	evaluateSkeletonGeometry,
	measurementsAreStable,
	SKELETON_OVERLAP_TOLERANCE,
	type SkeletonGeometryLayer,
	type SkeletonGeometryMeasurements,
	type SkeletonGeometryRect,
	skeletonOverlapFixture,
} from "../_lib/geometry";

type ViewMode = "live" | "overlay" | "skeleton";

const viewOptions = [
	{ label: "Overlay", value: "overlay" },
	{ label: "Live", value: "live" },
	{ label: "Skeleton", value: "skeleton" },
] as const;

function serializeRect(rect: DOMRect): SkeletonGeometryRect {
	return {
		bottom: rect.bottom,
		height: rect.height,
		left: rect.left,
		right: rect.right,
		top: rect.top,
		width: rect.width,
	};
}

function measureLayer(
	element: HTMLDivElement | null,
	frameSlot: "input-frame" | "input-frame-skeleton",
): SkeletonGeometryLayer | null {
	const root = element?.firstElementChild;
	const label = root?.querySelector("label");
	const description = Array.from(root?.querySelectorAll("p") ?? []).find(
		(candidate) => candidate.getAttribute("aria-hidden") !== "true",
	);
	const inputFrame = root?.querySelector(`[data-slot="${frameSlot}"]`);
	if (!(root && label && description && inputFrame)) return null;

	return {
		description: serializeRect(description.getBoundingClientRect()),
		inputFrame: serializeRect(inputFrame.getBoundingClientRect()),
		label: serializeRect(label.getBoundingClientRect()),
		root: serializeRect(root.getBoundingClientRect()),
	};
}

function takeMeasurements(
	live: HTMLDivElement | null,
	skeleton: HTMLDivElement | null,
): SkeletonGeometryMeasurements | null {
	const liveLayer = measureLayer(live, "input-frame");
	const skeletonLayer = measureLayer(skeleton, "input-frame-skeleton");
	if (!(liveLayer && skeletonLayer)) return null;
	return { live: liveLayer, skeleton: skeletonLayer };
}

function formatNumber(value: number) {
	return value.toFixed(2);
}

export function SkeletonOverlapExperiment() {
	const [mode, setMode] = React.useState<ViewMode>("overlay");
	const [measurements, setMeasurements] =
		React.useState<SkeletonGeometryMeasurements | null>(null);
	const liveRef = React.useRef<HTMLDivElement>(null);
	const skeletonRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		let animationFrame: number | null = null;
		let cancelled = false;
		let previous: SkeletonGeometryMeasurements | null = null;

		const scheduleMeasurement = () => {
			if (animationFrame !== null) cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(() => {
				animationFrame = null;
				const next = takeMeasurements(liveRef.current, skeletonRef.current);
				if (!next || cancelled) return;
				if (previous && measurementsAreStable(previous, next)) {
					setMeasurements(next);
					return;
				}
				previous = next;
				scheduleMeasurement();
			});
		};

		const observer = new ResizeObserver(() => {
			previous = null;
			setMeasurements(null);
			scheduleMeasurement();
		});
		if (liveRef.current) observer.observe(liveRef.current);
		if (skeletonRef.current) observer.observe(skeletonRef.current);

		void document.fonts.ready.then(scheduleMeasurement);
		return () => {
			cancelled = true;
			observer.disconnect();
			if (animationFrame !== null) cancelAnimationFrame(animationFrame);
		};
	}, []);

	const verdict = measurements ? evaluateSkeletonGeometry(measurements) : null;
	const status = verdict ? (verdict.pass ? "pass" : "fail") : "pending";

	return (
		<div
			className="grid gap-5"
			data-skeleton-overlap-measurements={
				measurements ? JSON.stringify(measurements) : undefined
			}
			data-skeleton-overlap-stable={measurements ? "true" : "false"}
			data-skeleton-overlap-status={status}
			data-skeleton-overlap-tolerance={SKELETON_OVERLAP_TOLERANCE}
			data-skeleton-overlap-verdict={
				verdict ? JSON.stringify(verdict) : undefined
			}
		>
			<Card>
				<Card.Header className="border-b">
					<Card.Title>Default TextInput</Card.Title>
					<Card.Description>
						Cyan marks the loaded field. Magenta marks the component-owned
						skeleton at the same origin.
					</Card.Description>
					<Card.Action>
						<Chip
							tone={
								status === "pass"
									? "success"
									: status === "fail"
										? "danger"
										: "neutral"
							}
						>
							{status === "pending"
								? "Measuring"
								: status === "pass"
									? "Aligned"
									: "Drift detected"}
						</Chip>
					</Card.Action>
				</Card.Header>
				<Card.Content className="grid gap-5">
					<SegmentedControl
						ariaLabel="Skeleton overlap view"
						className="max-w-md"
						onChange={setMode}
						options={viewOptions}
						value={mode}
					/>
					<Panel
						background="surface"
						border="subtle"
						overflow="visible"
						padding="md"
						radius="sm"
						shadow="none"
					>
						<div
							className="relative mx-auto w-full max-w-xl"
							data-skeleton-overlap-stage
						>
							<div
								className={[
									"relative z-10 outline-2 outline-cyan-500/80 outline-offset-2 transition-opacity",
									"[&_[data-slot=input-frame]]:outline [&_[data-slot=input-frame]]:outline-1 [&_[data-slot=input-frame]]:outline-cyan-500",
									mode === "skeleton" ? "opacity-0" : "opacity-100",
								].join(" ")}
								data-skeleton-layer="live"
								ref={liveRef}
							>
								<TextInput
									defaultValue={skeletonOverlapFixture.value}
									description={skeletonOverlapFixture.description}
									label={skeletonOverlapFixture.label}
								/>
							</div>
							<div
								aria-hidden="true"
								className={[
									"pointer-events-none absolute inset-x-0 top-0 z-20 outline-2 outline-fuchsia-500/80 outline-offset-2 transition-opacity",
									"[&_[data-slot=input-frame-skeleton]]:outline [&_[data-slot=input-frame-skeleton]]:outline-1 [&_[data-slot=input-frame-skeleton]]:outline-fuchsia-500",
									mode === "live"
										? "opacity-0"
										: mode === "overlay"
											? "opacity-55"
											: "opacity-100",
								].join(" ")}
								data-skeleton-layer="skeleton"
								ref={skeletonRef}
							>
								<TextInput.Skeleton
									description={skeletonOverlapFixture.description}
									label={skeletonOverlapFixture.label}
									value={skeletonOverlapFixture.value}
								/>
							</div>
						</div>
					</Panel>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header className="border-b">
					<Card.Title>Geometry verdict</Card.Title>
					<Card.Description>
						Each corresponding edge may differ by at most{" "}
						{SKELETON_OVERLAP_TOLERANCE.toFixed(1)} CSS px.
					</Card.Description>
				</Card.Header>
				<Card.Content className="grid gap-5">
					{verdict ? (
						<>
							<div className="overflow-x-auto">
								<table className="w-full min-w-[44rem] border-collapse text-left text-sm">
									<thead>
										<tr className="border-b border-border text-muted-foreground">
											<th className="px-3 py-2 font-medium">Slot</th>
											<th className="px-3 py-2 font-medium">Max edge</th>
											<th className="px-3 py-2 font-medium">IoU</th>
											<th className="px-3 py-2 font-medium">Top</th>
											<th className="px-3 py-2 font-medium">Right</th>
											<th className="px-3 py-2 font-medium">Bottom</th>
											<th className="px-3 py-2 font-medium">Left</th>
										</tr>
									</thead>
									<tbody>
										{verdict.slots.map((result) => (
											<tr
												className="border-b border-border/70 last:border-b-0"
												key={result.slot}
											>
												<td className="px-3 py-2 font-medium text-foreground">
													{result.slot}
												</td>
												<td className="px-3 py-2 tabular-nums">
													{formatNumber(result.maxEdgeDelta)}
												</td>
												<td className="px-3 py-2 tabular-nums">
													{formatNumber(result.intersectionOverUnion)}
												</td>
												{(["top", "right", "bottom", "left"] as const).map(
													(edge) => (
														<td className="px-3 py-2 tabular-nums" key={edge}>
															{formatNumber(result.deltas[edge])}
														</td>
													),
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="grid gap-2 sm:grid-cols-2">
								<Panel
									background="muted"
									border="none"
									padding="sm"
									radius="sm"
									shadow="none"
								>
									<Text variant="bodyStrong">Internal collisions</Text>
									{verdict.collisions.length === 0 ? (
										<Text tone="muted" variant="caption">
											None detected.
										</Text>
									) : (
										<ul className="grid gap-1 text-xs text-muted-foreground">
											{verdict.collisions.map((collision) => (
												<li
													key={`${collision.layer}-${collision.first}-${collision.second}`}
												>
													{collision.layer}: {collision.first} ↔{" "}
													{collision.second} (
													{formatNumber(collision.intersectionArea)} px²)
												</li>
											))}
										</ul>
									)}
								</Panel>
								<Panel
									background="muted"
									border="none"
									padding="sm"
									radius="sm"
									shadow="none"
								>
									<Text variant="bodyStrong">Internal overflow</Text>
									{verdict.overflows.length === 0 ? (
										<Text tone="muted" variant="caption">
											None detected.
										</Text>
									) : (
										<ul className="grid gap-1 text-xs text-muted-foreground">
											{verdict.overflows.map((overflow) => (
												<li key={`${overflow.layer}-${overflow.slot}`}>
													{overflow.layer}.{overflow.slot}: top{" "}
													{formatNumber(overflow.top)}, right{" "}
													{formatNumber(overflow.right)}, bottom{" "}
													{formatNumber(overflow.bottom)}, left{" "}
													{formatNumber(overflow.left)} px
												</li>
											))}
										</ul>
									)}
								</Panel>
							</div>
						</>
					) : (
						<Text tone="muted" variant="body">
							Waiting for fonts and two stable geometry samples…
						</Text>
					)}
				</Card.Content>
			</Card>
		</div>
	);
}
