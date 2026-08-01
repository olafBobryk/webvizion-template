// components/ui/primitives/Field.tsx
"use client";

import type * as React from "react";
import { InputFrameSkeleton, type InputFrameSkeletonProps } from "./InputFrame";
import { Text } from "./Text";

type FieldTone = "default" | "error" | "success";

type FieldProps = {
	label?: React.ReactNode;
	description?: React.ReactNode;
	message?: React.ReactNode;
	tone?: FieldTone;
	required?: boolean;
	inputId?: string;
	descriptionId?: string;
	messageId?: string;
	disableMessage?: boolean;
	className?: string;
	children: React.ReactNode;
	labelAction?: React.ReactNode;
};

type FieldSkeletonProps = Omit<FieldProps, "children" | "message" | "tone"> & {
	children?: React.ReactNode;
	fullWidth?: InputFrameSkeletonProps["fullWidth"];
	inputClassName?: string;
	radius?: InputFrameSkeletonProps["radius"];
	size?: InputFrameSkeletonProps["size"];
	skeletonClassName?: string;
};

function FieldRoot({
	label,
	description,
	message,
	tone = "default",
	required,
	inputId,
	descriptionId,
	messageId,
	disableMessage = false,
	className,
	children,
	labelAction,
}: FieldProps) {
	const hasMessage = Boolean(message);
	const announceMessage = tone === "error" && hasMessage;

	return (
		<div
			data-tone={tone}
			className={["group/field flex flex-col gap-3", className]
				.filter(Boolean)
				.join(" ")}
		>
			{label || description || labelAction ? (
				<div className="flex flex-col gap-1">
					{label || labelAction ? (
						<div className="flex items-end justify-between gap-3">
							{label ? (
								<Text
									as="label"
									variant="body"
									htmlFor={inputId}
									className="pointer-events-none"
								>
									<span className="inline-flex items-center gap-1">
										{label}
										{required ? (
											<span aria-hidden="true" className="text-danger-text">
												*
											</span>
										) : null}
									</span>
								</Text>
							) : null}
							{labelAction}
						</div>
					) : null}

					{description ? (
						<Text
							as="p"
							variant="body"
							tone="muted"
							className="text-sm"
							id={descriptionId}
						>
							{description}
						</Text>
					) : null}
				</div>
			) : null}

			{children}

			{disableMessage ? null : (
				<div
					className={[
						"transition-all motion-micro -mt-3 overflow-hidden",
						message ? "max-h-7" : "max-h-0",
					].join(" ")}
				>
					<Text
						as="p"
						variant="caption"
						tone="muted"
						className={[
							"transition-all motion-micro mt-3", // preserve the field gap only while visible
							tone === "error"
								? "!text-danger-text"
								: tone === "success"
									? "!text-success-text"
									: "text-transparent",
						].join(" ")}
						id={messageId}
						role={announceMessage ? "alert" : undefined}
						aria-live={announceMessage ? "polite" : undefined}
						aria-atomic={announceMessage ? "true" : undefined}
						aria-hidden={!hasMessage}
					>
						{message ?? "placeholder"}
					</Text>
				</div>
			)}
		</div>
	);
}

export function FieldSkeleton({
	children,
	fullWidth,
	inputClassName,
	radius,
	size,
	skeletonClassName,
	...props
}: FieldSkeletonProps) {
	return (
		<FieldRoot {...props}>
			<InputFrameSkeleton
				className={inputClassName}
				fullWidth={fullWidth}
				radius={radius}
				size={size}
				skeletonClassName={skeletonClassName}
			>
				{children}
			</InputFrameSkeleton>
		</FieldRoot>
	);
}

export const Field = Object.assign(FieldRoot, { Skeleton: FieldSkeleton });
