import type { Metadata } from "next";
import { DashboardDetailField } from "@/app/(site)/dashboard/_components/detail/DashboardDetailField";
import { Icon } from "@/components/ui/icons/Icon";
import { ErrorState } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { getSafeContinuationPath } from "@/lib/auth/continuation";
import { toPublicAuthError } from "@/lib/auth/errors";
import { applicationAdapters } from "@/lib/auth/server";
import { hrefFor } from "@/lib/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { acceptInvitationAction } from "../actions";

export const metadata: Metadata = {
	referrer: "no-referrer",
};

export default async function InvitationPage({
	searchParams,
}: {
	searchParams: Promise<{
		invitation?: string;
		message?: string;
		next?: string;
		token?: string;
	}>;
}) {
	const query = await searchParams;
	const invitationId = query.invitation?.trim() ?? "";
	const tokenHash = query.token?.trim() ?? "";
	const next = getSafeContinuationPath(query.next);
	let invitation = null;
	let organization = null;
	let previewError: string | null = null;
	try {
		invitation = await applicationAdapters.invitations.previewInvitation({
			invitationId,
			tokenHash,
		});
		organization = await applicationAdapters.organizations.getOrganization(
			invitation.organizationId,
		);
	} catch (error) {
		previewError = toPublicAuthError(error).message;
	}

	return (
		<AuthScreen
			description="Review this invitation before joining the organization."
			icon="mail"
			message={query.message}
			title="Review invitation"
		>
			{invitation ? (
				<>
					<dl className="grid gap-4 sm:grid-cols-2">
						<DashboardDetailField
							icon={<Icon name="building" size="sm" />}
							label="Organization"
							value={organization?.name ?? invitation.organizationId}
						/>
						<DashboardDetailField
							icon={<Icon name="mail" size="sm" />}
							label="Recipient"
							value={invitation.email}
						/>
						<DashboardDetailField
							icon={<Icon name="shield" size="sm" />}
							label="Access"
							value={<span className="capitalize">{invitation.role}</span>}
						/>
					</dl>
					<form action={acceptInvitationAction} className="grid gap-3">
						<input name="invitation" type="hidden" value={invitationId} />
						<input name="token" type="hidden" value={tokenHash} />
						<input name="next" type="hidden" value={next} />
						<Button className="w-full" type="submit" variant="primary">
							Accept invitation
						</Button>
						<Button
							className="w-full"
							href={hrefFor("auth.login")}
							variant="ghost"
						>
							Return to sign in
						</Button>
					</form>
				</>
			) : (
				<ErrorState
					action={
						<Button href={hrefFor("auth.login")} size="sm" variant="secondary">
							Return to sign in
						</Button>
					}
					description={previewError ?? "This invitation link is incomplete."}
					layout="stacked"
					title="Invitation unavailable"
				/>
			)}
		</AuthScreen>
	);
}
