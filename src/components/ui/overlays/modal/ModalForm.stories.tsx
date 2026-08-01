import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { ModalCard } from "./ModalCard";
import { ModalForm, ModalStepForm } from "./ModalForm";
import { catalogContract } from "./ModalForm.catalog";
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

const meta = {
	id: "ui-overlays-modal-form",
	excludeStories: ["catalogContract"],
	title: "UI/Overlays/Modal Forms",
	component: ModalForm,
	subcomponents: { ModalStepForm },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ModalForm>;

export default meta;
type Story = StoryObj;

export const SemanticFormLayout: Story = {
	render: () => (
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
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("form", { name: "Profile form" }),
		).toBeInTheDocument();
		await expect(canvas.getByRole("button", { name: "Save" })).toHaveAttribute(
			"type",
			"submit",
		);
	},
};

export const OrderedStepSubmission: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => <StepFormHarness />,
	play: async ({ canvas }) => {
		const body = within(document.body);
		await body.findByRole("dialog", { name: "Modal form" });
		await expect(
			body.getByText("Details panel").parentElement,
		).not.toHaveAttribute("hidden");
		await userEvent.click(body.getByRole("button", { name: "Next" }));
		await expect(
			body.getByText("Review panel").parentElement,
		).not.toHaveAttribute("hidden");
		await userEvent.click(body.getByRole("button", { name: "Create record" }));
		await expect(canvas.getByText("Submitted 1 times")).toBeInTheDocument();
	},
};
