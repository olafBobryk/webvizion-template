"use client";

import { LoginLoadingView } from "@/app/(site)/(auth)/_components/AuthRouteLoadingViews";
import { Icon } from "@/components/ui/icons/Icon";
import {
	DateInput,
	DateRangeInput,
	EmailInput,
	MultiselectInput,
	NumberInput,
	PasswordInput,
	ProfilePictureInput,
	RadioInput,
	SelectInput,
	TextAreaInput,
	TextInput,
	ToggleInput,
} from "@/components/ui/input";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { DashboardTablePanel } from "../../_components/data/DashboardTablePanel";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { MemberIdentity } from "../../_components/entities/member/MemberIdentity";
import { OrganizationIdentity } from "../../_components/entities/organization/OrganizationIdentity";
import { RecordCollectionClient } from "../../_components/entities/record/RecordCollectionClient";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import type { MemberPresentation } from "../../_lib/entities/member/presentation";
import type { OrganizationPresentation } from "../../_lib/entities/organization/presentation";
import type { ReferenceRecord } from "../../_lib/entities/record/domain";

const appearanceOptions = [
	{ label: "System", value: "system" },
	{ label: "Light", value: "light" },
	{ label: "Dark", value: "dark" },
];

const preferenceOptions = [
	{
		description: "Disables non-essential animations.",
		label: "Reduce motion",
		value: "reduce-motion",
	},
	{
		description: "Scales interface typography for readability.",
		label: "Increase text size",
		value: "large-text",
	},
];

const normalizedTableRows = [
	{
		amount: "EUR 12,400",
		item: "Creative retainers",
		status: "Visible",
		type: "Service",
	},
	{
		amount: "EUR 4,900",
		item: "Media production",
		status: "Visible",
		type: "Activity",
	},
	{
		amount: "EUR 1,280",
		item: "Review tooling",
		status: "Visible",
		type: "Tooling",
	},
] as const;

const normalizedTableColumns = [
	{
		header: "Item",
		id: "item",
		render: (row: (typeof normalizedTableRows)[number]) => row.item,
	},
	{
		header: "Type",
		id: "type",
		render: (row: (typeof normalizedTableRows)[number]) => row.type,
	},
	{
		header: "Status",
		id: "status",
		render: (row: (typeof normalizedTableRows)[number]) => (
			<Chip tone="success">{row.status}</Chip>
		),
		sortable: false,
	},
	{
		align: "right" as const,
		header: "Amount",
		id: "amount",
		render: (row: (typeof normalizedTableRows)[number]) => row.amount,
	},
];

