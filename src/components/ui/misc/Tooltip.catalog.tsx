"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Tooltip } from "./Tooltip";

function CatalogPreview1() {
	return createElement(
		Tooltip as unknown as ComponentType<Record<string, unknown>>,
		{
			...{},
			...{
				content: "Copies the public URL",
				children: <button type="button">Share</button>,
				width: 260,
			},
		},
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-tooltip",
	name: "Tooltip",
	role: "Short hover/focus helper text built on shared dropdown positioning and dismissal.",
	importStatement: 'import { Tooltip } from "@/components/ui/misc";',
	chooseWhen: [
		"A visible control needs brief supplemental helper copy on hover or focus.",
	],
	chooseInstead: [
		"Use persistent description text when the information is required to complete the task.",
	],
	compounds: [],
	exclusions: ["Interactive tooltip content and hand-positioned labels."],
	guarantees: [
		{
			label: "Focus and hover disclosure",
			storyId: "ui-misc-tooltip--disclosure-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "disclosure-contract",
			name: "Focus and hover disclosure",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview1,
		},
	],
});
