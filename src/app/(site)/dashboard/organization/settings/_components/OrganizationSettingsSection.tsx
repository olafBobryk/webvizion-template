"use client";

import { DashboardDetailField } from "@/app/(site)/dashboard/_components/detail/DashboardDetailField";
import { MemberRoleChip } from "@/app/(site)/dashboard/_components/entities/member/MemberRoleChip";
import { OrganizationIdentity } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity";
import { useDashboardAuth } from "@/app/(site)/dashboard/_components/providers/DashboardAuthProvider";
import { memberRolePresentation } from "@/app/(site)/dashboard/_lib/entities/member/presentation";
import { toOrganizationEntity } from "@/app/(site)/dashboard/_lib/entities/organization/domain";
import { getOrganizationPresentation } from "@/app/(site)/dashboard/_lib/entities/organization/presentation";
import { Icon } from "@/components/ui/icons/Icon";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { hrefFor } from "@/lib/routes";
import { OrganizationEditModal } from "./OrganizationEditModal";

type OrganizationSettingsSectionProps = {
	activeMemberCount: number;
	pendingInvitationCount: number;
};

function OrganizationSettingsSectionRoot({
	activeMemberCount,
	pendingInvitationCount,
}: OrganizationSettingsSectionProps) {
	const { membership, organization, updateOrganization } = useDashboardAuth();
	const { openModal } = useModal();
	const presentation = getOrganizationPresentation(
		toOrganizationEntity(organization, membership.role),
	);
	const rolePresentation = memberRolePresentation[membership.role];

	function openOrganizationEditor() {
		openModal(
			({ close, setCloseDisabled }) => (
				<OrganizationEditModal
					organizationId={organization.id}
					membershipRole={membership.role}
					initialName={organization.name}
					initialPictureUrl={organization.profilePictureUrl}
					initialSlug={organization.slug}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
					onUpdate={updateOrganization}
				/>
			),
			{
				ariaLabel: "Edit organization",
				cardProps: { maxWidth: "xl" },
				id: "organization-identity-edit",
			},
		);
	}

	return (
		<>
			<Card>
				<Card.Heading
					action={
						<Button
							leadingIcon="pencil"
							onClick={openOrganizationEditor}
							size="sm"
							type="button"
							variant="ghost"
						>
							Edit organization
						</Button>
					}
					description="Name, slug, and picture shown across the dashboard."
					leading={
						<Icon className="text-muted-foreground" name="building" size="sm" />
					}
					title="Organization identity"
				/>
				<Card.Content className="grid gap-5">
					<OrganizationIdentity avatarSize="xl" presentation={presentation} />
					<dl className="grid gap-4 sm:grid-cols-2">
						<DashboardDetailField
							icon={<Icon name="building" size="sm" />}
							label="Name"
							value={organization.name}
						/>
						<DashboardDetailField
							copyLabel="Copy organization slug"
							copyValue={organization.slug}
							icon={<Icon name="at" size="sm" />}
							label="Slug"
							value={organization.slug}
						/>
					</dl>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					action={
						<Button
							href={hrefFor("dashboard.administration")}
							size="sm"
							variant="primary"
						>
							Manage access
						</Button>
					}
					description="A quick view of members, pending invitations, and your role."
					leading={
						<Icon className="text-muted-foreground" name="users" size="sm" />
					}
					title="People and access"
				/>
				<Card.Content>
					<dl className="grid gap-4 sm:grid-cols-3">
						<DashboardDetailField
							icon={<Icon name="users" size="sm" />}
							label="Active members"
							value={String(activeMemberCount)}
						/>
						<DashboardDetailField
							icon={<Icon name="mail" size="sm" />}
							label="Pending invitations"
							value={String(pendingInvitationCount)}
						/>
						<DashboardDetailField
							icon={<Icon name="shield" size="sm" />}
							label="Your role"
							truncateValue={false}
							value={
								<MemberRoleChip
									label={rolePresentation.shortLabel}
									tone={rolePresentation.tone}
								/>
							}
						/>
					</dl>
				</Card.Content>
			</Card>
		</>
	);
}

export function OrganizationSettingsSectionSkeleton() {
	const { membership, organization } = useDashboardAuth();
	const rolePresentation = memberRolePresentation[membership.role];

	return (
		<>
			<Card>
				<Card.Heading
					action={
						<Button.Skeleton leadingIcon size="sm" variant="ghost">
							Edit organization
						</Button.Skeleton>
					}
					description="Name, slug, and picture shown across the dashboard."
					leading={
						<Icon className="text-muted-foreground" name="building" size="sm" />
					}
					title="Organization identity"
				/>
				<Card.Content className="grid gap-5">
					<OrganizationIdentity.Skeleton avatarSize="xl" />
					<dl className="grid gap-4 sm:grid-cols-2">
						<DashboardDetailField.Skeleton
							icon={<Icon name="building" size="sm" />}
							label="Name"
							value={organization.name}
						/>
						<DashboardDetailField.Skeleton
							copyable
							icon={<Icon name="at" size="sm" />}
							label="Slug"
							value={organization.slug}
						/>
					</dl>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					action={
						<Button.Skeleton size="sm" variant="primary">
							Manage access
						</Button.Skeleton>
					}
					description="A quick view of members, pending invitations, and your role."
					leading={
						<Icon className="text-muted-foreground" name="users" size="sm" />
					}
					title="People and access"
				/>
				<Card.Content>
					<dl className="grid gap-4 sm:grid-cols-3">
						<DashboardDetailField.Skeleton
							icon={<Icon name="users" size="sm" />}
							label="Active members"
							value="3"
						/>
						<DashboardDetailField.Skeleton
							icon={<Icon name="mail" size="sm" />}
							label="Pending invitations"
							value="1"
						/>
						<DashboardDetailField.Skeleton
							icon={<Icon name="shield" size="sm" />}
							label="Your role"
							truncateValue={false}
						>
							<MemberRoleChip.Skeleton label={rolePresentation.shortLabel} />
						</DashboardDetailField.Skeleton>
					</dl>
				</Card.Content>
			</Card>
		</>
	);
}

export const OrganizationSettingsSection = Object.assign(
	OrganizationSettingsSectionRoot,
	{ Skeleton: OrganizationSettingsSectionSkeleton },
);