export function DashboardSkeletonReferenceClient({
	canWrite,
	member,
	members,
	organization,
	records,
}: {
	canWrite: boolean;
	member?: MemberPresentation;
	members: readonly MemberPresentation[];
	organization: OrganizationPresentation;
	records: readonly ReferenceRecord[];
}) {
	return (
		<DashboardSection
			contentClassName="grid gap-5"
			description="Side-by-side geometry review for component-owned and route-owned loading states."
			title="Skeleton reference"
		>
			<Card>
				<Card.Heading
					description="The authentication loading boundary delegates to its field and\n\t\t\t\t\t\taction owners."
					title="Representative route composition"
				/>
				<Card.Content>
					<div
						className="mx-auto w-full max-w-md"
						data-skeleton-route-composition="login"
					>
						<LoginLoadingView />
					</div>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					description="The left table is live and sortable; the right is a static,\n\t\t\t\t\t\tnon-interactive loading comparison with identical copy and row\n\t\t\t\t\t\tgeometry."
					title="Pinned-source table correspondence"
				/>
				<Card.Content className="grid gap-5 xl:grid-cols-2">
					<div data-skeleton-source-normalized="table-live">
						<NormalizedTableLive />
					</div>
					<div data-skeleton-source-normalized="table-skeleton">
						<NormalizedTableSkeleton />
					</div>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					description="Live controls and their namespaced skeletons use the same field,\n\t\t\t\t\t\tinput, option, and typography geometry."
					title="Input owners"
				/>
				<Card.Content className="grid gap-8 xl:grid-cols-2">
					<Comparison title="EmailInput">
						<EmailInput defaultValue="operator@averlo.local" label="Email" />
						<EmailInput.Skeleton label="Email" value="operator@averlo.local" />
					</Comparison>
					<Comparison title="PasswordInput">
						<PasswordInput
							defaultValue="demo-password"
							label="Password"
							showStrength
						/>
						<PasswordInput.Skeleton
							label="Password"
							showStrength
							value="demo-password"
						/>
					</Comparison>
					<Comparison title="TextInput">
						<TextInput defaultValue="Averlo workspace" label="Workspace name" />
						<TextInput.Skeleton
							label="Workspace name"
							value="Averlo workspace"
						/>
					</Comparison>
					<Comparison title="NumberInput">
						<NumberInput defaultValue={24} label="Seats" unit="members" />
						<NumberInput.Skeleton label="Seats" value="24 members" />
					</Comparison>
					<Comparison title="TextAreaInput">
						<TextAreaInput
							defaultValue="A representative multi-line description."
							label="Description"
						/>
						<TextAreaInput.Skeleton
							label="Description"
							value="A representative multi-line description."
						/>
					</Comparison>
					<Comparison title="SelectInput">
						<SelectInput
							label="Role"
							onChange={() => undefined}
							options={[
								{ label: "Owner", value: "owner" },
								{ label: "Member", value: "member" },
							]}
							value="owner"
						/>
						<SelectInput.Skeleton label="Role" value="Owner" />
					</Comparison>
					<Comparison title="DateInput">
						<DateInput label="Start date" value="2026-07-22" />
						<DateInput.Skeleton label="Start date" value="22 Jul 2026" />
					</Comparison>
					<Comparison title="DateRangeInput">
						<DateRangeInput
							label="Reporting window"
							value={{ end: "2026-07-22", start: "2026-07-01" }}
						/>
						<DateRangeInput.Skeleton
							label="Reporting window"
							value="Jul 1, 2026 – Jul 22, 2026"
						/>
					</Comparison>
					<Comparison title="ProfilePictureInput">
						<ProfilePictureInput
							layout="file-row"
							name="Taylor"
							onChange={() => undefined}
						/>
						<ProfilePictureInput.Skeleton layout="file-row" />
					</Comparison>
					<Comparison title="RadioInput">
						<RadioInput
							defaultValue="system"
							label="Appearance"
							options={appearanceOptions}
						/>
						<RadioInput.Skeleton
							label="Appearance"
							options={appearanceOptions}
						/>
					</Comparison>
					<Comparison title="MultiselectInput">
						<MultiselectInput
							defaultValue={["reduce-motion"]}
							label="Accessibility preferences"
							options={preferenceOptions}
						/>
						<MultiselectInput.Skeleton
							label="Accessibility preferences"
							options={preferenceOptions}
						/>
					</Comparison>
					<Comparison title="ToggleInput">
						<ToggleInput
							label="Interaction and text"
							options={preferenceOptions}
						/>
						<ToggleInput.Skeleton
							label="Interaction and text"
							options={preferenceOptions}
						/>
					</Comparison>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					description="Avatar, identity, and detail owners reserve loaded geometry."
					title="Presentation owners"
				/>
				<Card.Content className="grid gap-8 xl:grid-cols-2">
					{member ? (
						<Comparison title="MemberIdentity">
							<MemberIdentity avatarSize="xl" presentation={member} />
							<MemberIdentity.Skeleton avatarSize="xl" />
						</Comparison>
					) : null}
					<Comparison title="OrganizationIdentity">
						<OrganizationIdentity avatarSize="xl" presentation={organization} />
						<OrganizationIdentity.Skeleton avatarSize="xl" />
					</Comparison>
					<Comparison title="DashboardDetailField">
						<DashboardDetailField
							icon={<Icon name="mail" size="sm" />}
							label="Email"
							value="member@example.com"
						/>
						<DashboardDetailField.Skeleton
							icon={<Icon name="mail" size="sm" />}
							label="Email"
							value="member@example.com"
						/>
					</Comparison>
				</Card.Content>
			</Card>

			<div className="grid gap-5 xl:grid-cols-2">
				<RecordCollectionClient
					canWrite={canWrite}
					initialRecords={records}
					members={members}
					organizationName={organization.displayLabel}
				/>
				<RecordCollectionClient.Skeleton
					canWrite={canWrite}
					organizationName={organization.displayLabel}
					rowCount={records.length || 3}
				/>
			</div>
		</DashboardSection>
	);
}

