import { PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import { getSafeContinuationPath } from "@/lib/auth/continuation";
import { hrefFor } from "@/lib/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { requestUnavailableAuthMethodAction } from "../actions";

export default async function SetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ message?: string; next?: string }>;
}) {
	const query = await searchParams;
	const next = getSafeContinuationPath(query.next);
	return (
		<AuthScreen
			description="Choose a password to finish setting up your account."
			icon="lock"
			message={query.message}
			title="Finish account setup"
		>
			<form action={requestUnavailableAuthMethodAction} className="grid gap-4">
				<input name="method" type="hidden" value="password-update" />
				<input name="next" type="hidden" value={next} />
				<input
					name="returnTo"
					type="hidden"
					value={hrefFor("auth.set-password")}
				/>
				<PasswordInput
					autoComplete="new-password"
					label="New password"
					name="password"
					required
					showStrength
				/>
				<PasswordInput
					autoComplete="new-password"
					label="Confirm new password"
					name="passwordConfirm"
					required
				/>
				<Button className="w-full" type="submit" variant="primary">
					Set password
				</Button>
			</form>
		</AuthScreen>
	);
}
