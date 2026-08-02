"use client";

import { useEffect, useState } from "react";
import {
	ComboboxMultiSelectInput,
	DateRangeInput,
	type DateRangeValue,
	SelectInput,
} from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { showToast } from "@/lib/feedback";
import {
	InternalPage,
	InternalPageHeader,
} from "../../_components/InternalPage";

type ReportStatus = "draft" | "review" | "published";

const statusOptions = [
	{ label: "Any status", value: "any" },
	{ label: "Draft", value: "draft" },
	{ label: "In review", value: "review" },
	{ label: "Published", value: "published" },
];

const topicOptions = [
	{ label: "Acquisition", value: "acquisition" },
	{ label: "Engagement", value: "engagement" },
	{ label: "Revenue", value: "revenue" },
	{ label: "Retention", value: "retention" },
];

const reports: Array<{
	id: string;
	name: string;
	status: ReportStatus;
	topics: string[];
	reportedOn: string;
	updated: string;
}> = [
	{
		id: "activation",
		name: "Activation funnel",
		status: "published",
		topics: ["acquisition", "engagement"],
		reportedOn: "2026-08-01",
		updated: "Today",
	},
	{
		id: "retention",
		name: "Retention cohorts",
		status: "review",
		topics: ["engagement", "retention"],
		reportedOn: "2026-07-31",
		updated: "Yesterday",
	},
	{
		id: "forecast",
		name: "Revenue forecast",
		status: "draft",
		topics: ["revenue"],
		reportedOn: "2026-07-29",
		updated: "Jul 30",
	},
];

const initialRange: DateRangeValue = {
	start: "2026-07-27",
	end: "2026-08-02",
};

function FilterDashboardSkeleton() {
	return (
		<Card aria-label="Loading report filters">
			<Card.Header>
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-80" />
			</Card.Header>
			<Card.Content className="grid gap-4 md:grid-cols-3">
				<Skeleton className="h-20" />
				<Skeleton className="h-20" />
				<Skeleton className="h-20" />
			</Card.Content>
			<Card.Footer className="justify-end gap-2">
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-28" />
			</Card.Footer>
		</Card>
	);
}

