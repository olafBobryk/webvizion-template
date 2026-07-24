import clsx from "clsx";
import Link from "next/link";
import { type Key, type ReactNode, useId } from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { DashboardTableResponsiveController } from "./DashboardTableResponsiveController";
import { DashboardTableSortController } from "./DashboardTableSortController";

export type DashboardTableRenderContext = {
	index: number;
	isLastBodyRow: boolean;
};

export type DashboardTableColumn<Row> = {
	align?: "left" | "right";
	cellClassName?: string;
	header: ReactNode;
	headerClassName?: string;
	id: string;
	kind?: "action" | "data";
	render: (row: Row, context: DashboardTableRenderContext) => ReactNode;
	responsivePriority?: number;
	rowLink?: boolean | ((row: Row, index: number) => boolean);
	sortable?: boolean;
};

function assertActionColumnContract(
	columns: readonly { id: string; kind?: "action" | "data" }[],
) {
	const actionColumns = columns
		.map((column, index) => ({ column, index }))
		.filter(({ column }) => column.kind === "action");
	if (actionColumns.length > 1) {
		throw new Error("Dashboard tables support at most one action column.");
	}
	const actionColumn = actionColumns[0];
	if (actionColumn && actionColumn.index !== columns.length - 1) {
		throw new Error(
			`Dashboard table action column "${actionColumn.column.id}" must be last.`,
		);
	}
}

type DashboardTablePanelProps<Row> = {
	className?: string;
	columns: readonly DashboardTableColumn<Row>[];
	emptyState?: ReactNode;
	getRowAriaLabel?: (row: Row, index: number) => string;
	getRowHref?: (row: Row, index: number) => string | undefined;
	getRowKey: (row: Row, index: number) => Key;
	header: ReactNode;
	id?: string;
	rows: readonly Row[];
	viewMoreHref?: string;
	viewMoreLabel?: ReactNode;
};

