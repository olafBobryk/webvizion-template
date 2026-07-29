"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Accordion } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { DashboardTablePanel } from "../../_components/data/DashboardTablePanel";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { AccountIdentity } from "../../_components/entities/account/AccountIdentity";
import { MemberAvatarList } from "../../_components/entities/member/MemberAvatarList";
import { MemberIdentity } from "../../_components/entities/member/MemberIdentity";
import { MemberMention } from "../../_components/entities/member/MemberMention";
import { MemberRoleChip } from "../../_components/entities/member/MemberRoleChip";
import { MemberSelectorDemo } from "../../_components/entities/member/MemberSelectorDemo";
import { OrganizationIdentity } from "../../_components/entities/organization/OrganizationIdentity";
import { RecordStatusChip } from "../../_components/entities/record/RecordStatusChip";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { recordColumnDefinitions } from "../../_lib/entities/record/presentation";

export function AccountSkeletonReferenceCard() {
	return (
		<Card>
			<Card.Header className="border-b">
				<Card.Title>Account presentation · skeleton</Card.Title>
				<Card.Description>
					Global identity remains separate from organization membership facts.
				</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-5">
				<AccountIdentity.Skeleton variant="profile" />
				<AccountIdentity.Skeleton variant="compact" />
			</Card.Content>
		</Card>
	);
}

export function MemberSkeletonReferenceCard() {
	return (
		<Card>
			<Card.Header className="border-b">
				<Card.Title>Member presentation · skeleton</Card.Title>
				<Card.Description>
					The owning components reserve the same avatar, text, border, and gap
					geometry.
				</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-5">
				<MemberIdentity.Skeleton variant="profile" />
				<MemberIdentity.Skeleton variant="compact" />
				<MemberIdentity.Skeleton variant="actor" />
				<DashboardDetailField.Skeleton
					label="Member detail"
					value="Example member"
				/>
			</Card.Content>
		</Card>
	);
}

export function OrganizationSkeletonReferenceCard() {
	return (
		<Card>
			<Card.Header className="border-b">
				<Card.Title>Organization presentation · skeleton</Card.Title>
				<Card.Description>
					The owning namespace preserves the 40px avatar and compact text
					geometry.
				</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-5">
				<OrganizationIdentity.Skeleton avatarSize="xl" variant="profile" />
				<OrganizationIdentity.Skeleton variant="compact" />
			</Card.Content>
		</Card>
	);
}

const referenceTableSkeletonRows = [
	{
		date: "Jul 18, 2026, 3:30 PM",
		id: "north-star",
		status: "Active",
		title: "North star",
	},
	{
		date: "Jul 17, 2026, 6:10 PM",
		id: "launch-brief",
		status: "Draft",
		title: "Launch brief",
	},
] as const;

function RecordTableSkeleton({
	description,
	rows = referenceTableSkeletonRows,
	title,
}: {
	description: React.ReactNode;
	rows?: readonly {
		date: string;
		id: string;
		status: string;
		title: string;
	}[];
	title: React.ReactNode;
}) {
	return (
		<DashboardTablePanel.Skeleton
			columns={[
				{
					header: recordColumnDefinitions[0].label,
					id: recordColumnDefinitions[0].id,
				},
				{
					header: recordColumnDefinitions[1].label,
					id: recordColumnDefinitions[1].id,
					responsivePriority: 10,
				},
				{
					header: recordColumnDefinitions[2].label,
					id: recordColumnDefinitions[2].id,
					responsivePriority: 100,
				},
				{
					align: "right",
					header: "Actions",
					id: "actions",
					kind: "action",
				},
			]}
			header={
				<Card.Header className="min-w-0 border-b">
					<Card.Title className="inline-flex min-w-0 flex-wrap items-center gap-2">
						{title}
					</Card.Title>
					<Card.Description className="min-w-0 break-words">
						{description}
					</Card.Description>
				</Card.Header>
			}
		>
			{rows.map((row) => (
				<tr key={row.id}>
					<td
						className="min-w-0 border-b border-border/70 px-4 py-3 text-muted-foreground"
						data-dashboard-table-column-index="0"
						data-dashboard-table-kind="data"
						data-dashboard-table-required="true"
					>
						<Text.Skeleton
							as="span"
							className="max-w-44 text-sm text-muted-foreground"
							tone={null}
							variant={null}
						>
							{row.title}
						</Text.Skeleton>
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap text-muted-foreground"
						data-dashboard-table-column-index="1"
						data-dashboard-table-kind="data"
						data-dashboard-table-responsive-priority="10"
					>
						<RecordStatusChip.Skeleton label={row.status} />
					</td>
					<td
						className="border-b border-border/70 px-4 py-3 whitespace-nowrap text-muted-foreground"
						data-dashboard-table-column-index="2"
						data-dashboard-table-kind="data"
						data-dashboard-table-responsive-priority="100"
					>
						<Text.Skeleton
							as="span"
							className="max-w-32 text-sm text-muted-foreground"
							tone={null}
							variant={null}
						>
							{row.date}
						</Text.Skeleton>
					</td>
					<td
						className="sticky right-0 z-10 w-px border-b border-border/70 bg-card px-4 py-3 text-right whitespace-nowrap"
						data-dashboard-table-column-index="3"
						data-dashboard-table-kind="action"
						data-dashboard-table-required="true"
					>
						<Button.Skeleton size="sm" variant="secondary">
							Open
						</Button.Skeleton>
					</td>
				</tr>
			))}
		</DashboardTablePanel.Skeleton>
	);
}

