import { Button } from "@/components/ui/primitives/Button";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "@/lib/auth/continuation";
import { hrefFor } from "@/lib/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { PasswordRecoveryRequestForm } from "../_components/PasswordRecoveryRequestForm";

export default async function ForgotPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ message?: string; next?: string }>;
}) {
	const query = await searchParams;
	const next = getSafeContinuationPath(query.next);
	return (
		<AuthScreen
			description="Enter your email to receive a password reset link."
			icon="mail"
			message={query.message}
			title="Reset your password"
		>
			<PasswordRecoveryRequestForm />
			<Button
				className="w-full"
				href={withSafeContinuation(hrefFor("auth.login"), next)}
				variant="ghost"
			>
				Return to sign in
			</Button>
		</AuthScreen>
	);
}
