"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import {
	refreshOrganizationInvitation,
	removeOrganizationMembership,
	revokeOrganizationInvitation,
} from "@/lib/api/auth";
import type {
	MembershipRole,
	OrganizationInvitation,
} from "@/lib/auth/contracts";
import { showToast } from "@/lib/feedback";
import { DashboardTablePanel } from "../_components/data/DashboardTablePanel";
import { DashboardEntityState } from "../_components/entities/DashboardEntityState";
import { MemberIdentity } from "../_components/entities/member/MemberIdentity";
import { MemberRoleChip } from "../_components/entities/member/MemberRoleChip";
import { getInvitationPresentation } from "../_lib/entities/invitation/presentation";
import type { OrganizationMemberEntity } from "../_lib/entities/member/domain";
import { getMemberPresentation } from "../_lib/entities/member/presentation";
import {
	MemberRoleModal,
	OwnershipTransferModal,
} from "./AdministrationModals";

export function PendingInvitationsTable({
	actorRole,
	invitations,
	onInvite,
	onRefresh,
}: {
	actorRole: MembershipRole;
	invitations: readonly OrganizationInvitation[];
	onInvite: () => void;
	onRefresh: () => void;
}) {
	return (
		<DashboardTablePanel
			columns={[
				{
					header: "Invitee",
					id: "invitee",
					render: (invitation) => (
						<span className="block min-w-0 truncate font-medium text-foreground">
							{invitation.email}
						</span>
					),
				},
				{
					header: "Role",
					id: "role",
					render: (invitation) => (
						<MemberRoleChip
							label={getInvitationPresentation(invitation).roleLabel}
							tone={invitation.role === "admin" ? "warning" : "neutral"}
						/>
					),
				},
				{
					header: "Sent",
					id: "sent",
					render: (invitation) =>
						getInvitationPresentation(invitation).sentAtLabel,
				},
				{
					header: "Expires",
					id: "expires",
					render: (invitation) =>
						getInvitationPresentation(invitation).expiresAtLabel,
				},
				{
					header: "Status",
					id: "status",
					render: (invitation) => {
						const status = getInvitationPresentation(invitation).status;
						return (
							<Chip color={status === "expired" ? "warning" : "muted"}>
								{status === "expired" ? "Expired" : "Pending"}
							</Chip>
						);
					},
				},
				{
					align: "right",
					header: "Action",
					id: "action",
					kind: "action",
					render: (invitation) => (
						<InvitationActions
							actorRole={actorRole}
							invitation={invitation}
							onRefresh={onRefresh}
						/>
					),
					sortable: false,
				},
			]}
			emptyState={
				<DashboardEntityState
					description="New invitations will appear here until they are accepted or revoked."
					iconName="mail"
					title="No pending invitations"
				/>
			}
			getRowKey={(invitation) => invitation.id}
			header={
				<Card.Header className="min-w-0">
					<Card.Title className="inline-flex min-w-0 items-center gap-2">
						<Icon name="mail" size="sm" />
						Pending invitations
					</Card.Title>
					<Card.Description className="min-w-0 break-words">
						Fixture deliveries stay local and expose a copyable invitation link.
					</Card.Description>
					<Card.Action>
						<Button
							leadingIcon="plus"
							onClick={onInvite}
							size="sm"
							type="button"
							variant="primary"
						>
							Invite member
						</Button>
					</Card.Action>
				</Card.Header>
			}
			id="pending-invitations"
			rows={invitations}
		/>
	);
}

function InvitationActions({
	actorRole,
	invitation,
	onRefresh,
}: {
	actorRole: MembershipRole;
	invitation: OrganizationInvitation;
	onRefresh: () => void;
}) {
	const { openConfirmation } = useConfirmationModal();
	const presentation = getInvitationPresentation(invitation);
	const manageable = actorRole === "owner" || invitation.role === "member";

	async function copyLink() {
		await navigator.clipboard.writeText(
			new URL(presentation.href, window.location.origin).toString(),
		);
		showToast.success("Invitation link copied.");
	}

	function confirmRefresh() {
		openConfirmation({
			confirmLabel: "Refresh invitation",
			description: `Invalidate the current link for ${invitation.email} and create a fresh seven-day invitation.`,
			onConfirm: async () => {
				try {
					await showToast.promise(
						refreshOrganizationInvitation(invitation.id),
						{
							loading: "Refreshing invitation...",
							success: "Invitation refreshed.",
							error: "Unable to refresh invitation.",
						},
					);
					onRefresh();
					return true;
				} catch {
					return false;
				}
			},
			title: "Refresh invitation",
		});
	}

	function confirmRevoke() {
		openConfirmation({
			confirmLabel: "Revoke invitation",
			confirmTone: "danger",
			description: `Revoke the pending invitation for ${invitation.email}.`,
			onConfirm: async () => {
				try {
					await showToast.promise(revokeOrganizationInvitation(invitation.id), {
						loading: "Revoking invitation...",
						success: "Invitation revoked.",
						error: "Unable to revoke invitation.",
					});
					onRefresh();
					return true;
				} catch {
					return false;
				}
			},
			title: "Revoke invitation",
			warning: "The existing invitation link will stop granting access.",
		});
	}

	return (
		<Dropdown.Menu
			ariaLabel={`Manage invitation for ${invitation.email}`}
			openOnHover={false}
			options={[
				{
					id: "copy",
					label: "Copy invite link",
					leadingIcon: <Icon name="copy" size="sm" />,
					onSelect: () => void copyLink(),
				},
				...(manageable
					? [
							{
								id: "refresh",
								label: "Refresh",
								leadingIcon: <Icon name="redo" size="sm" />,
								onSelect: confirmRefresh,
							},
							{
								id: "revoke",
								label: "Revoke",
								leadingIcon: <Icon name="warning" size="sm" />,
								onSelect: confirmRevoke,
								tone: "danger" as const,
							},
						]
					: []),
			]}
			pinOnClick
			positionStrategy="fixed"
		/>
	);
}

