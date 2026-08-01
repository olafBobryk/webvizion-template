"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import { CopyStatusIcon, useCopyAction } from "./useCopyAction";

function CopyHarness() {
	const [lastCopied, setLastCopied] = useState("Nothing copied");
	const { copied, handleCopy } = useCopyAction({
		value: "Averlo",
		onCopy: async (value) => setLastCopied(`Copied ${value}`),
		toastMessage: false,
	});
	return (
		<div className="grid gap-3">
			<Button
				onClick={handleCopy}
				leadingIcon={<CopyStatusIcon copied={copied} />}
			>
				Copy name
			</Button>
			<output aria-live="polite">{lastCopied}</output>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => <CopyHarness />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-helpers-copy-action",
	name: "Copy Action",
	role: "Shared clipboard action state and matching visual status icon for reusable copy controls.",
	importStatement:
		'import { CopyStatusIcon, useCopyAction } from "@/components/ui/helpers/useCopyAction";',
	chooseWhen: [
		"A reusable owner needs copy behavior and the shared copied-state feedback.",
	],
	chooseInstead: [
		"Use CopyField when the complete value-and-copy presentation fits.",
	],
	compounds: ["CopyStatusIcon"],
	exclusions: ["Page-local clipboard state and duplicated copied timers."],
	guarantees: [
		{
			label: "Copy callback and feedback",
			storyId: "ui-helpers-copy-action--copy-callback-and-feedback",
		},
	],

	family: "UI",
	group: "Helpers",
	previewTargets: [
		{
			id: "copy-callback-and-feedback",
			name: "Copy callback and feedback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
