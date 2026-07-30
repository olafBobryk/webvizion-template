"use client";

import clsx from "clsx";
import {
	CopyStatusIcon,
	useCopyAction,
} from "@/components/ui/helpers/useCopyAction";
import { Button } from "@/components/ui/primitives/Button";
import type { DashboardDetailFieldProps } from "./DashboardDetailField.shared";

export function DashboardDetailFieldClient({
	actionLabel,
	className,
	copyLabel = "Copy value",
	copyValue,
	disabled = false,
	href,
	icon,
	label,
	labelClassName,
	onClick,
	truncateValue = true,
	value,
	valueClassName: valueClassNameProp,
}: DashboardDetailFieldProps) {
	const copyTarget = copyValue?.trim() ?? "";
	const isCopyable = copyTarget.length > 0;
	const { copied, handleCopy } = useCopyAction({
		toastMessage: "Copied to clipboard",
		value: copyTarget,
	});
	const interactive = Boolean(href || onClick || isCopyable);
	const valueClassName = clsx(
		"min-w-0 text-sm font-medium text-foreground",
		truncateValue && "truncate",
		valueClassNameProp,
	);
	const controlClassName = clsx(
		"max-w-full min-w-0 !rounded-sm text-left",
		valueClassName,
	);
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
				{href ? (
					<Button
						align="left"
						aria-label={actionLabel}
						className={controlClassName}
						href={href}
						onClick={onClick}
						size="none"
						variant="ghost"
					>
						{value}
					</Button>
				) : interactive ? (
					<Button
						align="left"
						aria-label={actionLabel ?? (isCopyable ? copyLabel : undefined)}
						className={controlClassName}
						contentClassName="min-w-0 gap-2"
						disabled={disabled}
						onClick={onClick ?? handleCopy}
						size="none"
						variant="ghost"
					>
						<span className="inline-flex min-w-0 items-center gap-2">
							<span className="truncate">{value}</span>
							{isCopyable ? (
								<CopyStatusIcon
									className="size-3.5 shrink-0 text-muted-foreground"
									copied={copied}
								/>
							) : null}
						</span>
					</Button>
				) : (
					<span className={valueClassName}>{value}</span>
				)}
			</dd>
		</div>
	);
}
