import { Icon } from "@/components/ui/icons/Icon";
import { Accordion } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { DashboardTablePanel } from "../../../_components/data/DashboardTablePanel";
import { AccountIdentity } from "../../../_components/entities/account/AccountIdentity";
import { DashboardEntityState } from "../../../_components/entities/DashboardEntityState";
import { MemberAvatarList } from "../../../_components/entities/member/MemberAvatarList";
import { MemberIdentity } from "../../../_components/entities/member/MemberIdentity";
import { MemberMention } from "../../../_components/entities/member/MemberMention";
import { MemberRoleChip } from "../../../_components/entities/member/MemberRoleChip";
import { MemberSelectorDemo } from "../../../_components/entities/member/MemberSelectorDemo";
import { OrganizationIdentity } from "../../../_components/entities/organization/OrganizationIdentity";
import { RecordStatusChip } from "../../../_components/entities/record/RecordStatusChip";
import { DashboardSection } from "../../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../../_components/loading/DashboardLoadingStatus";
import type { AccountPresentation } from "../../../_lib/entities/account/presentation";
import {
	type MemberPresentation,
	memberPresentationDefinition,
} from "../../../_lib/entities/member/presentation";
import type { OrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import type { ReferenceRecord } from "../../../_lib/entities/record/domain";
import {
	getRecordPresentation,
	recordColumnDefinitions,
} from "../../../_lib/entities/record/presentation";
import {
	AccordionSkeletonReference,
	AccountSkeletonReferenceCard,
	DashboardEntityReferenceLoadingComposition,
	MemberSkeletonReferenceCard,
	OrganizationSkeletonReferenceCard,
	RecordTableSkeletonReference,
} from "../EntitySkeletonReference";

export function EntityReferenceSurface({
	account,
	members,
	organization,
	records,
}: {
	account: AccountPresentation;
	members: MemberPresentation[];
	organization: OrganizationPresentation;
	records: ReferenceRecord[];
}) {
	const exampleMember = members[0];
	return (
		<DashboardSection
			description="Dashboard-owned entity contracts, fetch-free renderers, and live-versus-skeleton parity."
			title="Entity reference"
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
						<AccountIdentity presentation={account} variant="profile" />
						<AccountIdentity presentation={account} variant="compact" />
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
						{exampleMember ? (
							<>
								<MemberIdentity
									presentation={exampleMember}
									variant="profile"
								/>
								<MemberIdentity
									href
									presentation={exampleMember}
									variant="compact"
								/>
								<div className="flex flex-wrap items-center gap-4">
									<MemberIdentity
										href
										presentation={exampleMember}
										variant="actor"
									/>
									<MemberAvatarList members={members} />
									<MemberMention presentation={exampleMember} />
									<MemberRoleChip
										label={exampleMember.role.shortLabel}
										tone={exampleMember.role.tone}
									/>
								</div>
								<MemberSelectorDemo members={members} />
							</>
						) : (
							<DashboardEntityState
								description={
									memberPresentationDefinition.emptyState.description
								}
								iconName={memberPresentationDefinition.emptyState.icon}
								title={memberPresentationDefinition.emptyState.title}
							/>
						)}
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
						<OrganizationIdentity
							avatarSize="xl"
							presentation={organization}
							variant="profile"
						/>
						<OrganizationIdentity
							presentation={organization}
							variant="compact"
						/>
						<OrganizationIdentity
							presentation={organization}
							variant="compact"
							visual="icon"
						/>
					</Card.Content>
				</Card>
				<OrganizationSkeletonReferenceCard />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<DashboardTablePanel
					columns={[
						{
							header: recordColumnDefinitions[0].label,
							id: recordColumnDefinitions[0].id,
							render: (record) => getRecordPresentation(record).title,
						},
						{
							header: recordColumnDefinitions[1].label,
							id: recordColumnDefinitions[1].id,
							render: (record) => {
								const status = getRecordPresentation(record).status;
								return (
									<RecordStatusChip
										label={status.shortLabel}
										tone={status.tone}
									/>
								);
							},
							responsivePriority: 10,
							rowLink: false,
						},
						{
							header: recordColumnDefinitions[2].label,
							id: recordColumnDefinitions[2].id,
							render: (record) => getRecordPresentation(record).updatedAtLabel,
							responsivePriority: 100,
						},
						{
							header: "Actions",
							id: "actions",
							kind: "action",
							render: (record) => (
								<Button
									href={getRecordPresentation(record).href}
									size="sm"
									variant="secondary"
								>
									Open
								</Button>
							),
						},
					]}
					getRowHref={(record) => getRecordPresentation(record).href}
					getRowKey={(record) => record.id}
					header={
						<Card.Header className="min-w-0 border-b">
							<Card.Title className="inline-flex min-w-0 flex-wrap items-center gap-2">
								Responsive record table · live
							</Card.Title>
							<Card.Description className="min-w-0 break-words">
								A constrained table where Updated outranks Status and Actions
								always remains visible.
							</Card.Description>
						</Card.Header>
					}
					id="responsive-record-table-reference"
					rows={records}
				/>
				<RecordTableSkeletonReference />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<Accordion.Card defaultOpen>
					<Accordion.Header className="border-b">
						<Accordion.Title>Disclosure · live</Accordion.Title>
						<Accordion.Description>
							Presentation components receive resolved view models.
						</Accordion.Description>
						<Accordion.Action>
							<Button size="sm">Inspect</Button>
						</Accordion.Action>
					</Accordion.Header>
					<Accordion.Content>
						<Text tone="muted" variant="support">
							Routes resolve organization data; presentation components receive
							ready view models and never fetch.
						</Text>
					</Accordion.Content>
				</Accordion.Card>
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

export function EntityReferenceSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading entity presentation reference">
			<DashboardEntityReferenceLoadingComposition />
		</DashboardLoadingStatus>
	);
}
