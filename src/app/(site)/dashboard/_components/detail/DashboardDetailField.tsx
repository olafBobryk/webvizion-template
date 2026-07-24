import clsx from "clsx";
import { Text } from "@/components/ui/primitives/Text";
import type {
	DashboardDetailFieldProps,
	DashboardDetailFieldSkeletonProps,
} from "./DashboardDetailField.shared";
import { DashboardDetailFieldClient } from "./DashboardDetailFieldClient";

function DashboardDetailFieldRoot(props: DashboardDetailFieldProps) {
	return <DashboardDetailFieldClient {...props} />;
}

export function DashboardDetailFieldSkeleton({
	children,
	className,
	copyable: _copyable = false,
	icon,
	label,
	labelClassName,
	truncateValue = true,
	value = "Account detail",
	valueClassName,
}: DashboardDetailFieldSkeletonProps) {
	return (
		<div
			className={clsx("grid min-w-0 self-start content-start gap-2", className)}
		>
			<dt
				className={clsx(
					"flex items-center gap-2 text-xs font-medium text-muted-foreground",
					labelClassName,
				)}
			>
				{icon}
				{label}
			</dt>
			<dd className="min-w-0">
				{children ? (
					children
				) : (
					<span className="inline-flex max-w-full min-w-0 items-center gap-2">
						<Text.Skeleton
							as="span"
							className={clsx(
								"max-w-52 text-sm font-medium text-foreground",
								truncateValue && "truncate",
								valueClassName,
							)}
							tone={null}
							variant={null}
						>
							{value}
						</Text.Skeleton>
					</span>
				)}
			</dd>
		</div>
	);
}

export const DashboardDetailField = Object.assign(DashboardDetailFieldRoot, {
	Skeleton: DashboardDetailFieldSkeleton,
});

export type { DashboardDetailFieldProps, DashboardDetailFieldSkeletonProps };
