"use client";

import * as React from "react";
import { EmailInput } from "@/components/ui/input";
import { StateIndicator } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { requestPasswordRecovery } from "@/lib/api/auth";
import { showToast } from "@/lib/feedback";

function PasswordRecoveryRequestFormRoot() {
	const [email, setEmail] = React.useState("");
	const [emailError, setEmailError] = React.useState<string>();
	const [pending, setPending] = React.useState(false);
	const [previewUrl, setPreviewUrl] = React.useState<string>();
	const [success, setSuccess] = React.useState<string>();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (pending) return;
		if (!email.trim()) {
			setEmailError("Enter your email.");
			return;
		}
		setPending(true);
		setEmailError(undefined);
		setPreviewUrl(undefined);
		try {
			const result = await requestPasswordRecovery(email);
			setSuccess(result.message);
			setPreviewUrl(result.previewUrl);
		} catch (nextError) {
			showToast.error(
				nextError instanceof Error
					? nextError.message
					: "Unable to request a password reset.",
			);
		} finally {
			setPending(false);
		}
	}

	if (success) {
		return (
			<StateIndicator
				action={
					previewUrl ? (
						<Button href={previewUrl} size="sm" variant="secondary">
							Open fixture reset link
						</Button>
					) : null
				}
				description={success}
				iconName="mail"
				layout="stacked"
				title="Check your email"
			/>
		);
	}

	return (
		<form className="grid gap-4" noValidate onSubmit={handleSubmit}>
			<EmailInput
				disabled={pending}
				error={emailError}
				label="Email"
				name="email"
				onChange={(value) => {
					setEmail(value);
					setEmailError(undefined);
				}}
				required
				value={email}
			/>
			<Button
				className="w-full"
				loading={pending}
				type="submit"
				variant="primary"
			>
				Send recovery link
			</Button>
		</form>
	);
}

function PasswordRecoveryRequestFormSkeleton() {
	return (
		<div className="grid gap-4">
			<EmailInput.Skeleton label="Email" required />
			<Button.Skeleton className="w-full" variant="primary">
				Send recovery link
			</Button.Skeleton>
		</div>
	);
}

export const PasswordRecoveryRequestForm = Object.assign(
	PasswordRecoveryRequestFormRoot,
	{ Skeleton: PasswordRecoveryRequestFormSkeleton },
);
