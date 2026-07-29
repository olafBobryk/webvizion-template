"use client";

import clsx from "clsx";
import * as React from "react";
import {
	Dropdown,
	type DropdownTriggerRenderProps,
} from "@/components/ui/primitives/dropdown";
import { Text } from "@/components/ui/primitives/Text";

type TooltipProps = {
	content: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
	align?: "start" | "end";
	offset?: number;
};

export function Tooltip({
	content,
	children,
	className,
	contentClassName,
	align = "start",
	offset = 8,
}: TooltipProps) {
	const renderTrigger = React.useCallback(
		(props: DropdownTriggerRenderProps) => (
			// biome-ignore lint/a11y/noStaticElementInteractions: hover and focus are delegated through Dropdown trigger props
			<span
				ref={props.ref as React.Ref<HTMLSpanElement>}
				className={clsx("inline-flex", props.className, className)}
				onMouseEnter={props.onRootMouseEnter}
				onMouseLeave={props.onRootMouseLeave}
				onFocus={props.onRootMouseEnter}
				onBlur={props.onRootMouseLeave}
			>
				{children}
			</span>
		),
		[children, className],
	);

	return (
		<Dropdown
			renderTrigger={renderTrigger}
			menuClassName={clsx(
				"rounded-[10px] border border-border bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm",
				contentClassName,
			)}
			renderMenu={() =>
				typeof content === "string" ? (
					<Text variant="body" tone="muted" as="p">
						{content}
					</Text>
				) : (
					content
				)
			}
			openOnHover
			pinOnClick={false}
			autoFocusMenu={false}
			align={align}
			offset={offset}
			menuMinWidth={0}
			menuWidth={150}
		/>
	);
}
