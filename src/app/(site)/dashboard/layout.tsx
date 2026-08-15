import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siteMetadata } from "@/config/metadataConfig";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "@/lib/auth/continuation";
import { applicationAdapters, resolveCurrentSession } from "@/lib/auth/server";
import { createPrivateRouteMetadata } from "@/lib/metadata";
import { hrefFor, surfaceHref } from "@/lib/routes";
import { DashboardFrame } from "./_components/layout/DashboardFrame";
import { DashboardProviders } from "./_components/providers/DashboardProviders";
import { formatMemberJoinedDate } from "./_lib/entities/member/presentation";
import { getDashboardSurface } from "./_registry/surfaceRegistry";

export async function generateMetadata(): Promise<Metadata> {
	const requestPath =
		(await headers()).get("x-template-request-path")?.split(/[?#]/, 1)[0] ??
		hrefFor("dashboard.overview");
	const surface = getDashboardSurface(requestPath);

	return createPrivateRouteMetadata({
		description: surface?.description ?? siteMetadata.defaultDescription,
		path: surface ? requestPath : hrefFor("dashboard.overview"),
		title: surface?.label ?? "Dashboard",
	});
}

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const requestPath = getSafeContinuationPath(
		(await headers()).get("x-template-request-path"),
		hrefFor("dashboard.overview"),
	);
	const resolution = await resolveCurrentSession();
	if (resolution.status === "anonymous") {
		redirect(withSafeContinuation(hrefFor("auth.login"), requestPath));
	}
	if (resolution.status === "organization-selection-required") {
		redirect(
			withSafeContinuation(hrefFor("auth.select-organization"), requestPath),
		);
	}
	if (resolution.status === "membership-required") {
		redirect(
			surfaceHref(
				"auth.login",
				{},
				{
					search: { message: "membership-required", next: requestPath },
				},
			),
		);
	}

	const initialUser = {
		id: resolution.user.id,
		name: resolution.user.name,
		email: resolution.user.email,
		role: resolution.membership.role,
		isBanned: resolution.user.isBanned,
		platformRole: resolution.user.platformRole,
		profilePictureUrl: resolution.user.profilePictureUrl,
	};
	const settingsSnapshot = {
		authMethods: applicationAdapters.auth.methods,
		identities: resolution.user.identities.map((identity) => ({ ...identity })),
		joinedAtLabel: formatMemberJoinedDate(resolution.membership.createdAt),
	};
	const organizationChoices = (
		await Promise.all(
			resolution.memberships.map(async (membership) => ({
				membership,
				organization: await applicationAdapters.organizations.getOrganization(
					membership.organizationId,
				),
			})),
		)
	).flatMap(({ membership, organization }) =>
		organization ? [{ membership, organization }] : [],
	);

	return (
		<DashboardProviders
			initialMembership={resolution.membership}
			initialMemberships={resolution.memberships}
			initialOrganization={resolution.organization}
			initialOrganizationChoices={organizationChoices}
			initialUser={initialUser}
			settingsSnapshot={settingsSnapshot}
		>
			<DashboardFrame>{children}</DashboardFrame>
		</DashboardProviders>
	);
}
