import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import {
	recordColumnDefinitions,
	recordPresentationDefinition,
} from "../../../_lib/entities/record/presentation";
import { DashboardTablePanel } from "../../data/DashboardTablePanel";
import { MemberIdentity } from "../member/MemberIdentity";
import { RecordStatusChip } from "./RecordStatusChip";

const columns = recordColumnDefinitions;
const recordSkeletonRowKeys = ["alpha", "bravo", "charlie", "delta", "echo"];
const defaultRecordSkeletonRows = [
	{
		ownerLabel: "Template Operator",
		slug: "north-star",
		status: "Active",
		title: "North star",
		updatedAt: "Jul 18, 2026, 3:30 PM",
	},
	{
		ownerLabel: "Multi-org Reviewer",
		slug: "launch-brief",
		status: "Draft",
		title: "Launch brief",
		updatedAt: "Jul 17, 2026, 6:10 PM",
	},
	{
		ownerLabel: null,
		slug: "customer-notes",
		status: "Review",
		title: "Customer notes",
		updatedAt: "Jul 16, 2026, 10:45 AM",
	},
] as const;

export function RecordCollectionClientSkeleton({
	canWrite = true,
	organizationName = "Averlo Studio",
	rowCount = 3,
}: {
	canWrite?: boolean;
	organizationName?: string;
	rowCount?: number;
}) {
	const rows = recordSkeletonRowKeys.slice(0, rowCount).map((key, index) => ({
		key,
		...(defaultRecordSkeletonRows[index] ?? {
			ownerLabel: "Example member",
			slug: "quarterly-planning",
			status: "Draft",
			title: "Quarterly planning record",
			updatedAt: "Jul 20, 2026, 12:00 PM",
		}),
	}));
	return (
		<div className="grid gap-4">
			<DashboardTablePanel.Skeleton
				columns={[
					{ header: columns[0].label, id: columns[0].id },
					{ header: "Owner", id: "owner" },
					{ header: columns[1].label, id: columns[1].id },
					{ header: columns[2].label, id: columns[2].id },
					{
						align: "right",
						header: "Actions",
						id: "actions",
						kind: "action",
					},
				]}
				header={
					<Card.Heading
						action={
							canWrite ? (
								<Button.Skeleton size="sm" variant="secondary">
									New record
								</Button.Skeleton>
							) : null
						}
						actionLayout="responsive"
						description={
							<>
								Organization-scoped fixtures for {organizationName}. Sort any
								presentation-owned column.
							</>
						}
						leading={
							<Icon name={recordPresentationDefinition.icon} size="sm" />
						}
						title={recordPresentationDefinition.nouns.plural}
					/>
				}
				id="reference-records"
			>
				{rows.map((row) => (
					<tr key={row.key}>
						<td
							className="min-w-0 border-b border-border/70 px-4 py-3 text-muted-foreground"
							data-dashboard-table-column-index="0"
							data-dashboard-table-kind="data"
							data-dashboard-table-required="true"
						>
							<span className="grid min-w-0">
								<Text.Skeleton
									as="span"
									className="max-w-44 truncate"
									variant="bodyStrong"
								>
									{row.title}
								</Text.Skeleton>
								<Text.Skeleton
									as="span"
									className="max-w-32 truncate"
									tone="muted"
									variant="caption"
								>
									{row.slug}
								</Text.Skeleton>
							</span>
						</td>
						<td
							className="border-b border-border/70 px-4 py-3 whitespace-nowrap text-muted-foreground"
							data-dashboard-table-column-index="1"
							data-dashboard-table-kind="data"
						>
							{row.ownerLabel ? (
								<MemberIdentity.Skeleton
									avatarSize="sm"
									displayLabel={row.ownerLabel}
									href
									variant="actor"
								/>
							) : (
								<Text.Skeleton
									as="span"
									className="text-sm text-muted-foreground"
									tone={null}
									variant={null}
								>
									Unassigned
								</Text.Skeleton>
							)}
						</td>
						<td
							className="border-b border-border/70 px-4 py-3 whitespace-nowrap text-muted-foreground"
							data-dashboard-table-column-index="2"
							data-dashboard-table-kind="data"
						>
							<RecordStatusChip.Skeleton label={row.status} />
						</td>
						<td
							className="border-b border-border/70 px-4 py-3 whitespace-nowrap text-muted-foreground"
							data-dashboard-table-column-index="3"
							data-dashboard-table-kind="data"
						>
							<Text.Skeleton
								as="span"
								className="text-sm text-muted-foreground"
								tone={null}
								variant={null}
							>
								{row.updatedAt}
							</Text.Skeleton>
						</td>
						<td
							className="sticky right-0 z-10 w-px border-b border-border/70 bg-card px-4 py-3 text-right whitespace-nowrap"
							data-dashboard-table-column-index="4"
							data-dashboard-table-kind="action"
							data-dashboard-table-required="true"
						>
							<Button.Skeleton size="icon-sm" variant="secondary" />
						</td>
					</tr>
				))}
			</DashboardTablePanel.Skeleton>
		</div>
	);
}
