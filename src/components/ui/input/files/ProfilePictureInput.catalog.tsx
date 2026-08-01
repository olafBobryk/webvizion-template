"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ProfilePictureInput } from "./ProfilePictureInput";

const onChange = () => undefined;
const onValidationError = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<ProfilePictureInput
			acceptedMimeTypes={["image/png"]}
			currentUrl="/test/placeholder-portrait.jpg"
			layout="file-row"
			name="Averlo user"
			onChange={onChange}
			onValidationError={onValidationError}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-profile-picture-input",
	name: "ProfilePictureInput",
	role: "Single profile-image picker with preview, client-side type and size validation, removal, and reset cleanup.",
	importStatement:
		'import { ProfilePictureInput } from "@/components/ui/input";',
	chooseWhen: [
		"A profile or avatar form needs one image with preview and removal behavior.",
	],
	chooseInstead: ["Use FileInput for generic or multiple-file workflows."],
	compounds: ["ProfilePictureInput.Skeleton"],
	exclusions: [
		"Upload transport, server validation, and caller-owned preview mechanics.",
	],
	guarantees: [
		{
			label: "Validation callback and file-row status",
			storyId: "ui-input-profile-picture-input--file-contract",
		},
	],

	family: "UI",
	group: "Input / Files",
	previewTargets: [
		{
			id: "file-contract",
			name: "Validation callback and file-row status",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
