"use client";

import clsx from "clsx";
import type * as React from "react";
import type { IconName } from "@/components/ui/icons/Icon";
import { StateIndicator, type StateIndicatorProps } from "./State";

export type ErrorStateProps = {
	title?: React.ReactNode;
	description?: React.ReactNode;
	iconName?: IconName;
	iconSize?: "sm" | "md" | "lg";
	iconAnimate?: boolean;
	actionLabel?: string;
	onAction?: () => void;
	action?: React.ReactNode;
	className?: string;
	iconClassName?: string;
	titleClassName?: string;
	descriptionClassName?: string;
	actionClassName?: string;
} & Pick<StateIndicatorProps, "variant" | "layout" | "align">;

export function ErrorState({
	title = "Something went wrong",
	description = "Please try again in a moment.",
	iconName = "warning",
	iconSize = "md",
	iconAnimate = true,
	variant = "plain",
	layout = "inline",
	align = "left",
	actionLabel = "Try again",
	onAction,
	action,
	className,
	iconClassName,
	titleClassName,
	descriptionClassName,
	actionClassName,
}: ErrorStateProps) {
	return (
		<StateIndicator
			variant={variant}
			title={title}
			description={description}
			iconName={iconName}
			iconSize={iconSize}
			iconAnimate={iconAnimate}
			layout={layout}
			align={align}
			actionLabel={actionLabel}
			onAction={onAction}
			action={action}
			className={className}
			iconClassName={clsx("text-danger-text", iconClassName)}
			titleClassName={titleClassName}
			descriptionClassName={descriptionClassName}
			actionClassName={actionClassName}
		/>
	);
}
