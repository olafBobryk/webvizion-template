import { notFound } from "next/navigation";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { getReferenceMember } from "../../../_lib/fixtures/reference-members.server";
import { requireDashboardCapability } from "../../../_registry/access.server";
import { OrganizationMemberSurface } from "./_components/OrganizationMemberSurface";

export default async function DashboardMemberDetailPage({
	params,
}: {
	params: Promise<{ memberId: string }>;
}) {
	const { memberId } = await params;
	const { context } = await requireDashboardCapability("organization.read");
	const member = getReferenceMember(context.organization.id, memberId);
	if (!member) notFound();
	const presentation = getMemberPresentation(member);
	return (
		<OrganizationMemberSurface
			isOwnProfile={context.user.id === member.user.id}
			member={member}
			presentation={presentation}
		/>
	);
}
