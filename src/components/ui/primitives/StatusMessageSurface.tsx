import clsx from "clsx";
import type * as React from "react";
import {
	type AccentTone,
	getAccentClassName,
	getAccentForegroundClassName,
	getAccentStyle,
} from "./accent";

export type StatusMessageTone = Exclude<AccentTone, "neutral">;

export type StatusMessageProps = React.HTMLAttributes<HTMLParagraphElement> & {
	tone?: StatusMessageTone;
};

export function StatusMessageSurface({
	children,
	className,
	style,
	tone = "info",
	...rest
}: StatusMessageProps) {
	return (
		<p
			className={clsx(
				"rounded-lg border px-3 py-2 text-sm leading-6",
				getAccentClassName(tone, "surface", { solidBackground: true }),
				getAccentForegroundClassName(tone),
				className,
			)}
			data-accent={tone}
			data-solid-accent-background
			style={{
				...getAccentStyle(tone, "surface", { solidBackground: true }),
				...style,
			}}
			{...rest}
		>
			{children}
		</p>
	);
}
