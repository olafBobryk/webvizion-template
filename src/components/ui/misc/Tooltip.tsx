"use client";

import clsx from "clsx";
import * as React from "react";
import {
	Dropdown,
	type DropdownTriggerRenderProps,
} from "@/components/ui/primitives/dropdown";
import { Text } from "@/components/ui/primitives/Text";

export type TooltipProps = {
	content: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
	align?: "start" | "end";
	offset?: number;
	width?: number;
};

export function Tooltip({
	content,
	children,
	className,
	contentClassName,
	align = "start",
	offset = 8,
	width = 150,
}: TooltipProps) {
	const contentId = React.useId();
	const renderTrigger = React.useCallback(
		(props: DropdownTriggerRenderProps) => {
			const describedChild = React.isValidElement(children)
				? React.cloneElement(
						children as React.ReactElement<{ "aria-describedby"?: string }>,
						{
							"aria-describedby": props.isOpen
								? [
										(children.props as { "aria-describedby"?: string })[
											"aria-describedby"
										],
										contentId,
									]
										.filter(Boolean)
										.join(" ")
								: (children.props as { "aria-describedby"?: string })[
										"aria-describedby"
									],
						},
					)
				: children;

			return (
				// biome-ignore lint/a11y/noStaticElementInteractions: hover and focus are delegated through Dropdown trigger props
				<span
					ref={props.ref as React.Ref<HTMLSpanElement>}
					className={clsx("inline-flex", props.className, className)}
					onMouseEnter={props.onRootMouseEnter}
					onMouseLeave={props.onRootMouseLeave}
					onFocus={props.onRootMouseEnter}
					onBlur={props.onRootMouseLeave}
				>
					{describedChild}
				</span>
			);
		},
		[children, className, contentId],
	);

	return (
		<Dropdown
			renderTrigger={renderTrigger}
			menuElevation="panel"
			menuClassName={clsx("px-3 py-2 text-xs", contentClassName)}
			renderMenu={() => (
				<div id={contentId} role="tooltip">
					{typeof content === "string" ? (
						<Text as="p" theme="inherit" tone="inherit" variant="body">
							{content}
						</Text>
					) : (
						content
					)}
				</div>
			)}
			openOnHover
			pinOnClick={false}
			autoFocusMenu={false}
			positionStrategy="fixed"
			align={align}
			offset={offset}
			menuMinWidth={0}
			menuWidth={width}
		/>
	);
}
