"use client";

import * as React from "react";
import { DashboardTablePanel } from "@/app/(site)/dashboard/_components/data/DashboardTablePanel";
import { DashboardEntityState } from "@/app/(site)/dashboard/_components/entities/DashboardEntityState";
import { MemberIdentity } from "@/app/(site)/dashboard/_components/entities/member/MemberIdentity";
import { OrganizationIdentity } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity";
import type {
	SupportRequest,
	SupportRequestStatus,
} from "@/app/(site)/dashboard/_lib/platform/contracts";
import {
	getPlatformMemberPresentation,
	getPlatformOrganizationPresentation,
} from "@/app/(site)/dashboard/_lib/platform/entities";
import {
	formatPlatformDate,
	supportRequestMatchesQuery,
	supportStatusPresentation,
} from "@/app/(site)/dashboard/_lib/platform/presentation";
import {
	SelectInput,
	type SelectOption,
	TextInput,
} from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { surfaceHref } from "@/lib/routes";
import { SupportStatusChip } from "../../_components/PlatformStatusChip";

type StatusFilter = "all" | SupportRequestStatus;

const statusOptions: SelectOption<StatusFilter>[] = [
	{ label: "All statuses", value: "all" },
	...Object.entries(supportStatusPresentation).map(([value, item]) => ({
		label: item.label,
		value: value as SupportRequestStatus,
	})),
];

export function PlatformInboxContent({
	requests,
}: {
	requests: readonly SupportRequest[];
}) {
	const [query, setQuery] = React.useState("");
	const [status, setStatus] = React.useState<StatusFilter>("all");
	const visibleRequests = requests.filter(
		(request) =>
			(status === "all" || request.status === status) &&
			supportRequestMatchesQuery(request, query),
	);

	return (
		<div className="grid min-w-0 gap-5">
			<DashboardTablePanel
				columns={[
					{
						header: "Requester",
						id: "requester",
						render: (request) => (
							<MemberIdentity
								presentation={getPlatformMemberPresentation(request)}
								variant="compact"
							/>
						),
					},
					{
						header: "Subject",
						id: "subject",
						render: (request) => (
							<span className="grid min-w-0">
								<Text
									as="span"
									className="max-w-72 truncate"
									variant="bodyStrong"
								>
									{request.subject}
								</Text>
								<Text
									as="span"
									className="max-w-72 truncate"
									tone="muted"
									variant="caption"
								>
									{request.message}
								</Text>
							</span>
						),
						responsivePriority: 30,
					},
					{
						header: "Organization",
						id: "organization",
						render: (request) => (
							<OrganizationIdentity
								avatarSize="sm"
								presentation={getPlatformOrganizationPresentation(request)}
							/>
						),
						responsivePriority: 40,
						rowLink: false,
					},
					{
						header: "Status",
						id: "status",
						render: (request) => <SupportStatusChip status={request.status} />,
						responsivePriority: 20,
						rowLink: false,
					},
					{
						header: "Created",
						id: "created",
						render: (request) => formatPlatformDate(request.createdAt),
						responsivePriority: 10,
					},
					{
						align: "right",
						header: "Actions",
						id: "actions",
						kind: "action",
						render: (request) => (
							<Button
								aria-label={`Open ${request.subject}`}
								href={surfaceHref("dashboard.platform.inbox.request", {
									id: request.id,
								})}
								leadingIcon="arrow-right"
								size="icon-sm"
								variant="ghost"
							/>
						),
						rowLink: false,
						sortable: false,
					},
				]}
				emptyState={
					<DashboardEntityState
						description="New dashboard support submissions will appear here."
						iconName="mail"
						title="No support requests match"
					/>
				}
				getRowAriaLabel={(request) => `Open ${request.subject}`}
				getRowHref={(request) =>
					surfaceHref("dashboard.platform.inbox.request", { id: request.id })
				}
				getRowKey={(request) => request.id}
				header={
					<Card.Header className="min-w-0">
						<Card.Title className="inline-flex min-w-0 flex-wrap items-center gap-2">
							Support requests
						</Card.Title>
						<Card.Description className="min-w-0 break-words">
							Showing {visibleRequests.length} of {requests.length} support
							requests.
						</Card.Description>
						<div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
							<TextInput
								label="Search Inbox"
								onChange={setQuery}
								placeholder="Requester, subject, organization, or message"
								value={query}
							/>
							<SelectInput
								label="Status"
								onChange={setStatus}
								options={statusOptions}
								value={status}
							/>
						</div>
					</Card.Header>
				}
				id="platform-inbox"
				rows={visibleRequests}
			/>
		</div>
	);
}
