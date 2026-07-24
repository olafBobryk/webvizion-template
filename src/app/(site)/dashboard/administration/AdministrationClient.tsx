"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import type {
	MembershipRole,
	OrganizationInvitation,
} from "@/lib/auth/contracts";
import type { OrganizationMemberEntity } from "../_lib/entities/member/domain";

import { InviteMemberModal } from "./AdministrationModals";
import { MembersTable, PendingInvitationsTable } from "./AdministrationTables";

export function AdministrationClient({
	actorMembershipId,
	actorRole,
	invitations,
	members,
	organizationName,
}: {
	actorMembershipId: string;
	actorRole: MembershipRole;
	invitations: readonly OrganizationInvitation[];
	members: readonly OrganizationMemberEntity[];
	organizationName: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { openModal } = useModal();
	const inviteOpenedRef = React.useRef(false);

	const openInvite = React.useCallback(() => {
		openModal(
			({ close, setCloseDisabled }) => (
				<InviteMemberModal
					actorRole={actorRole}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
					onSuccess={() => router.refresh()}
					organizationName={organizationName}
				/>
			),
			{
				ariaLabel: "Invite member",
				cardProps: { maxWidth: "xl" },
				id: "administration-invite-member",
			},
		);
	}, [actorRole, openModal, organizationName, router]);

	React.useEffect(() => {
		if (searchParams.get("action") !== "invite" || inviteOpenedRef.current)
			return;
		inviteOpenedRef.current = true;
		openInvite();
		router.replace(pathname, { scroll: false });
	}, [openInvite, pathname, router, searchParams]);

	return (
		<>
			<PendingInvitationsTable
				actorRole={actorRole}
				invitations={invitations}
				onInvite={openInvite}
				onRefresh={() => router.refresh()}
			/>
			<MembersTable
				actorMembershipId={actorMembershipId}
				actorRole={actorRole}
				members={members}
				onRefresh={() => router.refresh()}
			/>
		</>
	);
}
