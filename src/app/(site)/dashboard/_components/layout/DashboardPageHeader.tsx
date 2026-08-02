import clsx from "clsx";
import type * as React from "react";
import { Text } from "@/components/ui/primitives/Text";

function DashboardPageHeaderRoot({
	action,
	actionClassName,
	description,
	title,
}: {
	action?: React.ReactNode;
	actionClassName?: string;
	description?: React.ReactNode;
	title: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="grid min-w-0 gap-1">
				<Text as="h1" className="min-w-0 truncate" variant="headingPage">
					{title}
				</Text>
				{typeof description === "string" ? (
					<Text tone="muted" variant="support">
						{description}
					</Text>
				) : description ? (
					<div className="text-sm leading-6 text-muted-foreground">
						{description}
					</div>
				) : null}
			</div>
			{action ? (
				<div className={clsx("shrink-0", actionClassName)}>{action}</div>
			) : null}
		</div>
	);
}

function DashboardPageHeaderSkeleton({
	action,
	description,
	title = "Dashboard page",
}: {
	action?: React.ReactNode;
	description?: React.ReactNode;
	title?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="grid min-w-0 gap-1">
				<Text.Skeleton
					as="h1"
					className="min-w-0 truncate"
					variant="headingPage"
				>
					{title}
				</Text.Skeleton>
				{description ? (
					<Text.Skeleton tone="muted" variant="support">
						{description}
					</Text.Skeleton>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}

export const DashboardPageHeader = Object.assign(DashboardPageHeaderRoot, {
	Skeleton: DashboardPageHeaderSkeleton,
});