export function RecordTableSkeletonReference() {
	return (
		<RecordTableSkeleton
			description="The table namespace owns loading geometry."
			rows={[
				{
					date: "Jul 20, 2026",
					id: "one",
					status: "Draft",
					title: "Quarterly planning record",
				},
				{
					date: "Jul 20, 2026",
					id: "two",
					status: "Draft",
					title: "Quarterly planning record",
				},
			]}
			title="Responsive record table · skeleton"
		/>
	);
}

export function AccordionSkeletonReference() {
	return (
		<>
			<Accordion.Card.Skeleton
				action={<Button.Skeleton size="sm">Inspect</Button.Skeleton>}
				description="Presentation components receive resolved view models."
				headerClassName="border-b"
				open
				title="Disclosure · live"
			/>
			<Accordion.Skeleton
				className="xl:col-start-2"
				description="Compact source-style disclosure geometry."
				title="Plain disclosure · skeleton"
			/>
		</>
	);
}

export function DashboardEntityReferenceLoadingComposition() {
	return (
		<DashboardSection
			description="Dashboard-owned entity contracts, fetch-free renderers, and live-versus-skeleton parity."
			title="Entity presentation reference"
		>
			<div className="grid gap-5 xl:grid-cols-2">
				<Card>
					<Card.Header className="border-b">
						<Card.Title>Account presentation · live</Card.Title>
						<Card.Description>
							Profile and account-menu identity share one global account model.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<AccountIdentity.Skeleton
							displayLabel="Template Operator"
							emailLabel="operator@averlo.local"
							variant="profile"
						/>
						<AccountIdentity.Skeleton
							displayLabel="Template Operator"
							emailLabel="operator@averlo.local"
							variant="compact"
						/>
					</Card.Content>
				</Card>
				<AccountSkeletonReferenceCard />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<Card>
					<Card.Header className="border-b">
						<Card.Title>Member presentation · live</Card.Title>
						<Card.Description>
							Profile, compact, actor, avatar list, mention, and role all
							consume one resolved view model.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<MemberIdentity.Skeleton
							displayLabel="Multi-org Reviewer"
							emailLabel="multi@averlo.local"
							variant="profile"
						/>
						<MemberIdentity.Skeleton
							displayLabel="Multi-org Reviewer"
							emailLabel="multi@averlo.local"
							href
							variant="compact"
						/>
						<div className="flex flex-wrap items-center gap-4">
							<MemberIdentity.Skeleton
								displayLabel="Multi-org Reviewer"
								href
								variant="actor"
							/>
							<MemberAvatarList.Skeleton count={2} />
							<MemberMention.Skeleton label="@Multi-org Reviewer" />
							<MemberRoleChip.Skeleton label="Admin" />
						</div>
						<MemberSelectorDemo.Skeleton />
					</Card.Content>
				</Card>
				<MemberSkeletonReferenceCard />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<Card>
					<Card.Header className="border-b">
						<Card.Title>Organization presentation · live</Card.Title>
						<Card.Description>
							The switcher and chooser share one compact identity across
							profile-picture and plain-icon modes.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<OrganizationIdentity.Skeleton
							avatarSize="xl"
							displayLabel="Demo organization"
							secondaryLabel="demo · Owner"
							variant="profile"
						/>
						<OrganizationIdentity.Skeleton
							displayLabel="Demo organization"
							secondaryLabel="demo · Owner"
							variant="compact"
						/>
						<OrganizationIdentity.Skeleton
							displayLabel="Demo organization"
							secondaryLabel="demo · Owner"
							variant="compact"
							visual="icon"
						/>
					</Card.Content>
				</Card>
				<OrganizationSkeletonReferenceCard />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<RecordTableSkeleton
					description="A constrained table where Updated outranks Status and Actions always remains visible."
					title="Responsive record table · live"
				/>
				<RecordTableSkeletonReference />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<Accordion.Card.Skeleton
					action={<Button.Skeleton size="sm">Inspect</Button.Skeleton>}
					description="Presentation components receive resolved view models."
					headerClassName="border-b"
					open
					title="Disclosure · live"
				>
					<Text.Skeleton as="span" tone="muted" variant="support">
						Routes resolve organization data; presentation components receive
						ready view models and never fetch.
					</Text.Skeleton>
				</Accordion.Card.Skeleton>
				<AccordionSkeletonReference />
			</div>

			<Card>
				<Card.Header className="border-b">
					<Card.Title className="inline-flex items-center gap-2">
						<Icon name="cards" size="sm" />
						Copyable ownership pattern
					</Card.Title>
					<Card.Description>
						Import the owning factory and renderer directly; do not create a
						global presentation registry.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs">
						<code>{`const member = getMemberPresentation(memberFacts);\n<MemberIdentity presentation={member} variant="compact" />\n\nconst organization = getOrganizationPresentation(organizationFacts);\n<OrganizationIdentity presentation={organization} />\n\nconst columns = [\n  { id: "name", header: "Name", render: renderName },\n  { id: "updated", header: "Updated", responsivePriority: 100, render: renderUpdated },\n  { id: "actions", header: "Actions", kind: "action", render: renderActions },\n];`}</code>
					</pre>
				</Card.Content>
			</Card>
		</DashboardSection>
	);
}
