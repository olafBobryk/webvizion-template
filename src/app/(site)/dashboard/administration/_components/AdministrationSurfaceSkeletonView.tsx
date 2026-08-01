import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { DashboardTablePanelSkeleton } from "../../_components/data/DashboardTablePanel";
import { MemberIdentitySkeleton } from "../../_components/entities/member/MemberIdentity";
import { MemberRoleChipSkeleton } from "../../_components/entities/member/MemberRoleChip";
import { DashboardSection } from "../../_components/layout/DashboardSection";

const invitationColumns = [
	"Invitee",
	"Role",
	"Sent",
	"Expires",
	"Status",
] as const;

function InvitationTableSkeleton() {
	return (
		<DashboardTablePanelSkeleton
			columns={[
				...invitationColumns.map((header) => ({
					header,
					id: header.toLowerCase(),
				})),
				{
					align: "right" as const,
					header: "Action",
					id: "action",
					kind: "action" as const,
				},
			]}
			header={
				<Card.Heading
					action={
						<Button.Skeleton leadingIcon size="sm" variant="primary">
							Invite member
						</Button.Skeleton>
					}
					description="Fixture deliveries stay local and expose a copyable invitation link."
					leading={<Icon name="mail" size="sm" />}
					title="Pending invitations"
				/>
			}
			id="pending-invitations"
		>
			{["admin@example.com", "member@example.com"].map((email) => (
				<tr key={email}>
					<td
						className="min-w-0 border-b border-border/70 px-4 py-3"
						data-dashboard-table-column-index="0"
						data-dashboard-table-kind="data"
						data-dashboard-table-required="true"
					>
						<Text.Skeleton as="span" variant="support">
							{email}
						</Text.Skeleton>
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap"
						data-dashboard-table-column-index="1"
						data-dashboard-table-kind="data"
					>
						<MemberRoleChipSkeleton label="Member" />
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap"
						data-dashboard-table-column-index="2"
						data-dashboard-table-kind="data"
					>
						<Text.Skeleton as="span" variant="caption">
							20 Jul 2026
						</Text.Skeleton>
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap"
						data-dashboard-table-column-index="3"
						data-dashboard-table-kind="data"
					>
						<Text.Skeleton as="span" variant="caption">
							27 Jul 2026
						</Text.Skeleton>
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap"
						data-dashboard-table-column-index="4"
						data-dashboard-table-kind="data"
					>
						<Chip.Skeleton>Pending</Chip.Skeleton>
					</td>
					<td
						className="sticky right-0 z-10 w-px border-b border-border/70 bg-card px-4 py-3 text-right whitespace-nowrap"
						data-dashboard-table-column-index="5"
						data-dashboard-table-kind="action"
						data-dashboard-table-required="true"
					>
						<Button.Skeleton size="icon-sm" variant="ghost" />
					</td>
				</tr>
			))}
		</DashboardTablePanelSkeleton>
	);
}

function MembersTableSkeleton() {
	return (
		<DashboardTablePanelSkeleton
			columns={[
				{ header: "Member", id: "member" },
				{ header: "Role", id: "role" },
				{ header: "Joined", id: "joined" },
				{
					align: "right",
					header: "Action",
					id: "action",
					kind: "action",
				},
			]}
			header={
				<Card.Heading
					description="Organization roles and access for active members."
					leading={<Icon name="users" size="sm" />}
					title="Members"
				/>
			}
			id="members"
		>
			{["Template Operator", "Example Member"].map((name) => (
				<tr key={name}>
					<td
						className="min-w-0 border-b border-border/70 px-4 py-3"
						data-dashboard-table-column-index="0"
						data-dashboard-table-kind="data"
						data-dashboard-table-required="true"
					>
						<MemberIdentitySkeleton
							displayLabel={name}
							emailLabel="member@example.com"
							variant="default"
						/>
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap"
						data-dashboard-table-column-index="1"
						data-dashboard-table-kind="data"
					>
						<MemberRoleChipSkeleton label="Member" />
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap"
						data-dashboard-table-column-index="2"
						data-dashboard-table-kind="data"
					>
						<Text.Skeleton as="span" variant="caption">
							20 Jul 2026
						</Text.Skeleton>
					</td>
					<td
						className="sticky right-0 z-10 w-px border-b border-border/70 bg-card px-4 py-3 text-right whitespace-nowrap"
						data-dashboard-table-column-index="3"
						data-dashboard-table-kind="action"
						data-dashboard-table-required="true"
					>
						<Button.Skeleton size="icon-sm" variant="ghost" />
					</td>
				</tr>
			))}
		</DashboardTablePanelSkeleton>
	);
}

export function AdministrationSurfaceSkeletonView() {
	return (
		<div aria-busy="true" aria-label="Loading administration" role="status">
			<DashboardSection contentClassName="grid gap-5" title="Administration">
				<InvitationTableSkeleton />
				<MembersTableSkeleton />
			</DashboardSection>
		</div>
	);
}
