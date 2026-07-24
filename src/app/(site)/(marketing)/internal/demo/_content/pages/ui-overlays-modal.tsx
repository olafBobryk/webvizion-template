"use client";

import { Icon } from "@/components/ui/icons/Icon";
import {
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import { useImageInspectModal } from "@/components/ui/overlays/modal/useImageInspectModal";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
import { showToast } from "@/lib/feedback";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiOverlaysModalDemoPage: DemoPage = {
	id: "ui-overlays-modal",
	slug: ["ui", "overlays", "modal"],
	title: "UI Overlays: Modal",
	description: "Modals + hooks",
	groups: [
		{
			id: "modals",
			title: "Modals",
			description: "Portals, modals, hooks",
			items: [
				{
					id: "use-modal",
					kind: "component",
					name: "useModal",
					label: "Open modal",
					related: relatedMap.useModal,
					Render() {
						const { openModal, closeAll } = useModal();

						return (
							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									variant="primary"
									onClick={() =>
										openModal(
											({ close }) => (
												<>
													<ModalHeader
														leadingIcon={<Icon name="cards" size="sm" />}
													>
														<ModalTitle>Modal content</ModalTitle>
													</ModalHeader>
													<ModalContent>
														<Text variant="body" tone="muted">
															Opened via useModal.
														</Text>
													</ModalContent>
													<ModalFooter>
														<Button onClick={close}>Close</Button>
													</ModalFooter>
												</>
											),
											{ ariaLabel: "Modal content" },
										)
									}
								>
									Open modal
								</Button>
								<Button size="sm" variant="ghost" onClick={closeAll}>
									Close all
								</Button>
							</div>
						);
					},
				},
				{
					id: "use-confirmation-modal",
					kind: "component",
					name: "useConfirmationModal",
					label: "Confirmation dialog",
					related: relatedMap.useConfirmationModal,
					Render() {
						const { openConfirmation } = useConfirmationModal();

						return (
							<Button
								size="sm"
								variant="secondary"
								onClick={() =>
									openConfirmation({
										title: "Delete item?",
										description: "This cannot be undone.",
										confirmLabel: "Delete",
										onConfirm: async () => {
											await new Promise((resolve) => setTimeout(resolve, 400));
											showToast.success("Deleted (stub).", {
												title: "Done",
											});
										},
									})
								}
							>
								Open confirmation
							</Button>
						);
					},
				},
				{
					id: "use-image-inspect-modal",
					kind: "component",
					name: "useImageInspectModal",
					label: "Image inspect modal",
					related: relatedMap.useImageInspectModal,
					Render() {
						const { openImageInspect } = useImageInspectModal();

						return (
							<Button
								size="sm"
								variant="secondary"
								onClick={() =>
									openImageInspect({
										src: "/test/blob.png",
										alt: "Preview",
										// onShare: async () => showToast.info("Share clicked"),
									})
								}
							>
								Open image inspect
							</Button>
						);
					},
				},
			],
		},
	],
};
