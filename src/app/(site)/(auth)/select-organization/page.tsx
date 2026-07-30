import { redirect } from "next/navigation";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "@/lib/auth/continuation";
import { applicationAdapters, resolveCurrentSession } from "@/lib/auth/server";
import { hrefFor, surfaceHref } from "@/lib/routes";
import { OrganizationSelectionCard } from "../../_components/organization/OrganizationSelectionCard";

export default async function SelectOrganizationPage({
	searchParams,
}: {
	searchParams: Promise<{ message?: string; next?: string; switch?: string }>;
}) {
	const query = await searchParams;
	const next = getSafeContinuationPath(query.next);
	const resolution = await resolveCurrentSession();
	if (resolution.status === "anonymous") {
		redirect(withSafeContinuation(hrefFor("auth.login"), next));
	}
	if (resolution.status === "membership-required") {
		redirect(
			surfaceHref(
				"auth.login",
				{},
				{
					search: { message: "membership-required", next },
				},
			),
		);
	}
	if (resolution.status === "resolved") {
		if (query.switch !== "1") redirect(next);
		redirect(
			surfaceHref("dashboard.organization.switch", {}, { search: { next } }),
		);
	}

	const choices = await Promise.all(
		resolution.memberships.map(async (membership) => ({
			membership,
			organization: await applicationAdapters.organizations.getOrganization(
				membership.organizationId,
			),
		})),
	);

	return (
		<OrganizationSelectionCard
			choices={choices.flatMap(({ membership, organization }) =>
				organization ? [{ membership, organization }] : [],
			)}
			description="Choose an organization to continue."
			headingIcon="building"
			message={query.message}
			next={next}
		/>
	);
}