function DashboardTablePanelRoot<Row>({
	className,
	columns,
	emptyState,
	getRowAriaLabel,
	getRowHref,
	getRowKey,
	header,
	id,
	rows,
	viewMoreHref,
	viewMoreLabel = "View more",
}: DashboardTablePanelProps<Row>) {
	assertActionColumnContract(columns);
	const generatedId = useId();
	const tableId = id ? `${id}-table` : generatedId;
	const firstLinkColumn = columns.findIndex(
		(column) => column.kind !== "action" && column.rowLink !== false,
	);
	return (
		<Card
			className={clsx("min-w-0 !gap-0 !pb-0", className)}
			id={id}
			overflow="visible"
		>
			{header}
			<Card.Content
				className={rows.length > 0 ? "min-w-0 !px-0" : "min-w-0 py-4"}
			>
				{rows.length > 0 ? (
					<div
						className="relative max-w-full overflow-x-auto"
						data-dashboard-table-scroll=""
					>
						<DashboardTableResponsiveController tableId={tableId} />
						<DashboardTableSortController tableId={tableId} />
						<table
							className="w-full border-separate border-spacing-0 text-sm [&_tbody_tr:last-child_td]:border-b-0"
							id={tableId}
						>
							<thead>
								<tr className="bg-muted/50 text-left text-xs text-muted-foreground">
									{columns.map((column, columnIndex) => {
										const isAction = column.kind === "action";
										const isRequired = columnIndex === 0 || isAction;
										const isSortable = !isAction && column.sortable !== false;
										return (
											<th
												aria-sort={isSortable ? "none" : undefined}
												className={clsx(
													"border-b border-border/70 px-4 py-2.5 font-medium whitespace-nowrap",
													(column.align === "right" || isAction) &&
														"text-right",
													isAction &&
														"sticky right-0 z-10 w-px bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--color-card))]",
													column.headerClassName,
												)}
												data-dashboard-table-column-index={columnIndex}
												data-dashboard-table-kind={column.kind ?? "data"}
												data-dashboard-table-required={isRequired}
												data-dashboard-table-responsive-priority={
													column.responsivePriority
												}
												key={column.id}
												scope="col"
											>
												{!isSortable ? (
													column.header
												) : (
													<button
														className={clsx(
															"group -mx-1.5 -my-1 inline-flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors motion-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
															(column.align === "right" || isAction) &&
																"ml-auto",
														)}
														data-column-index={columnIndex}
														data-dashboard-table-sort-header=""
														data-sort-direction="neutral"
														type="button"
													>
														<span className="truncate">{column.header}</span>
														<Icon
															className="text-muted-foreground transition-transform group-data-[sort-direction=ascending]:rotate-180"
															name="chevron-down"
															size="sm"
														/>
													</button>
												)}
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								{rows.map((row, index) => {
									const href = getRowHref?.(row, index);
									const context = {
										index,
										isLastBodyRow: index === rows.length - 1,
									};
									return (
										<tr
											className={clsx(
												"group/table-row",
												href && "cursor-pointer",
											)}
											data-original-index={index}
											key={getRowKey(row, index)}
										>
											{columns.map((column, columnIndex) => {
												const isAction = column.kind === "action";
												const usesRowLink =
													!isAction && typeof column.rowLink === "function"
														? column.rowLink(row, index)
														: !isAction && column.rowLink !== false;
												const linked = Boolean(href) && usesRowLink;
												return (
													<td
														className={clsx(
															"border-b border-border/70 text-muted-foreground transition-colors group-hover/table-row:bg-muted/55 group-focus-within/table-row:bg-muted/55",
															linked
																? "p-0"
																: clsx(
																		"px-4 py-3",
																		context.isLastBodyRow && "pb-4",
																	),
															columnIndex === 0
																? "min-w-0 overflow-hidden"
																: "whitespace-nowrap",
															(column.align === "right" || isAction) &&
																"text-right",
															isAction &&
																"sticky right-0 z-10 w-px bg-card group-hover/table-row:bg-muted group-focus-within/table-row:bg-muted",
															column.cellClassName,
														)}
														data-dashboard-table-column-index={columnIndex}
														data-dashboard-table-kind={column.kind ?? "data"}
														data-dashboard-table-required={
															columnIndex === 0 || isAction
														}
														data-dashboard-table-responsive-priority={
															column.responsivePriority
														}
														key={column.id}
													>
														{linked && href ? (
															<Link
																aria-label={
																	columnIndex === firstLinkColumn
																		? getRowAriaLabel?.(row, index)
																		: undefined
																}
																className={clsx(
																	"block px-4 py-3 text-current outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30",
																	context.isLastBodyRow && "pb-4",
																)}
																href={href}
																tabIndex={
																	columnIndex === firstLinkColumn
																		? undefined
																		: -1
																}
															>
																{column.render(row, context)}
															</Link>
														) : (
															column.render(row, context)
														)}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
						</table>
						{viewMoreHref ? (
							<div className="flex justify-center border-t border-border/70 p-3">
								<Button href={viewMoreHref} size="sm" variant="secondary">
									{viewMoreLabel}
								</Button>
							</div>
						) : null}
					</div>
				) : (
					emptyState
				)}
			</Card.Content>
		</Card>
	);
}

type DashboardTablePanelSkeletonProps = {
	children: ReactNode;
	className?: string;
	columns: readonly {
		align?: "left" | "right";
		header: ReactNode;
		headerClassName?: string;
		id: string;
		kind?: "action" | "data";
		responsivePriority?: number;
		sortable?: boolean;
	}[];
	header: ReactNode;
	id?: string;
	viewMoreLabel?: ReactNode;
};

export function DashboardTablePanelSkeleton({
	children,
	className,
	columns,
	header,
	id,
	viewMoreLabel,
}: DashboardTablePanelSkeletonProps) {
	assertActionColumnContract(columns);
	const generatedId = useId();
	const tableId = id ? `${id}-skeleton-table` : generatedId;
	return (
		<Card
			className={clsx("min-w-0 !gap-0 !pb-0", className)}
			id={id ? `${id}-skeleton` : undefined}
			overflow="visible"
		>
			{header}
			<Card.Content className="min-w-0 !px-0">
				<div
					className="relative max-w-full overflow-x-auto"
					data-dashboard-table-scroll=""
				>
					<DashboardTableResponsiveController tableId={tableId} />
					<table
						className="w-full border-separate border-spacing-0 text-sm [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child_td]:pb-4"
						id={tableId}
					>
						<thead>
							<tr className="bg-muted/50 text-left text-xs text-muted-foreground">
								{columns.map((column, columnIndex) => {
									const isAction = column.kind === "action";
									const isSortable = !isAction && column.sortable !== false;
									return (
										<th
											className={clsx(
												"border-b border-border/70 px-4 py-2.5 font-medium whitespace-nowrap",
												(column.align === "right" ||
													column.kind === "action") &&
													"text-right",
												column.kind === "action" &&
													"sticky right-0 z-10 w-px bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--color-card))]",
												column.headerClassName,
											)}
											data-dashboard-table-column-index={columnIndex}
											data-dashboard-table-kind={column.kind ?? "data"}
											data-dashboard-table-required={
												columnIndex === 0 || column.kind === "action"
											}
											data-dashboard-table-responsive-priority={
												column.responsivePriority
											}
											key={column.id}
										>
											{!isSortable ? (
												column.header
											) : (
												<button
													aria-disabled="true"
													className={clsx(
														"group -mx-1.5 -my-1 inline-flex items-center gap-2 rounded-md px-1.5 py-1",
														column.align === "right" && "ml-auto",
													)}
													tabIndex={-1}
													type="button"
												>
													<span className="truncate">{column.header}</span>
													<Icon name="chevron-down" size="sm" />
												</button>
											)}
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>{children}</tbody>
					</table>
					{viewMoreLabel ? (
						<div className="flex justify-center border-t border-border/70 p-3">
							<Button.Skeleton size="sm" variant="secondary">
								{viewMoreLabel}
							</Button.Skeleton>
						</div>
					) : null}
				</div>
			</Card.Content>
		</Card>
	);
}

export const DashboardTablePanel = Object.assign(DashboardTablePanelRoot, {
	Skeleton: DashboardTablePanelSkeleton,
});
