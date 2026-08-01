"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import Divider from "./Divider";
import { Panel } from "./surfaces";
import { Text } from "./Text";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-4">
			<Text>First content group</Text>
			<Divider />
			<Text>Second content group</Text>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid gap-6">
			<Divider textProps={{ tone: "muted", variant: "caption" }}>
				or continue with
			</Divider>
			<Panel background="card" padding="sm">
				<Divider textProps={{ tone: "muted" }}>Card surface</Divider>
			</Panel>
			<Panel background="muted" padding="sm">
				<Divider textProps={{ tone: "muted" }}>Muted surface</Divider>
			</Panel>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-divider",
	name: "Divider",
	role: "Shared horizontal or vertical separator with optional label ownership.",
	importStatement: 'import Divider from "@/components/ui/primitives/Divider";',
	chooseWhen: [
		"Content groups need a shared rule or a labeled horizontal break.",
	],
	chooseInstead: [
		"Use an owning Card or overlay slot divider when that component already provides one.",
	],
	compounds: [],
	exclusions: [
		"Ad hoc border divs for ordinary content separation.",
		"A page-background patch behind labels on Card, Panel, modal, or page surfaces.",
	],
	guarantees: [
		{
			label: "Unlabeled separation",
			storyId: "ui-primitives-divider--unlabeled",
		},
		{
			label: "Neutral labels across surfaces",
			storyId: "ui-primitives-divider--labeled-across-surfaces",
		},
	],

	family: "UI",
	group: "Primitives",
	previewTargets: [
		{
			id: "unlabeled",
			name: "Unlabeled separation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "labeled-across-surfaces",
			name: "Neutral labels across surfaces",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
