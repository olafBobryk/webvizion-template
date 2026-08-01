// components/ui/primitives/InputFrame.tsx
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Skeleton } from "@/components/ui/misc/Skeleton";

export const inputFrameChromeClassName =
	"min-w-0 rounded-3xl border border-transparent bg-input/50 text-foreground";

const inputFrameVariants = cva(
	`flex items-stretch gap-2.5 transition-[color,box-shadow,background-color] outline-none ${inputFrameChromeClassName}`,
	{
		variants: {
			presentation: {
				default: "",
				composer: "!rounded-2xl !bg-background",
			},
			size: {
				sm: "h-9",
				md: "min-h-[40px]",
				lg: "min-h-[48px]",
			},
			tone: {
				default: focusRing.fieldDefault,
				error: focusRing.fieldError,
				success: focusRing.fieldSuccess,
			},
			fullWidth: {
				true: "w-full",
			},
			disabled: {
				true: "pointer-events-none cursor-not-allowed",
			},
		},
		defaultVariants: {
			presentation: "default",
			size: "sm",
			tone: "default",
		},
	},
);

export const inputPaddingXClasses = {
	sm: "px-3",
	md: "px-[15px]",
	lg: "px-4",
} as const;

const inputPaddingYClasses = {
	sm: "py-1",
	md: "py-2.5",
	lg: "py-3",
} as const;

const inputFrameStartPaddingClasses = {
	sm: "pl-3",
	md: "pl-[15px]",
	lg: "pl-4",
} as const;

const inputFrameEndPaddingClasses = {
	sm: "pr-3",
	md: "pr-[15px]",
	lg: "pr-4",
} as const;

const inputSizeClasses = {
	sm: `${inputPaddingXClasses.sm} ${inputPaddingYClasses.sm} text-base md:text-sm`,
	md: `${inputPaddingXClasses.md} ${inputPaddingYClasses.md} text-sm`,
	lg: `${inputPaddingXClasses.lg} ${inputPaddingYClasses.lg} text-base`,
} as const;

export const inputVariants = cva(
	"h-full w-full min-w-0 bg-transparent px-0 text-left text-foreground outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: inputSizeClasses,
			hasStart: {
				true: "!pl-0",
			},
			hasEnd: {
				true: "!pr-0",
			},
			disabled: {
				true: "cursor-not-allowed",
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);

export const inputTextClasses = inputVariants();

export type InputFrameSize = NonNullable<
	VariantProps<typeof inputFrameVariants>["size"]
>;

export type InputFrameProps = {
	start?: React.ReactNode;
	end?: React.ReactNode;
	fullWidth?: boolean;
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
} & VariantProps<typeof inputFrameVariants> &
	React.HTMLAttributes<HTMLDivElement>;

const InputFrameRoot = React.forwardRef<HTMLDivElement, InputFrameProps>(
	function InputFrame(
		{
			start,
			end,
			children,
			className,
			contentClassName,
			presentation,
			size,
			tone,
			fullWidth,
			disabled,
			...rest
		},
		ref,
	) {
		const wrapperClass = clsx(
			inputFrameVariants({
				size,
				tone,
				fullWidth: fullWidth ? true : undefined,
				disabled,
				presentation,
			}),
			start ? inputFrameStartPaddingClasses[size ?? "sm"] : undefined,
			end ? inputFrameEndPaddingClasses[size ?? "sm"] : undefined,
			className,
		);

		return (
			<div
				ref={ref}
				className={wrapperClass}
				aria-invalid={tone === "error" || undefined}
				data-disabled={disabled ? true : undefined}
				data-slot="input-frame"
				{...rest}
			>
				{start ? (
					<span className="flex items-center shrink-0">{start}</span>
				) : null}
				<div className={clsx("flex-1 min-w-0", contentClassName)}>
					{children}
				</div>
				{end ? <span className="flex items-center shrink-0">{end}</span> : null}
			</div>
		);
	},
);

export type InputFrameSkeletonProps = Omit<
	InputFrameProps,
	"children" | "disabled" | "tone"
> & {
	children?: React.ReactNode;
	radius?: "pill" | "textarea";
	skeletonClassName?: string;
};

export function InputFrameSkeleton({
	children,
	className,
	contentClassName: _contentClassName,
	end: _end,
	fullWidth,
	radius = "pill",
	size = "sm",
	skeletonClassName,
	start: _start,
	presentation,
	...rest
}: InputFrameSkeletonProps) {
	return (
		<Skeleton
			className={clsx(
				inputFrameVariants({
					size,
					fullWidth: fullWidth ? true : undefined,
					presentation,
				}),
				"pointer-events-none select-none border-transparent !bg-muted/80 shadow-none",
				radius === "textarea" ? "!rounded-2xl" : "!rounded-3xl",
				className,
			)}
			data-slot="input-frame-skeleton"
			{...rest}
		>
			{children ? (
				<span
					className={clsx(
						size === "sm" && "mx-3 text-base md:text-sm",
						size === "md" && "mx-[15px] text-sm",
						size === "lg" && "mx-4 text-base",
						"min-w-0 truncate",
						skeletonClassName,
					)}
				>
					{children}
				</span>
			) : null}
		</Skeleton>
	);
}

export const InputFrame = Object.assign(InputFrameRoot, {
	Skeleton: InputFrameSkeleton,
});
