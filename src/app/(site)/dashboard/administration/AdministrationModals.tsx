"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { EmailInput, SelectInput } from "@/components/ui/input";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import {
	createOrganizationInvitation,
	transferOrganizationOwnership,
	updateOrganizationMembershipRole,
} from "@/lib/api/auth";
import type { MembershipRole } from "@/lib/auth/contracts";
import { showToast } from "@/lib/feedback";

type EditableRole = Exclude<MembershipRole, "owner">;

export function InviteMemberModal({
	actorRole,
	onClose,
	onCloseDisabledChange,
	onSuccess,
	organizationName,
}: {
	actorRole: MembershipRole;
	onClose: () => void;
	onCloseDisabledChange: (disabled: boolean) => void;
	onSuccess: () => void;
	organizationName: string;
}) {
	const [email, setEmail] = React.useState("");
	const [role, setRole] = React.useState<EditableRole>("member");
	const [error, setError] = React.useState<string>();
	const [pending, setPending] = React.useState(false);
	React.useEffect(() => {
		onCloseDisabledChange(pending);
		return () => onCloseDisabledChange(false);
	}, [onCloseDisabledChange, pending]);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		if (!email.trim()) {
			setError("Enter an email address.");
			return;
		}
		setPending(true);
		setError(undefined);
		try {
			await createOrganizationInvitation({ email: email.trim(), role });
			showToast.success("Invitation added to the local outbox.");
			onSuccess();
			onCloseDisabledChange(false);
			onClose();
		} catch (nextError) {
			setError(
				nextError instanceof Error
					? nextError.message
					: "Unable to create invitation.",
			);
		} finally {
			setPending(false);
		}
	}

	return (
		<>
			<ModalHeader
				closeDisabled={pending}
				closeLabel="Close invitation form"
				leadingIcon={<Icon name="plus" size="sm" />}
			>
				<ModalTitle>Invite member</ModalTitle>
				<ModalDescription>
					Add an invitation for {organizationName}. No email is sent by the
					fixture.
				</ModalDescription>
			</ModalHeader>
			<ModalForm
				contentClassName="grid gap-4"
				footer={
					<>
						<Button
							disabled={pending}
							onClick={onClose}
							type="button"
							variant="ghost"
						>
							Cancel
						</Button>
						<Button loading={pending} type="submit" variant="primary">
							Create invitation
						</Button>
					</>
				}
				onSubmit={submit}
			>
				<EmailInput
					error={error}
					label="Email"
					onChange={(value) => {
						setEmail(value);
						setError(undefined);
					}}
					required
					value={email}
				/>
				<SelectInput<EditableRole>
					disabled={pending}
					dropdownPositionStrategy="fixed"
					label="Role"
					onChange={setRole}
					options={
						actorRole === "owner"
							? [
									{ label: "Member", value: "member" },
									{ label: "Admin", value: "admin" },
								]
							: [{ label: "Member", value: "member" }]
					}
					value={role}
				/>
			</ModalForm>
		</>
	);
}

export function MemberRoleModal({
	initialRole,
	memberId,
	memberLabel,
	onClose,
	onCloseDisabledChange,
	onSuccess,
}: {
	initialRole: EditableRole;
	memberId: string;
	memberLabel: string;
	onClose: () => void;
	onCloseDisabledChange: (disabled: boolean) => void;
	onSuccess: () => void;
}) {
	const [role, setRole] = React.useState(initialRole);
	const [pending, setPending] = React.useState(false);
	React.useEffect(() => {
		onCloseDisabledChange(pending);
		return () => onCloseDisabledChange(false);
	}, [onCloseDisabledChange, pending]);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		setPending(true);
		try {
			await showToast.promise(
				updateOrganizationMembershipRole(memberId, role),
				{
					loading: "Saving role...",
					success: "Member role updated.",
					error: "Unable to update member role.",
				},
			);
			onSuccess();
			onCloseDisabledChange(false);
			onClose();
		} catch {
			// The shared promise toast reports the failed mutation.
		} finally {
			setPending(false);
		}
	}

	return (
		<>
			<ModalHeader
				closeDisabled={pending}
				closeLabel="Close role editor"
				leadingIcon={<Icon name="shield" size="sm" />}
			>
				<ModalTitle>Change member role</ModalTitle>
				<ModalDescription>
					Set the organization role for {memberLabel}.
				</ModalDescription>
			</ModalHeader>
			<ModalForm
				footer={
					<>
						<Button
							disabled={pending}
							onClick={onClose}
							type="button"
							variant="ghost"
						>
							Cancel
						</Button>
						<Button loading={pending} type="submit" variant="primary">
							Save role
						</Button>
					</>
				}
				onSubmit={submit}
			>
				<SelectInput<EditableRole>
					disabled={pending}
					dropdownPositionStrategy="fixed"
					label="Role"
					onChange={setRole}
					options={[
						{ label: "Member", value: "member" },
						{ label: "Admin", value: "admin" },
					]}
					value={role}
				/>
			</ModalForm>
		</>
	);
}

export function OwnershipTransferModal({
	memberId,
	memberLabel,
	onClose,
	onCloseDisabledChange,
	onSuccess,
}: {
	memberId: string;
	memberLabel: string;
	onClose: () => void;
	onCloseDisabledChange: (disabled: boolean) => void;
	onSuccess: () => void;
}) {
	const [pending, setPending] = React.useState(false);
	React.useEffect(() => {
		onCloseDisabledChange(pending);
		return () => onCloseDisabledChange(false);
	}, [onCloseDisabledChange, pending]);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		setPending(true);
		try {
			await showToast.promise(transferOrganizationOwnership(memberId), {
				loading: "Transferring ownership...",
				success: "Ownership transferred.",
				error: "Unable to transfer ownership.",
			});
			onSuccess();
			onCloseDisabledChange(false);
			onClose();
		} catch {
			// The shared promise toast reports the failed mutation.
		} finally {
			setPending(false);
		}
	}

	return (
		<>
			<ModalHeader
				closeDisabled={pending}
				closeLabel="Close ownership transfer"
				leadingIcon={<Icon name="lock" size="sm" />}
			>
				<ModalTitle>Transfer ownership</ModalTitle>
				<ModalDescription>
					Make {memberLabel} the organization owner.
				</ModalDescription>
			</ModalHeader>
			<ModalForm
				footer={
					<>
						<Button
							disabled={pending}
							onClick={onClose}
							type="button"
							variant="ghost"
						>
							Cancel
						</Button>
						<Button
							loading={pending}
							tone="danger"
							type="submit"
							variant="secondary"
						>
							Transfer ownership
						</Button>
					</>
				}
				onSubmit={submit}
			>
				<StatusMessage tone="warning">
					Your role changes to Admin immediately. Only the new owner can
					transfer ownership again.
				</StatusMessage>
			</ModalForm>
		</>
	);
}
