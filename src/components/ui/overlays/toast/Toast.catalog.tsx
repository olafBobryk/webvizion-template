"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { showToast } from "../../../../lib/feedback";
import { Button } from "../../primitives/Button";
import ToastHost from "./ToastHost";

function CatalogPreview1() {
	const render = () => (
		<div className="flex gap-2 p-8">
			<ToastHost />
			<Button
				onClick={() =>
					showToast.success("Settings saved.", { title: "Success" })
				}
			>
				Show success
			</Button>
			<Button
				onClick={() => showToast.error("Upload failed.", { title: "Failed" })}
				variant="secondary"
			>
				Show error
			</Button>
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
		<div className="p-8">
			<ToastHost />
			<Button
				onClick={() =>
					showToast.promise(
						Promise.resolve("saved"),
						{
							loading: "Saving changes...",
							success: "Changes saved.",
							error: "Save failed.",
						},
						{ successTitle: "Success" },
					)
				}
			>
				Save with feedback
			</Button>
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
		<div className="p-8">
			<ToastHost />
			<Button
				onClick={() => {
					showToast.info("Queued upload started.", { title: "Pipeline" });
					showToast.success("Upload finished.", { title: "Pipeline" });
				}}
			>
				Show pipeline feedback
			</Button>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-overlays-toast",
	name: "Toast",
	role: "Application-level transient feedback host and action API for user-initiated async outcomes.",
	importStatement:
		'import ToastHost from "@/components/ui/overlays/toast/ToastHost";\nimport { showToast } from "@/lib/feedback";',
	chooseWhen: [
		"A user-initiated save, upload, retry, or background action needs brief progress or outcome feedback.",
	],
	chooseInstead: [
		"Use Field or StatusMessage for inline and durable feedback, and a modal for blocking decisions.",
	],
	compounds: [
		"showToast.success",
		"showToast.error",
		"showToast.info",
		"showToast.loading",
		"showToast.dismiss",
		"showToast.promise",
	],
	exclusions: [
		"Initial-load feedback.",
		"Feature-local toast state or a second toast host.",
		"Field validation duplicated in a toast.",
	],
	guarantees: [
		{
			label: "Semantic transient feedback",
			storyId: "ui-overlays-toast--semantic-feedback",
		},
		{
			label: "Promise lifecycle",
			storyId: "ui-overlays-toast--promise-lifecycle",
		},
		{
			label: "Stacked action feedback",
			storyId: "ui-overlays-toast--stacked-feedback",
		},
	],

	family: "UI",
	group: "Overlays",
	previewTargets: [
		{
			id: "semantic-feedback",
			name: "Semantic transient feedback",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview1,
		},
		{
			id: "promise-lifecycle",
			name: "Promise lifecycle",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview2,
		},
		{
			id: "stacked-feedback",
			name: "Stacked action feedback",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview3,
		},
	],
});