export function DashboardSkeletonReferenceLoadingComposition() {
	return (
		<DashboardSection
			contentClassName="grid gap-5"
			description="Side-by-side geometry review for component-owned and route-owned loading states."
			title="Skeleton reference"
		>
			<Card>
				<Card.Heading
					description="The authentication loading boundary delegates to its field and\n\t\t\t\t\t\taction owners."
					title="Representative route composition"
				/>
				<Card.Content>
					<div className="mx-auto w-full max-w-md">
						<LoginLoadingView />
					</div>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					description="Loading keeps both comparison columns at the same geometry."
					title="Pinned-source table correspondence"
				/>
				<Card.Content className="grid gap-5 xl:grid-cols-2">
					<NormalizedTableSkeleton />
					<NormalizedTableSkeleton />
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					description="Component-owned skeletons reserve the field and input geometry."
					title="Input owners"
				/>
				<Card.Content className="grid gap-8 xl:grid-cols-2">
					<Comparison title="EmailInput">
						<EmailInput.Skeleton label="Email" value="operator@averlo.local" />
						<EmailInput.Skeleton label="Email" value="operator@averlo.local" />
					</Comparison>
					<Comparison title="SelectInput">
						<SelectInput.Skeleton label="Role" value="Owner" />
						<SelectInput.Skeleton label="Role" value="Owner" />
					</Comparison>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					description="Identity owners preserve their own loaded geometry."
					title="Presentation owners"
				/>
				<Card.Content className="grid gap-8 xl:grid-cols-2">
					<Comparison title="MemberIdentity">
						<MemberIdentity.Skeleton avatarSize="xl" />
						<MemberIdentity.Skeleton avatarSize="xl" />
					</Comparison>
					<Comparison title="OrganizationIdentity">
						<OrganizationIdentity.Skeleton avatarSize="xl" />
						<OrganizationIdentity.Skeleton avatarSize="xl" />
					</Comparison>
				</Card.Content>
			</Card>

			<div className="grid gap-5 xl:grid-cols-2">
				<RecordCollectionClient.Skeleton
					canWrite
					organizationName="Example organization"
					rowCount={3}
				/>
				<RecordCollectionClient.Skeleton
					canWrite
					organizationName="Example organization"
					rowCount={3}
				/>
			</div>
		</DashboardSection>
	);
}

function NormalizedTableLive() {
	return (
		<DashboardTablePanel
			columns={normalizedTableColumns}
			getRowKey={(row) => row.item}
			header={
				<Card.Heading
					action={
						<Button size="sm" variant="secondary">
							Export
						</Button>
					}
					actionLayout="responsive"
					description="Detailed records behind the current filters."
					leading={<Icon name="list" size="sm" />}
					title="Budget items"
				/>
			}
			rows={normalizedTableRows}
		/>
	);
}

function NormalizedTableSkeleton() {
	return (
		<DashboardTablePanel.Skeleton
			columns={normalizedTableColumns.map(({ align, header, id }) => ({
				align,
				header,
				id,
			}))}
			header={
				<Card.Heading
					action={
						<Button.Skeleton size="sm" variant="secondary">
							Export
						</Button.Skeleton>
					}
					actionLayout="responsive"
					description="Detailed records behind the current filters."
					leading={<Icon name="list" size="sm" />}
					title="Budget items"
				/>
			}
		>
			{normalizedTableRows.map((row) => (
				<tr key={row.item}>
					<td className="border-b border-border/70 px-4 py-3">
						<Text.Skeleton
							as="span"
							className="max-w-40 text-sm text-muted-foreground"
							tone={null}
							variant={null}
						>
							{normalizedTableRows[0].item}
						</Text.Skeleton>
					</td>
					<td className="border-b border-border/70 px-4 py-3">
						<Text.Skeleton
							as="span"
							className="max-w-24 text-sm text-muted-foreground"
							tone={null}
							variant={null}
						>
							{normalizedTableRows[0].type}
						</Text.Skeleton>
					</td>
					<td className="border-b border-border/70 px-4 py-3">
						<Chip.Skeleton>{normalizedTableRows[0].status}</Chip.Skeleton>
					</td>
					<td className="border-b border-border/70 px-4 py-3 text-right font-medium text-foreground">
						<Text.Skeleton
							as="span"
							className="ml-auto max-w-24 text-sm font-medium text-foreground"
							tone={null}
							variant={null}
						>
							{normalizedTableRows[0].amount}
						</Text.Skeleton>
					</td>
				</tr>
			))}
		</DashboardTablePanel.Skeleton>
	);
}

function Comparison({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<section
			className="grid content-start gap-4"
			data-skeleton-comparison={title}
		>
			<h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
			{children}
		</section>
	);
}
