"use client";

import * as React from "react";
import { DashboardTablePanel } from "@/app/(site)/dashboard/_components/data/DashboardTablePanel";
import { DashboardEntityState } from "@/app/(site)/dashboard/_components/entities/DashboardEntityState";
import { MemberIdentity } from "@/app/(site)/dashboard/_components/entities/member/MemberIdentity";
import { OrganizationIdentity } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity";
import {
	FEEDBACK_CATEGORIES,
	FEEDBACK_SEVERITIES,
	type FeedbackCategory,
	type FeedbackSeverity,
	type FeedbackStatus,
	type ProductReport,
} from "@/app/(site)/dashboard/_lib/platform/contracts";
import {
	getPlatformMemberPresentation,
	getPlatformOrganizationPresentation,
} from "@/app/(site)/dashboard/_lib/platform/entities";
import {
	feedbackCategoryPresentation,
	feedbackSeverityPresentation,
	feedbackStatusPresentation,
	formatPlatformDate,
	productReportMatchesQuery,
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
import {
	FeedbackSeverityChip,
	FeedbackStatusChip,
} from "../../_components/PlatformStatusChip";

type StatusFilter = "all" | FeedbackStatus;
type CategoryFilter = "all" | FeedbackCategory;
type SeverityFilter = "all" | FeedbackSeverity;

const statusOptions: SelectOption<StatusFilter>[] = [
	{ label: "All statuses", value: "all" },
	...Object.entries(feedbackStatusPresentation).map(([value, item]) => ({
		label: item.label,
		value: value as FeedbackStatus,
	})),
];
const categoryOptions: SelectOption<CategoryFilter>[] = [
	{ label: "All categories", value: "all" },
	...FEEDBACK_CATEGORIES.map((value) => ({
		label: feedbackCategoryPresentation[value],
		value,
	})),
];
const severityOptions: SelectOption<SeverityFilter>[] = [
	{ label: "All severities", value: "all" },
	...FEEDBACK_SEVERITIES.map((value) => ({
		label: feedbackSeverityPresentation[value].label,
		value,
	})),
];

export function PlatformReportsContent({
	reports,
}: {
	reports: readonly ProductReport[];
}) {
	const [query, setQuery] = React.useState("");
	const [status, setStatus] = React.useState<StatusFilter>("all");
	const [category, setCategory] = React.useState<CategoryFilter>("all");
	const [severity, setSeverity] = React.useState<SeverityFilter>("all");
	const visibleReports = reports.filter(
		(report) =>
			(status === "all" || report.status === status) &&
			(category === "all" || report.category === category) &&
			(severity === "all" || report.severity === severity) &&
			productReportMatchesQuery(report, query),
	);

	return (
		<div className="grid min-w-0 gap-5">
			<DashboardTablePanel
				columns={[
					{
						header: "Reporter",
						id: "reporter",
						render: (report) => (
							<MemberIdentity
								presentation={getPlatformMemberPresentation(report)}
								variant="compact"
							/>
						),
					},
					{
						header: "Organization",
						id: "organization",
						render: (report) => (
							<OrganizationIdentity
								avatarSize="sm"
								presentation={getPlatformOrganizationPresentation(report)}
							/>
						),
						responsivePriority: 50,
						rowLink: false,
					},
					{
						header: "Route",
						id: "route",
						render: (report) => (
							<span className="grid min-w-0">
								<Text
									as="span"
									className="max-w-64 truncate"
									variant="bodyStrong"
								>
									{report.currentRoute}
								</Text>
								<Text
									as="span"
									className="max-w-64 truncate"
									tone="muted"
									variant="caption"
								>
									{feedbackCategoryPresentation[report.category]}
								</Text>
							</span>
						),
						responsivePriority: 40,
					},
					{
						header: "Severity",
						id: "severity",
						render: (report) => (
							<FeedbackSeverityChip severity={report.severity} />
						),
						responsivePriority: 30,
						rowLink: false,
					},
					{
						header: "Status",
						id: "status",
						render: (report) => <FeedbackStatusChip status={report.status} />,
						responsivePriority: 20,
						rowLink: false,
					},
					{
						header: "Created",
						id: "created",
						render: (report) => formatPlatformDate(report.createdAt),
						responsivePriority: 10,
					},
					{
						align: "right",
						header: "Actions",
						id: "actions",
						kind: "action",
						render: (report) => (
							<Button
								aria-label={`Open report from ${report.name}`}
								href={surfaceHref("dashboard.platform.report", {
									id: report.id,
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
						description="Structured issue reports submitted from the dashboard will appear here."
						iconName="flag"
						title="No product reports match"
					/>
				}
				getRowAriaLabel={(report) => `Open report from ${report.name}`}
				getRowHref={(report) =>
					surfaceHref("dashboard.platform.report", { id: report.id })
				}
				getRowKey={(report) => report.id}
				header={
					<Card.Header className="min-w-0">
						<Card.Title className="inline-flex min-w-0 flex-wrap items-center gap-2">
							Product reports
						</Card.Title>
						<Card.Description className="min-w-0 break-words">
							Showing {visibleReports.length} of {reports.length} reports.
						</Card.Description>
						<div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_13rem] xl:items-end">
							<TextInput
								label="Search reports"
								onChange={setQuery}
								placeholder="Reporter, organization, route, or feedback"
								value={query}
							/>
							<SelectInput
								label="Status"
								onChange={setStatus}
								options={statusOptions}
								value={status}
							/>
							<SelectInput
								label="Category"
								onChange={setCategory}
								options={categoryOptions}
								value={category}
							/>
							<SelectInput
								label="Severity"
								onChange={setSeverity}
								options={severityOptions}
								value={severity}
							/>
						</div>
					</Card.Header>
				}
				id="platform-reports"
				rows={visibleReports}
			/>
		</div>
	);
}
