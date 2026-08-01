"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { StatusMessage } from "./StatusMessage";

function ControlledPresenceExample() {
	const [open, setOpen] = useState(true);
	return (
		<div className="grid gap-3">
			<Button onClick={() => setOpen((current) => !current)}>
				{open ? "Hide notice" : "Show notice"}
			</Button>
			<div className="grid gap-0">
				<StatusMessage.Presence open={open} gap="sm" tone="info">
					A controlled contextual notice.
				</StatusMessage.Presence>
				<p>Content following the owned presence gap.</p>
			</div>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-3">
			<StatusMessage tone="info">
				This workspace is visible to invited members.
			</StatusMessage>
			<StatusMessage tone="success">
				Security settings are complete.
			</StatusMessage>
			<StatusMessage tone="warning">Billing details need review.</StatusMessage>
			<StatusMessage tone="danger">
				This environment is scheduled for deletion.
			</StatusMessage>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => <ControlledPresenceExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-status-message",
	name: "StatusMessage",
	role: "Persistent contextual notice independent of the latest user action.",
	importStatement:
		'import { StatusMessage } from "@/components/ui/primitives/StatusMessage";',
	chooseWhen: [
		"Context remains relevant until its surrounding condition changes or the user proceeds.",
	],
	chooseInstead: [
		"Use Field for validation, toast for transient action outcomes, and state components for whole-region failure or emptiness.",
	],
	compounds: ["StatusMessage.Presence"],
	exclusions: [
		"Submission-result banners chosen only for their color.",
		"A second parent gap around StatusMessage.Presence's owned spacing.",
	],
	guarantees: [
		{
			label: "Semantic contextual tones",
			storyId: "ui-primitives-status-message--semantic-tones",
		},
		{
			label: "Controlled presence and removal",
			storyId: "ui-primitives-status-message--controlled-presence",
		},
	],

	family: "UI",
	group: "Primitives",
	previewTargets: [
		{
			id: "semantic-tones",
			name: "Semantic contextual tones",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "controlled-presence",
			name: "Controlled presence and removal",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
