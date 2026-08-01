"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Skeleton } from "./Skeleton";
import { SuspenseBoundary } from "./SuspenseBoundary";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-5">
			<SuspenseBoundary
				loading
				fallback={<p>Loading account</p>}
				forceReducedMotion
			>
				<p>Account ready</p>
			</SuspenseBoundary>
			<SuspenseBoundary
				error
				errorFallback={{
					title: "Account unavailable",
					description: "Try again later.",
				}}
				forceReducedMotion
			>
				<p>Hidden account</p>
			</SuspenseBoundary>
			<SuspenseBoundary forceReducedMotion>
				<p>Resolved account</p>
			</SuspenseBoundary>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ children: <p>Account ready</p> } } as never);
}
function CatalogPreview2() {
	const render = () => (
		<SuspenseBoundary
			ghost
			loading
			forceReducedMotion
			fallback={
				<div className="grid gap-2">
					<Skeleton className="h-5 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
			}
		>
			<div className="grid gap-2">
				<h3>Account owner</h3>
				<p>Owner details</p>
			</div>
		</SuspenseBoundary>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ children: <p>Owner details</p> } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-suspense-boundary",
	name: "SuspenseBoundary",
	role: "Shared loading/error transition boundary for controlled state and React Suspense.",
	importStatement: 'import { SuspenseBoundary } from "@/components/ui/misc";',
	chooseWhen: [
		"A reusable region must switch among loading, resolved, and error presentations.",
	],
	chooseInstead: [
		"Use a component-owned loading prop when the owner already handles action progress.",
	],
	compounds: [],
	exclusions: ["Page-local async wrappers and mismatched ghost layouts."],
	guarantees: [
		{
			label: "Controlled loading and error selection",
			storyId: "ui-misc-suspense-boundary--controlled-states",
		},
		{
			label: "Ghost layout preservation",
			storyId: "ui-misc-suspense-boundary--ghost-parity",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "controlled-states",
			name: "Controlled loading and error selection",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "ghost-parity",
			name: "Ghost layout preservation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
