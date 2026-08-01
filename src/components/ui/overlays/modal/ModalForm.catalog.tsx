"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { ModalCard } from "./ModalCard";
import { ModalForm, ModalStepForm } from "./ModalForm";
import { ModalHeader, ModalShell, ModalTitle } from "./ModalShell";

const steps = [
	{ id: "details", label: "Details" },
	{ id: "review", label: "Review" },
] as const;
function StepFormHarness() {
	const [currentStep, setCurrentStep] = useState<"details" | "review">(
		"details",
	);
	const [submissions, setSubmissions] = useState(0);
	return (
		<>
			<div id="modal-form-root" />
			<ModalShell
				ariaLabel="Modal form"
				onClose={() => {}}
				portalTargetId="modal-form-root"
			>
				<ModalCard>
					<ModalHeader showCloseButton={false}>
						<ModalTitle>Create record</ModalTitle>
					</ModalHeader>
					<ModalStepForm
						aria-label="Record creation steps"
						currentStep={currentStep}
						onStepChange={setCurrentStep}
						onSubmit={(event) => {
							event.preventDefault();
							setSubmissions((count) => count + 1);
						}}
						panels={[
							{ id: "details", children: <p>Details panel</p> },
							{ id: "review", children: <p>Review panel</p> },
						]}
						steps={steps}
						submitAction={<Button type="submit">Create record</Button>}
					/>
				</ModalCard>
			</ModalShell>
			<output aria-live="polite">Submitted {submissions} times</output>
		</>
	);
}
function CatalogPreview1() {
	const render = () => (
		<div className="max-w-lg rounded-md border">
			<ModalForm
				aria-label="Profile form"
				footer={<Button type="submit">Save</Button>}
				onSubmit={(event) => event.preventDefault()}
			>
				<label className="grid gap-1 p-2">
					Name
					<input name="name" />
				</label>
			</ModalForm>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => <StepFormHarness />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-overlays-modal-form",
	name: "Modal Forms",
	role: "Form and ordered-step composition owner for modal content, semantic submission, canonical footer placement, and step navigation.",
	importStatement:
		'import { ModalForm, ModalStepForm } from "@/components/ui/overlays/modal/ModalForm";',
	chooseWhen: [
		"A modal owns a real form or a genuinely ordered multi-step form flow.",
	],
	chooseInstead: [
		"Use ordinary form layout outside a modal, or ConfirmationModal for a simple confirm action.",
	],
	compounds: ["ModalStepForm", "ModalStepFormPanel"],
	exclusions: [
		"Cosmetic step indicators without ordered interaction.",
		"Div-based pseudo-forms and page-local pending footer layouts.",
	],
	guarantees: [
		{
			label: "Semantic form regions",
			storyId: "ui-overlays-modal-form--semantic-form-layout",
		},
		{
			label: "Ordered step navigation and final submit",
			storyId: "ui-overlays-modal-form--ordered-step-submission",
		},
	],

	family: "UI",
	group: "Overlays",
	previewTargets: [
		{
			id: "semantic-form-layout",
			name: "Semantic form regions",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview1,
		},
		{
			id: "ordered-step-submission",
			name: "Ordered step navigation and final submit",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview2,
		},
	],
});
