import { ErrorState } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { toPublicAuthError } from "@/lib/auth/errors";
import { validatePasswordRecoveryToken } from "@/lib/auth/server";
import { AuthScreen } from "../_components/AuthScreen";
import { PasswordResetForm } from "../_components/PasswordResetForm";

export default async function ResetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ message?: string; token?: string }>;
}) {
	const query = await searchParams;
	let recoveryError: string | undefined;
	if (!query.token) {
		recoveryError = "This password reset link is not valid.";
	} else {
		try {
			await validatePasswordRecoveryToken({ token: query.token });
		} catch (error) {
			recoveryError = toPublicAuthError(error).message;
		}
	}

	return (
		<AuthScreen
			description="Choose a new password for your account."
			icon="lock"
			message={query.message}
			title="Choose a new password"
		>
			{recoveryError ? (
				<ErrorState
					action={
						<Button href="/forgot-password" size="sm" variant="secondary">
							Request a new link
						</Button>
					}
					description={recoveryError}
					layout="stacked"
					title="Reset link unavailable"
				/>
			) : (
				<PasswordResetForm token={query.token} />
			)}
		</AuthScreen>
	);
}
