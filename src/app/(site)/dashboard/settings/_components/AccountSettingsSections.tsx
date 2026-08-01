"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { requestPasswordRecovery } from "@/lib/api/auth";
import { showToast } from "@/lib/feedback";
import { hrefFor } from "@/lib/routes";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { useDashboardAuth } from "../../_components/providers/DashboardAuthProvider";
import type { DashboardSettingsSnapshot } from "./settingsSnapshot";

export {
	AccountDetailsSettingsSection,
	DashboardSettingsHeaderActions,
} from "./AccountIdentitySettingsSections";

function SecuritySettingsSectionRoot({
	authMethods,
	identities,
}: Pick<DashboardSettingsSnapshot, "authMethods" | "identities">) {
	const { user } = useDashboardAuth();
	if (!user) return null;

	const passwordEnabled =
		authMethods["password-sign-in"].available &&
		identities.some((identity) => identity.provider === "password");
	const externalIdentities = identities.filter(
		(identity) => identity.provider !== "password",
	);

	return (
		<Card className="scroll-mt-24" id="security-sign-in">
			<Card.Heading
				action={<DashboardSignOutButton />}
				description="Password, recovery, identity, and session status for this account."
				leading={
					<Icon className="text-muted-foreground" name="lock" size="sm" />
				}
				title="Security and sign-in"
			/>
			<Card.Content>
				<dl className="grid">
					<SignInMethodRow
						action={
							authMethods["password-recovery"].available ? (
								<PasswordRecoveryModalButton email={user.email} />
							) : null
						}
						icon={<Icon name="lock" size="sm" />}
						label="Password"
						value={passwordEnabled ? "Enabled" : "Unavailable"}
					/>
					<SignInMethodRow
						icon={<Icon name="mail" size="sm" />}
						label="Magic link"
						value={
							authMethods["magic-link-sign-in"].available
								? "Available"
								: "Unavailable"
						}
					/>
					{externalIdentities.map((identity) => (
						<SignInMethodRow
							icon={<Icon name="link" size="sm" />}
							key={identity.id}
							label={identity.provider}
							value={identity.verified ? "Connected" : "Verification required"}
						/>
					))}
				</dl>
			</Card.Content>
		</Card>
	);
}

function SecuritySettingsSectionSkeleton({
	authMethods,
	identities,
}: Pick<DashboardSettingsSnapshot, "authMethods" | "identities">) {
	const { user } = useDashboardAuth();
	if (!user) return null;
	const passwordEnabled =
		authMethods["password-sign-in"].available &&
		identities.some((identity) => identity.provider === "password");
	const externalIdentities = identities.filter(
		(identity) => identity.provider !== "password",
	);

	return (
		<Card className="scroll-mt-24" id="security-sign-in">
			<Card.Heading
				action={<DashboardSignOutButton />}
				description="Password, recovery, identity, and session status for this account."
				leading={
					<Icon className="text-muted-foreground" name="lock" size="sm" />
				}
				title="Security and sign-in"
			/>
			<Card.Content>
				<dl className="grid">
					<SignInMethodRowSkeleton
						action={
							authMethods["password-recovery"].available ? (
								<PasswordRecoveryModalButton email={user.email} />
							) : null
						}
						icon={<Icon name="lock" size="sm" />}
						label="Password"
						value={passwordEnabled ? "Enabled" : "Unavailable"}
					/>
					<SignInMethodRowSkeleton
						icon={<Icon name="mail" size="sm" />}
						label="Magic link"
						value={
							authMethods["magic-link-sign-in"].available
								? "Available"
								: "Unavailable"
						}
					/>
					{externalIdentities.map((identity) => (
						<SignInMethodRowSkeleton
							icon={<Icon name="link" size="sm" />}
							key={identity.id}
							label={identity.provider}
							value={identity.verified ? "Connected" : "Verification required"}
						/>
					))}
				</dl>
			</Card.Content>
		</Card>
	);
}

export const SecuritySettingsSection = Object.assign(
	SecuritySettingsSectionRoot,
	{ Skeleton: SecuritySettingsSectionSkeleton },
);

function DashboardSignOutButton() {
	const router = useRouter();
	const { loading, logout } = useDashboardAuth();

	async function handleSignOut() {
		if (loading) return;
		try {
			await showToast.promise(logout(), {
				loading: "Signing out...",
				success: "Signed out.",
				error: "Unable to sign out.",
			});
			router.replace(hrefFor("auth.login"));
			router.refresh();
		} catch {
			// The shared promise toast already reports the failed mutation.
		}
	}

	return (
		<Button
			leadingIcon="log-out"
			loading={loading}
			onClick={handleSignOut}
			size="sm"
			tone="danger"
			type="button"
			variant="secondary"
		>
			Sign out
		</Button>
	);
}

function SignInMethodRow({
	action,
	icon,
	label,
	value,
}: {
	action?: React.ReactNode;
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex flex-col gap-3 border-t border-border/70 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
			<DashboardDetailField icon={icon} label={label} value={value} />
			{action ? (
				<div className="flex shrink-0 justify-start sm:justify-end">
					{action}
				</div>
			) : null}
		</div>
	);
}

function SignInMethodRowSkeleton({
	action,
	icon,
	label,
	value,
}: {
	action?: React.ReactNode;
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex flex-col gap-3 border-t border-border/70 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
			<DashboardDetailField.Skeleton icon={icon} label={label} value={value} />
			{action ? (
				<div className="flex shrink-0 justify-start sm:justify-end">
					{action}
				</div>
			) : null}
		</div>
	);
}

function PasswordRecoveryModalButton({ email }: { email: string }) {
	const { openModal } = useModal();

	function openPasswordRecoveryModal() {
		openModal(
			({ close, setCloseDisabled }) => (
				<PasswordRecoveryModal
					email={email}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
				/>
			),
			{
				ariaLabel: "Reset password",
				id: "account-password-recovery",
			},
		);
	}

	return (
		<Button
			leadingIcon="lock"
			onClick={openPasswordRecoveryModal}
			size="sm"
			type="button"
			variant="ghost"
		>
			Reset password
		</Button>
	);
}

function PasswordRecoveryModal({
	email,
	onClose,
	onCloseDisabledChange,
}: {
	email: string;
	onClose: () => void;
	onCloseDisabledChange: (disabled: boolean) => void;
}) {
	const [pending, setPending] = React.useState(false);

	React.useEffect(() => {
		onCloseDisabledChange(pending);
		return () => onCloseDisabledChange(false);
	}, [onCloseDisabledChange, pending]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		setPending(true);
		try {
			const result = await showToast.promise(requestPasswordRecovery(email), {
				loading: "Requesting password reset...",
				success: "Password reset link requested.",
				error: "Unable to request a password reset.",
			});
			if (result.previewUrl) {
				window.location.assign(result.previewUrl);
				return;
			}
			onClose();
		} catch {
			// The shared promise toast already reports the failed request.
		} finally {
			setPending(false);
		}
	}

	return (
		<>
			<ModalHeader
				closeDisabled={pending}
				closeLabel="Close password reset"
				leadingIcon={<Icon name="lock" size="sm" />}
			>
				<ModalTitle>Reset password</ModalTitle>
				<ModalDescription>
					We will send a password reset link to {email}.
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
						<Button
							leadingIcon="lock"
							loading={pending}
							type="submit"
							variant="primary"
						>
							Send reset link
						</Button>
					</>
				}
				onSubmit={handleSubmit}
			>
				<p className="text-sm text-muted-foreground">
					For your security, all active sessions will end when the new password
					is set.
				</p>
			</ModalForm>
		</>
	);
}
