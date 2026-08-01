"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { Field } from "./Field";
import { InputFrame, inputVariants } from "./InputFrame";

function CatalogPreview1() {
	const render = () => (
		<Field
			label="Project name"
			description="Use a name teammates will recognize."
			message="A project name is required."
			tone="error"
			required
			inputId="project-name"
			descriptionId="project-name-description"
			messageId="project-name-message"
		>
			<InputFrame fullWidth tone="error">
				<input
					id="project-name"
					aria-describedby="project-name-description"
					aria-errormessage="project-name-message"
					aria-invalid="true"
					className={inputVariants()}
				/>
			</InputFrame>
		</Field>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<Field
			label="Slug"
			labelAction={
				<Button size="none" variant="ghost">
					Generate
				</Button>
			}
			message="Available"
			tone="success"
			inputId="project-slug"
			messageId="project-slug-message"
		>
			<InputFrame fullWidth tone="success">
				<input
					id="project-slug"
					className={inputVariants()}
					defaultValue="averlo"
				/>
			</InputFrame>
		</Field>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<Field.Skeleton label="Project name" fullWidth>
			Project name
		</Field.Skeleton>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-field",
	name: "Field",
	role: "Relationship owner for labels, descriptions, required state, inline messages, and matching skeletons.",
	importStatement: 'import { Field } from "@/components/ui/primitives/Field";',
	chooseWhen: [
		"A real form control needs shared labeling, description, validation-message, and ID relationships.",
	],
	chooseInstead: [
		"Application code should prefer a finished input family that already composes Field.",
	],
	compounds: ["Field.Skeleton"],
	exclusions: [
		"Page-local label, required-marker, or validation-message wiring.",
		"Using Field as a generic status banner.",
	],
	guarantees: [
		{
			label: "Label, description, and error relationships",
			storyId: "ui-primitives-field--label-description-and-error-relationships",
		},
		{
			label: "Success and label action",
			storyId: "ui-primitives-field--success-and-label-action",
		},
		{
			label: "Skeleton parity",
			storyId: "ui-primitives-field--skeleton-parity",
		},
	],

	family: "UI",
	group: "Primitives",
	previewTargets: [
		{
			id: "label-description-and-error-relationships",
			name: "Label, description, and error relationships",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "success-and-label-action",
			name: "Success and label action",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "skeleton-parity",
			name: "Skeleton parity",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
