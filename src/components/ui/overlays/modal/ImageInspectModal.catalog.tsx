"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { ModalHost } from "./ModalHost";
import { useImageInspectModal } from "./useImageInspectModal";

function ImageInspectHarness() {
	const { openImageInspect } = useImageInspectModal();
	return (
		<>
			<div id="modal-root" />
			<ModalHost />
			<Button
				onClick={() =>
					openImageInspect({
						src: "/test/placeholder-portrait.jpg",
						alt: "Abstract blue portrait composition",
					})
				}
			>
				Inspect image
			</Button>
		</>
	);
}
function CatalogPreview1() {
	const render = () => (
		<div className="p-8">
			<ImageInspectHarness />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-overlays-image-inspect-modal",
	name: "ImageInspectModal",
	role: "Specialized hosted modal for enlarging an image with shared loading, close, and optional share behavior.",
	importStatement:
		'import { useImageInspectModal } from "@/components/ui/overlays/modal/useImageInspectModal";',
	chooseWhen: [
		"An image needs a full, accessible inspect or enlarge experience.",
	],
	chooseInstead: [
		"Use InspectableImage when the trigger and inspection behavior should be composed together.",
	],
	compounds: ["ImageInspectModal", "OpenImageInspectOptions"],
	exclusions: ["Page-local image lightboxes and direct modal event dispatch."],
	guarantees: [
		{
			label: "Hosted image inspection and close",
			storyId: "ui-overlays-image-inspect-modal--hosted-image-inspection",
		},
	],

	family: "UI",
	group: "Overlays",
	previewTargets: [
		{
			id: "hosted-image-inspection",
			name: "Hosted image inspection and close",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview1,
		},
	],
});