export function MembersTable({
	actorMembershipId,
	actorRole,
	members,
	onRefresh,
}: {
	actorMembershipId: string;
	actorRole: MembershipRole;
	members: readonly OrganizationMemberEntity[];
	onRefresh: () => void;
}) {
	return (
		<DashboardTablePanel
			columns={[
				{
					header: "Member",
					id: "member",
					render: (member) => (
						<MemberIdentity
							presentation={getMemberPresentation(member)}
							variant="compact"
						/>
					),
				},
				{
					header: "Role",
					id: "role",
					render: (member) => {
						const role = getMemberPresentation(member).role;
						return <MemberRoleChip label={role.shortLabel} tone={role.tone} />;
					},
				},
				{
					header: "Joined",
					id: "joined",
					render: (member) => getMemberPresentation(member).joinedAtLabel,
				},
				{
					align: "right",
					header: "Action",
					id: "action",
					kind: "action",
					render: (member) => (
						<MemberActions
							actorMembershipId={actorMembershipId}
							actorRole={actorRole}
							member={member}
							onRefresh={onRefresh}
						/>
					),
					sortable: false,
				},
			]}
			getRowKey={(member) => member.id}
			header={
				<Card.Header className="min-w-0">
					<Card.Title className="inline-flex min-w-0 items-center gap-2">
						<Icon name="users" size="sm" />
						Members
					</Card.Title>
					<Card.Description className="min-w-0 break-words">
						Organization roles and access for active members.
					</Card.Description>
				</Card.Header>
			}
			id="members"
			rows={members}
		/>
	);
}

function MemberActions({
	actorMembershipId,
	actorRole,
	member,
	onRefresh,
}: {
	actorMembershipId: string;
	actorRole: MembershipRole;
	member: OrganizationMemberEntity;
	onRefresh: () => void;
}) {
	const { openModal } = useModal();
	const { openConfirmation } = useConfirmationModal();
	const presentation = getMemberPresentation(member);
	const self = actorMembershipId === member.id;
	const ownerCanManage = actorRole === "owner" && member.role !== "owner";
	const adminCanRemove =
		actorRole === "admin" && member.role === "member" && !self;
	if (!ownerCanManage && !adminCanRemove) return null;

	function openRoleEditor() {
		openModal(
			({ close, setCloseDisabled }) => (
				<MemberRoleModal
					initialRole={member.role === "admin" ? "admin" : "member"}
					memberId={member.id}
					memberLabel={presentation.displayLabel}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
					onSuccess={onRefresh}
				/>
			),
			{ ariaLabel: "Change member role", id: `member-role-${member.id}` },
		);
	}

	function confirmRemoval() {
		openConfirmation({
			confirmLabel: "Remove member",
			confirmTone: "danger",
			description: `Remove ${presentation.displayLabel} from this organization.`,
			onConfirm: async () => {
				try {
					await showToast.promise(removeOrganizationMembership(member.id), {
						loading: "Removing member...",
						success: "Member removed.",
						error: "Unable to remove member.",
					});
					onRefresh();
					return true;
				} catch {
					return false;
				}
			},
			title: "Remove member",
			warning: "Their active sessions will lose access to this organization.",
		});
	}

	function openOwnershipTransfer() {
		openModal(
			({ close, setCloseDisabled }) => (
				<OwnershipTransferModal
					memberId={member.id}
					memberLabel={presentation.displayLabel}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
					onSuccess={onRefresh}
				/>
			),
			{
				ariaLabel: "Transfer ownership",
				cardProps: { maxWidth: "xl" },
				id: `ownership-transfer-${member.id}`,
			},
		);
	}

	return (
		<Dropdown.Menu
			ariaLabel={`Manage ${presentation.displayLabel}`}
			openOnHover={false}
			options={[
				...(ownerCanManage
					? [
							{
								id: "role",
								label: "Change role",
								leadingIcon: <Icon name="shield" size="sm" />,
								onSelect: openRoleEditor,
							},
							{
								id: "transfer",
								label: "Transfer ownership",
								leadingIcon: <Icon name="lock" size="sm" />,
								onSelect: openOwnershipTransfer,
							},
						]
					: []),
				{
					id: "remove",
					label: "Remove member",
					leadingIcon: <Icon name="trash" size="sm" />,
					onSelect: confirmRemoval,
					tone: "danger",
				},
			]}
			pinOnClick
			positionStrategy="fixed"
		/>
	);
}
