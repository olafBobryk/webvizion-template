"use client";

import * as Assistant from "@/components/domain/assistant";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";

function CatalogPreview() {
	const render = () => (
		<div className="grid gap-7 py-6">
			<Assistant.Loading />
			<Assistant.Thinking />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "domain-assistant-status",
	name: "Status",
	role: "Conversation-owned pending feedback for assistant request preparation and model thinking phases.",
	importStatement:
		'import * as Assistant from "@/components/domain/assistant";',
	chooseWhen: [
		"An assistant turn is preparing a request or waiting on model reasoning inside Conversation.",
	],
	chooseInstead: [
		"Use Loader for compact control-level progress, Skeleton for unresolved layout, or ToastHost for transient completion feedback.",
	],
	compounds: [],
	exclusions: [
		"Route-loading placeholders that must preserve final geometry.",
		"Generic form submission or background synchronization status.",
	],
	guarantees: [
		{
			label: "Pending States",
			storyId: "domain-assistant-status--pending-states",
		},
	],
	family: "Domain",
	group: "Assistant",
	previewTargets: [
		{
			id: "pending-states",
			name: "Pending States",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview,
		},
	],
});
