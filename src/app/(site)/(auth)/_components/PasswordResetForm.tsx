"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { PasswordInput } from "@/components/ui/input";
import { ErrorState } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { AuthApiError, resetPassword } from "@/lib/api/auth";
import { showToast } from "@/lib/feedback";

function PasswordResetFormRoot({ token }: { token?: string }) {
	const router = useRouter();
	const [password, setPassword] = React.useState("");
	const [passwordConfirm, setPasswordConfirm] = React.useState("");
	const [passwordError, setPasswordError] = React.useState<string>();
	const [passwordConfirmError, setPasswordConfirmError] =
		React.useState<string>();
	const [fatalError, setFatalError] = React.useState<string>();
	const [pending, setPending] = React.useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		if (!token) {
			setFatalError("This password reset link is not valid.");
			return;
		}
		if (password.length < 8) {
			setPasswordError("Use at least 8 characters.");
			return;
		}
		if (password !== passwordConfirm) {
			setPasswordConfirmError("The passwords do not match.");
			return;
		}
		setPending(true);
		setPasswordError(undefined);
		setPasswordConfirmError(undefined);
		try {
			await resetPassword({ password, token });
			router.replace("/login?message=password-reset");
		} catch (nextError) {
			if (
				nextError instanceof AuthApiError &&
				(nextError.code === "password-recovery-invalid" ||
					nextError.code === "password-recovery-expired")
			) {
				setFatalError(nextError.message);
				return;
			}
			showToast.error(
				nextError instanceof Error
					? nextError.message
					: "Unable to reset your password.",
			);
		} finally {
			setPending(false);
		}
	}

	if (fatalError) {
		return (
			<ErrorState
				action={
					<Button href="/forgot-password" size="sm" variant="secondary">
						Request a new link
					</Button>
				}
				description={fatalError}
				layout="stacked"
				title="Reset link unavailable"
			/>
		);
	}

	return (
		<form className="grid gap-4" noValidate onSubmit={handleSubmit}>
			<PasswordInput
				autoComplete="new-password"
				disabled={pending}
				error={passwordError}
				label="New password"
				name="password"
				onChange={(value) => {
					setPassword(value);
					setPasswordError(undefined);
				}}
				required
				showStrength
				value={password}
			/>
			<PasswordInput
				autoComplete="new-password"
				disabled={pending}
				error={passwordConfirmError}
				label="Confirm password"
				name="passwordConfirm"
				onChange={(value) => {
					setPasswordConfirm(value);
					setPasswordConfirmError(undefined);
				}}
				required
				value={passwordConfirm}
			/>
			<Button
				className="w-full"
				loading={pending}
				type="submit"
				variant="primary"
			>
				Update password
			</Button>
		</form>
	);
}

function PasswordResetFormSkeleton() {
	return (
		<div className="grid gap-4">
			<PasswordInput.Skeleton
				label="New password"
				required
				showStrength
				value="a-secure-password"
			/>
			<PasswordInput.Skeleton
				label="Confirm password"
				required
				value="a-secure-password"
			/>
			<Button.Skeleton className="w-full" variant="primary">
				Update password
			</Button.Skeleton>
		</div>
	);
}

export const PasswordResetForm = Object.assign(PasswordResetFormRoot, {
	Skeleton: PasswordResetFormSkeleton,
});
