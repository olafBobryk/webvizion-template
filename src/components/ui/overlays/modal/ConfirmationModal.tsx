"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import {
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	useModalSubmission,
} from "@/components/ui/overlays/modal/ModalShell";
import {
	Button,
	type ButtonTone,
	type ButtonVariant,
} from "@/components/ui/primitives/Button";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Text } from "@/components/ui/primitives/Text";

export type ConfirmationModalDetail = {
	description: string;
	label: string;
};

export type ConfirmationModalProps = {
	title: string;
	description: string;
	confirmLabel: string;
	confirmTone?: ButtonTone;
	confirmVariant?: ButtonVariant;
	details?: readonly ConfirmationModalDetail[];
	onConfirm: () => unknown;
	onClose: () => void;
	onCloseDisabledChange?: (disabled: boolean) => void;
	warning?: string;
};

export function ConfirmationModal({
	title,
	description,
	confirmLabel,
	confirmTone = "danger",
	confirmVariant = "secondary",
	details,
	onConfirm,
	onClose,
	warning,
}: ConfirmationModalProps) {
	const impactTitleId = React.useId();
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();

	async function handleConfirm() {
		if (!beginSubmission()) return;
		let shouldEndSubmission = true;
		try {
			const shouldClose = await onConfirm();
			if (shouldClose !== false) {
				onClose();
				shouldEndSubmission = false;
			}
		} finally {
			if (shouldEndSubmission) endSubmission();
		}
	}

	return (
		<>
			<ModalHeader
				closeDisabled={isSubmitting}
				leadingIcon={
					<Icon name="warning" size="sm" className="text-danger-text" />
				}
			>
				<ModalTitle>{title}</ModalTitle>
				<ModalDescription>{description}</ModalDescription>
			</ModalHeader>
			{details?.length || warning ? (
				<ModalContent className="grid gap-4">
					{details?.length ? (
						<section className="grid gap-3" aria-labelledby={impactTitleId}>
							<Text
								as="h3"
								className="font-medium"
								id={impactTitleId}
								variant="support"
							>
								What will change
							</Text>
							<dl className="grid">
								{details.map((detail) => (
									<div
										className="grid gap-1 border-t border-border/70 py-3 first:border-t-0 first:pt-0 last:pb-0"
										key={detail.label}
									>
										<dt className="text-sm font-medium leading-6">
											{detail.label}
										</dt>
										<dd className="text-sm leading-6 text-muted-foreground">
											{detail.description}
										</dd>
									</div>
								))}
							</dl>
						</section>
					) : null}
					{warning ? (
						<StatusMessage tone="danger">{warning}</StatusMessage>
					) : null}
				</ModalContent>
			) : null}
			<ModalFooter>
				<Button
					disabled={isSubmitting}
					onClick={onClose}
					type="button"
					variant="ghost"
				>
					Cancel
				</Button>
				<Button
					type="button"
					loading={isSubmitting}
					onClick={handleConfirm}
					tone={confirmTone}
					variant={confirmVariant}
				>
					{confirmLabel}
				</Button>
			</ModalFooter>
		</>
	);
}