export function FilterDashboardBenchmark() {
	const [isLoading, setIsLoading] = useState(true);
	const [dateRange, setDateRange] = useState<DateRangeValue | null>(
		initialRange,
	);
	const [status, setStatus] = useState("any");
	const [topics, setTopics] = useState<string[]>([]);
	const [isApplying, setIsApplying] = useState(false);
	const [appliedFilters, setAppliedFilters] = useState({
		dateRange: initialRange as DateRangeValue | null,
		status: "any",
		topics: [] as string[],
	});
	const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
	const [archivedReportIds, setArchivedReportIds] = useState<string[]>([]);
	const { openConfirmation } = useConfirmationModal();

	useEffect(() => {
		const timeout = window.setTimeout(() => setIsLoading(false), 350);
		return () => window.clearTimeout(timeout);
	}, []);

	const visibleReports = reports.filter((report) => {
		if (archivedReportIds.includes(report.id)) return false;
		if (
			appliedFilters.dateRange &&
			(report.reportedOn < appliedFilters.dateRange.start ||
				report.reportedOn > appliedFilters.dateRange.end)
		) {
			return false;
		}
		if (
			appliedFilters.status !== "any" &&
			report.status !== appliedFilters.status
		) {
			return false;
		}
		return appliedFilters.topics.every((topic) =>
			report.topics.includes(topic),
		);
	});

	function clearFilters() {
		setDateRange(initialRange);
		setStatus("any");
		setTopics([]);
		setAppliedFilters({ dateRange: initialRange, status: "any", topics: [] });
		setSelectedReportIds([]);
	}

	async function applyFilters(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isApplying) return;
		setIsApplying(true);
		try {
			await showToast.promise(
				new Promise<void>((resolve) => window.setTimeout(resolve, 450)),
				{
					loading: "Applying report filters…",
					success: "Report filters applied.",
					error: "Report filters could not be applied.",
				},
			);
			setAppliedFilters({ dateRange, status, topics });
			setSelectedReportIds([]);
		} finally {
			setIsApplying(false);
		}
	}

	function archiveSelectedReports() {
		if (!selectedReportIds.length) return;
		openConfirmation({
			title: "Archive selected reports?",
			description:
				"This benchmark simulates an archive locally and does not persist changes.",
			confirmLabel: "Archive reports",
			details: [
				{
					label: "Selected reports",
					description: `${selectedReportIds.length} local report${selectedReportIds.length === 1 ? "" : "s"}`,
				},
			],
			warning: "The local results list will update after confirmation.",
			onConfirm: () => {
				setArchivedReportIds((current) => [
					...new Set([...current, ...selectedReportIds]),
				]);
				setSelectedReportIds([]);
				showToast.success("Selected reports archived locally.");
				return true;
			},
		});
	}

	return (
		<InternalPage className="gap-8" maxWidth="wide">
			<InternalPageHeader
				description="A disposable local-only benchmark for documented date, selection, feedback, loading, and confirmation owners."
				title="Reports filter benchmark"
			/>

			{isLoading ? (
				<FilterDashboardSkeleton />
			) : (
				<form onSubmit={applyFilters}>
					<Card>
						<Card.Header>
							<Card.Title>Filter reports</Card.Title>
							<Card.Description>
								Refine the local fixture results. Nothing is fetched or saved.
							</Card.Description>
						</Card.Header>
						<Card.Content className="grid gap-4 md:grid-cols-3">
							<DateRangeInput
								label="Reporting period"
								onChange={setDateRange}
								presets={["last_7_days", "last_30_days"]}
								value={dateRange}
							/>
							<SelectInput
								label="Status"
								onChange={setStatus}
								options={statusOptions}
								value={status}
							/>
							<ComboboxMultiSelectInput
								label="Topics"
								onChange={setTopics}
								options={topicOptions}
								placeholder="Search topics"
								value={topics}
							/>
						</Card.Content>
						<Card.Footer className="justify-end gap-2">
							<Button
								disabled={isApplying}
								onClick={clearFilters}
								type="button"
							>
								Clear filters
							</Button>
							<Button loading={isApplying} type="submit" variant="primary">
								Apply filters
							</Button>
						</Card.Footer>
					</Card>
				</form>
			)}

			<section aria-labelledby="report-results-heading" className="grid gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="grid gap-1">
						<Text as="h2" id="report-results-heading" variant="headingSm">
							Local results
						</Text>
						<Text tone="muted" variant="support">
							{visibleReports.length} report
							{visibleReports.length === 1 ? "" : "s"} match the applied
							filters.
						</Text>
					</div>
					{visibleReports.length ? (
						<Button
							onClick={() =>
								setSelectedReportIds(visibleReports.map((report) => report.id))
							}
							size="sm"
							type="button"
						>
							Select visible
						</Button>
					) : null}
				</div>

				{visibleReports.length ? (
					<div className="grid gap-3">
						{visibleReports.map((report) => {
							const isSelected = selectedReportIds.includes(report.id);
							return (
								<Card key={report.id} size="sm">
									<Card.Content className="flex flex-wrap items-center justify-between gap-3 py-3">
										<div className="grid gap-1">
											<Text variant="bodyStrong">{report.name}</Text>
											<Text tone="muted" variant="support">
												{report.status} · Updated {report.updated}
											</Text>
										</div>
										<Button
											onClick={() =>
												setSelectedReportIds((current) =>
													isSelected
														? current.filter((id) => id !== report.id)
														: [...current, report.id],
												)
											}
											size="sm"
											type="button"
											variant={isSelected ? "primary" : "secondary"}
										>
											{isSelected ? "Selected" : "Select"}
										</Button>
									</Card.Content>
								</Card>
							);
						})}
						{selectedReportIds.length ? (
							<Button
								onClick={archiveSelectedReports}
								tone="danger"
								type="button"
							>
								Archive {selectedReportIds.length} selected
							</Button>
						) : null}
					</div>
				) : (
					<Card>
						<Card.Content className="grid gap-1 py-6">
							<Card.Title as="h3">No local reports match</Card.Title>
							<Text tone="muted" variant="support">
								Try clearing or changing the selected filters.
							</Text>
						</Card.Content>
					</Card>
				)}
			</section>
		</InternalPage>
	);
}
