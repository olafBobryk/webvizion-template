import { redirect } from "next/navigation";
import { EmailInput, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import Divider from "@/components/ui/primitives/Divider";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "@/lib/auth/continuation";
import { resolveCurrentSession } from "@/lib/auth/server";
import { hrefFor } from "@/lib/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { enterDemoAction, signInAction } from "../actions";

type LoginPageProps = {
	searchParams: Promise<{ message?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const query = await searchParams;
	const next = getSafeContinuationPath(query.next);
	const resolution = await resolveCurrentSession();
	if (resolution.status === "resolved") redirect(next);
	if (resolution.status === "organization-selection-required") {
		redirect(withSafeContinuation(hrefFor("auth.select-organization"), next));
	}

	return (
		<AuthScreen
			description="Sign in to continue to your dashboard."
			icon="lock"
			message={query.message}
			title="Sign in"
		>
			<form action={signInAction} className="grid gap-4">
				<input name="next" type="hidden" value={next} />
				<EmailInput
					defaultValue="operator@averlo.local"
					label="Email"
					name="email"
					required
				/>
				<PasswordInput
					autoComplete="current-password"
					defaultValue="demo-password"
					label="Password"
					labelAction={
						<Button
							href={withSafeContinuation(hrefFor("auth.forgot-password"), next)}
							size="none"
							textVariant="caption"
							variant="ghost"
							className="text-muted-foreground"
						>
							Forgot password?
						</Button>
					}
					name="password"
					required
				/>
				<Button className="w-full" type="submit" variant="primary">
					Sign in
				</Button>
			</form>
			<Divider>or</Divider>
			<form action={enterDemoAction}>
				<input name="next" type="hidden" value={next} />
				<Button className="w-full" type="submit" variant="secondary">
					Enter demo organization
				</Button>
			</form>
			<Button
				className="w-full"
				href={withSafeContinuation(hrefFor("auth.sign-in-options"), next)}
				variant="ghost"
			>
				Use magic link
			</Button>
		</AuthScreen>
	);
}
