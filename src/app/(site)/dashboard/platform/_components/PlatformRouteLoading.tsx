"use client";

import clsx from "clsx";
import { DashboardTablePanel } from "@/app/(site)/dashboard/_components/data/DashboardTablePanel";
import { MemberIdentity } from "@/app/(site)/dashboard/_components/entities/member/MemberIdentity";
import { DashboardSection } from "@/app/(site)/dashboard/_components/layout/DashboardSection";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";

const rows = ["alpha", "bravo", "charlie"];

const platformDestinations = [
	{
		description: "Review support requests submitted from dashboard support.",
		icon: "mail",
		label: "Inbox",
	},
	{
		description: "Review product reports captured from dashboard routes.",
		icon: "flag",
		label: "Reports",
	},
] as const;

export function PlatformOverviewLoading() {
	return (
		<div aria-busy="true" aria-label="Loading Platform" role="status">
			<DashboardSection
				contentClassName="grid gap-4 md:grid-cols-2"
				description="Open internal platform support and report operations."
				title="Platform"
			>
				{platformDestinations.map((destination) => (
					<Card key={destination.label}>
						<Card.Header>
							<Card.Title className="inline-flex items-center gap-2">
								<Icon name={destination.icon} size="sm" />
								{destination.label}
							</Card.Title>
							<Card.Description>{destination.description}</Card.Description>
						</Card.Header>
						<Card.Content>
							<Button.Skeleton size="sm" variant="secondary">
								Open {destination.label.toLowerCase()}
							</Button.Skeleton>
						</Card.Content>
					</Card>
				))}
			</DashboardSection>
		</div>
	);
}

export function PlatformCollectionLoading({
	columns,
	description,
	label,
	title,
}: {
	columns: readonly { id: string; kind?: "action" | "data"; label: string }[];
	description: string;
	label: string;
	title: string;
}) {
	return (
		<div aria-busy="true" aria-label={label} role="status">
			<DashboardSection
				contentClassName="grid gap-5"
				description={description}
				title={title}
			>
				<DashboardTablePanel.Skeleton
					columns={columns.map((column) => ({
						header: column.label,
						id: column.id,
						kind: column.kind,
						sortable: column.kind !== "action",
					}))}
					header={
						<Card.Header className="min-w-0">
							<Card.Title className="inline-flex min-w-0 flex-wrap items-center gap-2">
								{title}
							</Card.Title>
							<Card.Description className="min-w-0 break-words">
								Showing fixture management entries.
							</Card.Description>
							<div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
								<div className="h-9 rounded-full bg-muted/80" />
								<div className="h-9 rounded-full bg-muted/80" />
							</div>
						</Card.Header>
					}
				>
					{rows.map((row) => (
						<tr key={row}>
							{columns.map((column, index) => {
								const action = column.kind === "action";
								return (
									<td
										className={clsx(
											"border-b border-border/70 px-4 py-3 text-muted-foreground",
											action && "sticky right-0 w-px bg-card text-right",
										)}
										data-dashboard-table-column-index={index}
										data-dashboard-table-kind={column.kind ?? "data"}
										data-dashboard-table-required={
											index === 0 || action ? "true" : undefined
										}
										key={column.id}
									>
										{index === 0 ? (
											<MemberIdentity.Skeleton variant="compact" />
										) : action ? (
											<Button.Skeleton leadingIcon size="icon-sm" />
										) : (
											<Text.Skeleton as="span" variant="support">
												{column.label} value
											</Text.Skeleton>
										)}
									</td>
								);
							})}
						</tr>
					))}
				</DashboardTablePanel.Skeleton>
			</DashboardSection>
		</div>
	);
}

export function PlatformDetailLoading({
	description,
	label,
	title,
}: {
	description: string;
	label: string;
	title: string;
}) {
	return (
		<div aria-busy="true" aria-label={label} role="status">
			<DashboardSection
				actions={
					<Button.Skeleton size="md">Back to collection</Button.Skeleton>
				}
				contentClassName="grid gap-5"
				description={description}
				title={title}
			>
				<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
					<div className="grid gap-5">
						{["Content", "Requester context"].map((cardTitle) => (
							<Card key={cardTitle}>
								<Card.Header>
									<Card.Title>
										<Text.Skeleton variant="headingXs">
											{cardTitle}
										</Text.Skeleton>
									</Card.Title>
									<Card.Description>
										<Text.Skeleton variant="support">
											Platform management detail
										</Text.Skeleton>
									</Card.Description>
								</Card.Header>
								<Card.Content className="grid gap-3">
									<Text.Skeleton variant="body">
										Fixture detail content and server-resolved context
									</Text.Skeleton>
								</Card.Content>
							</Card>
						))}
					</div>
					<Card className="self-start">
						<Card.Header>
							<Card.Title>
								<Text.Skeleton variant="headingXs">Triage</Text.Skeleton>
							</Card.Title>
						</Card.Header>
						<Card.Content className="grid gap-4">
							<div className="h-9 rounded-full bg-muted/80" />
							<div className="h-28 rounded-2xl bg-muted/80" />
						</Card.Content>
					</Card>
				</div>
			</DashboardSection>
		</div>
	);
}
