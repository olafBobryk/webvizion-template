"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { OrganizationAvatar } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationAvatar";
import { getOrganizationPresentation } from "@/app/(site)/dashboard/_lib/entities/organization/presentation";
import { Icon } from "@/components/ui/icons/Icon";
import { ProfilePictureInput, TextInput } from "@/components/ui/input";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";
import { AuthApiError } from "@/lib/api/auth";
import type { MembershipRole } from "@/lib/auth/contracts";
import { showToast } from "@/lib/feedback";

const MAX_ORGANIZATION_PICTURE_SIZE_BYTES = 3 * 1024 * 1024;

function normalizeSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function readFileAsDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
				return;
			}
			reject(new Error("Unable to read organization picture."));
		};
		reader.onerror = () =>
			reject(new Error("Unable to read organization picture."));
		reader.readAsDataURL(file);
	});
}

export function OrganizationEditModal({
	initialName,
	initialPictureUrl,
	initialSlug,
	membershipRole,
	organizationId,
	onClose,
	onCloseDisabledChange,
	onUpdate,
}: {
	initialName: string;
	initialPictureUrl?: string;
	initialSlug: string;
	membershipRole: MembershipRole;
	organizationId: string;
	onClose: () => void;
	onCloseDisabledChange: (disabled: boolean) => void;
	onUpdate: (patch: {
		name?: string;
		profilePictureUrl?: string | null;
		slug?: string;
	}) => Promise<void>;
}) {
	const router = useRouter();
	const [name, setName] = React.useState(initialName);
	const [slug, setSlug] = React.useState(initialSlug);
	const [nameError, setNameError] = React.useState<string>();
	const [slugError, setSlugError] = React.useState<string>();
	const [pictureError, setPictureError] = React.useState<string | null>(null);
	const [pendingPictureFile, setPendingPictureFile] =
		React.useState<File | null>(null);
	const [pictureUrl, setPictureUrl] = React.useState(initialPictureUrl);
	const [pictureRevision, setPictureRevision] = React.useState(0);
	const [pendingAction, setPendingAction] = React.useState<
		"organization" | "picture" | null
	>(null);
	const isPending = pendingAction !== null;
	const picturePresentation = getOrganizationPresentation({
		id: organizationId,
		name,
		profilePictureUrl: pictureUrl ?? null,
		role: membershipRole,
		slug,
	});

	React.useEffect(() => {
		onCloseDisabledChange(isPending);
		return () => onCloseDisabledChange(false);
	}, [isPending, onCloseDisabledChange]);

	function closeAfterMutation() {
		onCloseDisabledChange(false);
		onClose();
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isPending) return;

		const nextName = name.trim();
		const nextSlug = normalizeSlug(slug);
		if (!nextName) {
			setNameError("Enter an organization name.");
			return;
		}
		if (!nextSlug) {
			setSlugError("Enter an organization slug.");
			return;
		}
		if (pictureError) return;

		setPendingAction("organization");
		try {
			const profilePictureUrl = pendingPictureFile
				? await readFileAsDataUrl(pendingPictureFile)
				: undefined;
			await showToast.promise(
				onUpdate({ name: nextName, profilePictureUrl, slug: nextSlug }),
				{
					loading: "Saving organization...",
					success: "Organization updated.",
					error: "Unable to update organization.",
				},
			);
			router.refresh();
			closeAfterMutation();
		} catch (error) {
			if (
				error instanceof AuthApiError &&
				error.code === "organization-slug-conflict"
			) {
				setSlugError(error.message);
			} else {
				setNameError("Unable to save organization details.");
			}
		} finally {
			setPendingAction(null);
		}
	}

	async function handleRemovePicture() {
		if (isPending || !pictureUrl) return;
		setPendingAction("picture");
		try {
			await showToast.promise(onUpdate({ profilePictureUrl: null }), {
				loading: "Removing picture...",
				success: "Organization picture removed.",
				error: "Unable to remove organization picture.",
			});
			setPendingPictureFile(null);
			setPictureError(null);
			setPictureUrl(undefined);
			setPictureRevision((current) => current + 1);
			router.refresh();
		} catch {
			// The shared promise toast already reports the failed mutation.
		} finally {
			setPendingAction(null);
		}
	}

	return (
		<>
			<ModalHeader
				closeDisabled={isPending}
				closeLabel="Close organization editor"
				leadingIcon={<Icon name="building" size="sm" />}
			>
				<ModalTitle>Edit organization</ModalTitle>
				<ModalDescription>
					Update the name, slug, and picture shown across the dashboard.
				</ModalDescription>
			</ModalHeader>
			<ModalForm
				contentClassName="grid gap-4"
				footer={
					<>
						{pictureUrl ? (
							<Button
								disabled={isPending}
								leadingIcon="trash"
								loading={pendingAction === "picture"}
								onClick={handleRemovePicture}
								tone="danger"
								type="button"
								variant="secondary"
							>
								Remove picture
							</Button>
						) : (
							<span />
						)}
						<div className="flex flex-wrap gap-2">
							<Button
								disabled={isPending}
								onClick={onClose}
								type="button"
								variant="ghost"
							>
								Cancel
							</Button>
							<Button
								leadingIcon="pencil"
								loading={pendingAction === "organization"}
								type="submit"
								variant="primary"
							>
								Save organization
							</Button>
						</div>
					</>
				}
				footerClassName="flex-wrap justify-between"
				onSubmit={handleSubmit}
			>
				<TextInput
					className="gap-1.5 [&_label]:text-sm [&_label]:font-medium [&_label]:leading-none"
					disabled={isPending}
					error={nameError}
					label="Organization name"
					name="organizationName"
					onChange={(value) => {
						setName(value);
						setNameError(undefined);
					}}
					required
					value={name}
				/>
				<TextInput
					className="gap-1.5 [&_label]:text-sm [&_label]:font-medium [&_label]:leading-none"
					disabled={isPending}
					error={slugError}
					label="Organization slug"
					name="organizationSlug"
					onChange={(value) => {
						setSlug(value);
						setSlugError(undefined);
					}}
					required
					value={slug}
				/>
				<div className="[&_[data-tone]]:gap-3 [&_label]:text-sm [&_label]:font-medium [&_label]:leading-none">
					<ProfilePictureInput
						currentUrl={pictureUrl}
						disabled={isPending}
						key={pictureRevision}
						layout="file-row"
						maxSizeBytes={MAX_ORGANIZATION_PICTURE_SIZE_BYTES}
						name={name}
						onChange={setPendingPictureFile}
						onValidationError={setPictureError}
						renderPreview={({ className, size, src }) => (
							<OrganizationAvatar
								alt={picturePresentation.avatarAlt}
								className={className}
								colorIndex={picturePresentation.avatarColorIndex}
								imageUrl={src}
								initials={picturePresentation.initials}
								size={size === "2xl" ? "xl" : size}
							/>
						)}
					/>
				</div>
			</ModalForm>
		</>
	);
}
