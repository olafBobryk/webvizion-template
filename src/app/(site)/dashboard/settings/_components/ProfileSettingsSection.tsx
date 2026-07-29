"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { ProfilePictureInput, TextInput } from "@/components/ui/input";
import { ProfilePicture } from "@/components/ui/misc";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import type { SessionUser } from "@/lib/api/auth";
import { showToast } from "@/lib/feedback";
import { useDashboardAuth } from "../../_components/providers/DashboardAuthProvider";

const MAX_PROFILE_PICTURE_SIZE_BYTES = 3 * 1024 * 1024;

function readFileAsDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
				return;
			}
			reject(new Error("Unable to read profile picture."));
		};
		reader.onerror = () => reject(new Error("Unable to read profile picture."));
		reader.readAsDataURL(file);
	});
}

function ProfileSettingsSectionRoot() {
	const { openModal } = useModal();
	const { updateUser, user } = useDashboardAuth();
	if (!user) return null;
	const currentUser = user;

	function openProfileEditor() {
		openModal(
			({ close, setCloseDisabled }) => (
				<ProfileEditModal
					initialName={currentUser.name}
					initialPictureUrl={currentUser.profilePictureUrl}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
					onUpdate={updateUser}
				/>
			),
			{
				ariaLabel: "Edit profile",
				cardProps: { maxWidth: "xl" },
				id: "account-profile-edit",
			},
		);
	}

	return (
		<Card className="scroll-mt-24" id="profile">
			<Card.Header className="border-b">
				<Card.Title className="inline-flex items-center gap-2">
					<Icon className="text-muted-foreground" name="user" size="sm" />
					Profile
				</Card.Title>
				<Card.Description>Profile settings</Card.Description>
				<Card.Action>
					<Button
						leadingIcon="pencil"
						onClick={openProfileEditor}
						size="sm"
						type="button"
						variant="ghost"
					>
						Edit profile
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<div className="flex min-w-0 items-center gap-3.5">
					<ProfilePicture
						alt={`${user.name || "User"} profile picture`}
						name={user.name}
						size="xl"
						src={user.profilePictureUrl}
					/>
					<div className="grid min-w-0 flex-1 gap-1">
						<Text as="h3" className="truncate" variant="headingXs">
							{user.name || "User"}
						</Text>
						<Text className="truncate" tone="muted" variant="support">
							{user.email || "Email unavailable"}
						</Text>
					</div>
				</div>
			</Card.Content>
		</Card>
	);
}

function ProfileSettingsSectionSkeleton() {
	const { user } = useDashboardAuth();
	if (!user) return null;

	return (
		<Card className="scroll-mt-24" id="profile">
			<Card.Header className="border-b">
				<Card.Title className="inline-flex items-center gap-2">
					<Icon className="text-muted-foreground" name="user" size="sm" />
					Profile
				</Card.Title>
				<Card.Description>Profile settings</Card.Description>
				<Card.Action>
					<Button.Skeleton leadingIcon size="sm" variant="ghost">
						Edit profile
					</Button.Skeleton>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<div className="flex min-w-0 items-center gap-3.5">
					<ProfilePicture.Skeleton size="xl" />
					<div className="grid min-w-0 flex-1 gap-1">
						<Text.Skeleton as="h3" className="truncate" variant="headingXs">
							{user.name || "User"}
						</Text.Skeleton>
						<Text.Skeleton className="truncate" tone="muted" variant="support">
							{user.email || "Email unavailable"}
						</Text.Skeleton>
					</div>
				</div>
			</Card.Content>
		</Card>
	);
}

export const ProfileSettingsSection = Object.assign(
	ProfileSettingsSectionRoot,
	{
		Skeleton: ProfileSettingsSectionSkeleton,
	},
);

function ProfileEditModal({
	initialName,
	initialPictureUrl,
	onClose,
	onCloseDisabledChange,
	onUpdate,
}: {
	initialName: string;
	initialPictureUrl?: string;
	onClose: () => void;
	onCloseDisabledChange: (disabled: boolean) => void;
	onUpdate: (patch: Partial<SessionUser>) => Promise<void>;
}) {
	const [name, setName] = React.useState(initialName);
	const [nameError, setNameError] = React.useState<string>();
	const [pictureError, setPictureError] = React.useState<string | null>(null);
	const [pendingPictureFile, setPendingPictureFile] =
		React.useState<File | null>(null);
	const [pictureUrl, setPictureUrl] = React.useState(initialPictureUrl);
	const [pictureRevision, setPictureRevision] = React.useState(0);
	const [pendingAction, setPendingAction] = React.useState<
		"profile" | "picture" | null
	>(null);
	const isPending = pendingAction !== null;

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
		if (!nextName) {
			setNameError("Enter a display name.");
			return;
		}
		if (pictureError) return;

		setPendingAction("profile");
		try {
			let nextPictureUrl = pictureUrl;
			if (pendingPictureFile) {
				nextPictureUrl = await readFileAsDataUrl(pendingPictureFile);
			}

			await showToast.promise(
				Promise.resolve().then(() =>
					onUpdate({
						name: nextName,
						profilePictureUrl: nextPictureUrl,
					}),
				),
				{
					loading: "Saving profile...",
					success: "Profile updated.",
					error: "Unable to update profile.",
				},
			);
			closeAfterMutation();
		} catch {
			// The shared promise toast already reports the failed mutation.
		} finally {
			setPendingAction(null);
		}
	}

	async function handleRemovePicture() {
		if (isPending || !pictureUrl) return;
		setPendingAction("picture");
		try {
			await showToast.promise(
				Promise.resolve().then(() =>
					onUpdate({ profilePictureUrl: undefined }),
				),
				{
					loading: "Removing picture...",
					success: "Profile picture removed.",
					error: "Unable to remove profile picture.",
				},
			);
			setPendingPictureFile(null);
			setPictureError(null);
			setPictureUrl(undefined);
			setPictureRevision((current) => current + 1);
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
				closeLabel="Close profile editor"
				leadingIcon={<Icon name="user" size="sm" />}
			>
				<ModalTitle>Edit profile</ModalTitle>
				<ModalDescription>
					Update the name and picture shown across the application.
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
								loading={pendingAction === "profile"}
								type="submit"
								variant="primary"
							>
								Save profile
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
					label="Display name"
					name="displayName"
					onChange={(value) => {
						setName(value);
						setNameError(undefined);
					}}
					required
					value={name}
				/>
				<div className="[&_[data-tone]]:gap-3 [&_label]:text-sm [&_label]:font-medium [&_label]:leading-none">
					<ProfilePictureInput
						currentUrl={pictureUrl}
						disabled={isPending}
						key={pictureRevision}
						layout="file-row"
						maxSizeBytes={MAX_PROFILE_PICTURE_SIZE_BYTES}
						name={name}
						onChange={setPendingPictureFile}
						onValidationError={setPictureError}
					/>
				</div>
			</ModalForm>
		</>
	);
}
