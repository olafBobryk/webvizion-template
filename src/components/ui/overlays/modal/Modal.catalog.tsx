"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { Text } from "../../primitives/Text";
import { ModalHost } from "./ModalHost";
import {
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	useModalSubmission,
} from "./ModalShell";
import { useModal } from "./useModal";

function StandardModalContent({ close }: { close: () => void }) {
	return (
		<>
			<ModalHeader>
				<ModalTitle>Account details</ModalTitle>
			</ModalHeader>
			<ModalContent>
				<Text>Hosted modal content.</Text>
			</ModalContent>
			<ModalFooter>
				<Button onClick={close}>Done</Button>
			</ModalFooter>
		</>
	);
}
function SubmissionContent() {
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();
	return (
		<>
			<ModalHeader>
				<ModalTitle>Submitting modal</ModalTitle>
			</ModalHeader>
			<ModalContent>
				<output aria-live="polite">
					{isSubmitting ? "Submission locked" : "Ready"}
				</output>
			</ModalContent>
			<ModalFooter>
				<Button onClick={beginSubmission}>Begin submission</Button>
				<Button onClick={endSubmission} variant="secondary">
					End submission
				</Button>
			</ModalFooter>
		</>
	);
}
function ModalHarness({ submission = false }: { submission?: boolean }) {
	const { openModal } = useModal();
	return (
		<>
			<div id="modal-root" />
			<ModalHost />
			<Button
				onClick={() =>
					openModal(
						({ close }) =>
							submission ? (
								<SubmissionContent />
							) : (
								<StandardModalContent close={close} />
							),
						{ ariaLabel: submission ? "Submitting modal" : "Account details" },
					)
				}
			>
				Open modal
			</Button>
		</>
	);
}
function CatalogPreview1() {
	const render = () => (
		<div className="p-8">
			<ModalHarness />
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
			<ModalHarness submission />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-overlays-modal",
	name: "Modal",
	role: "Shared hosted-dialog system for portal, stacking, focus trap and return, dismissal, submission locking, Card surface, and modal slots.",
	importStatement:
		'import { ModalHost } from "@/components/ui/overlays/modal/ModalHost";\nimport { ModalCard } from "@/components/ui/overlays/modal/ModalCard";\nimport { ModalShell, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, useModalSubmission } from "@/components/ui/overlays/modal/ModalShell";\nimport { useModal } from "@/components/ui/overlays/modal/useModal";',
	chooseWhen: [
		"A focused custom dialog must participate in the application-wide modal host.",
	],
	chooseInstead: [
		"Use ConfirmationModal for confirm-before-action flows or ImageInspectModal for image inspection.",
	],
	compounds: [
		"ModalHost",
		"ModalShell",
		"ModalCard",
		"ModalHeader",
		"ModalTitle",
		"ModalDescription",
		"ModalContent",
		"ModalFooter",
		"useModal",
		"useModalSubmission",
	],
	exclusions: [
		"Raw modal events from @/lib/modal.",
		"Page-local dialog stacks.",
		"Panel or nested Card surfaces inside ModalShell.",
	],
	guarantees: [
		{
			label: "Hosted focus, Escape, and focus return",
			storyId: "ui-overlays-modal--hosted-focus-and-dismissal",
		},
		{
			label: "Submission close lock",
			storyId: "ui-overlays-modal--submission-close-lock",
		},
	],

	family: "UI",
	group: "Overlays",
	previewTargets: [
		{
			id: "hosted-focus-and-dismissal",
			name: "Hosted focus, Escape, and focus return",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview1,
		},
		{
			id: "submission-close-lock",
			name: "Submission close lock",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview2,
		},
	],
});
