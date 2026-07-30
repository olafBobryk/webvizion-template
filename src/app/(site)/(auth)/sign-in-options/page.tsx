import { EmailInput } from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "@/lib/auth/continuation";
import { hrefFor } from "@/lib/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { requestUnavailableAuthMethodAction } from "../actions";

export default async function SignInOptionsPage({
	searchParams,
}: {
	searchParams: Promise<{ message?: string; next?: string }>;
}) {
	const query = await searchParams;
	const next = getSafeContinuationPath(query.next);
	return (
		<AuthScreen
			description="Enter your email address to receive a sign-in link."
			icon="link"
			message={query.message}
			title="Magic link"
		>
			<form action={requestUnavailableAuthMethodAction} className="grid gap-4">
				<input name="method" type="hidden" value="magic-link-sign-in" />
				<input name="next" type="hidden" value={next} />
				<input
					name="returnTo"
					type="hidden"
					value={hrefFor("auth.sign-in-options")}
				/>
				<EmailInput label="Email" name="email" required />
				<Button className="w-full" type="submit" variant="primary">
					Request magic link
				</Button>
			</form>
			<Button
				className="w-full"
				href={withSafeContinuation(hrefFor("auth.login"), next)}
				variant="ghost"
			>
				Use password
			</Button>
		</AuthScreen>
	);
}
