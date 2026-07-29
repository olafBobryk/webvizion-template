"use client";

import { CaretDown } from "@phosphor-icons/react";
import clsx from "clsx";
import * as React from "react";
import {
	InputSkeleton,
	type InputSkeletonProps,
} from "@/components/ui/input/InputSkeleton";
import type { DropdownPositionStrategy } from "@/components/ui/primitives/dropdown";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	inputTextClasses,
} from "@/components/ui/primitives/InputFrame";
import { CalendarPopover } from "./CalendarPopover";
import {
	DATE_RANGE_PRESETS,
	formatDisplayRange,
	normalizeDateRange,
} from "./dateUtils";
import type {
	DateRangeChangeReason,
	DateRangePresetKey,
	DateRangeValue,
	ISODateString,
} from "./types";

export type DateRangeInputProps = Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	"children" | "defaultValue" | "onChange" | "value"
> & {
	defaultValue?: DateRangeValue | null;
	description?: React.ReactNode;
	dropdownPortalTargetId?: string;
	dropdownPositionStrategy?: DropdownPositionStrategy;
	emptyLabel?: string;
	endName?: string;
	error?: React.ReactNode;
	label?: React.ReactNode;
	max?: ISODateString;
	min?: ISODateString;
	onChange?: (
		value: DateRangeValue | null,
		reason: DateRangeChangeReason,
	) => void;
	presets?: readonly DateRangePresetKey[] | false;
	required?: boolean;
	startName?: string;
	value?: DateRangeValue | null;
};

function DateRangeInputRoot({
	className,
	defaultValue = null,
	description,
	disabled,
	dropdownPortalTargetId,
	dropdownPositionStrategy = "absolute",
	emptyLabel = "Select date range",
	endName,
	error,
	form,
	id,
	label,
	max,
	min,
	onChange,
	presets = DATE_RANGE_PRESETS.map((preset) => preset.key),
	required,
	startName,
	value,
	...props
}: DateRangeInputProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const errorId = error ? `${inputId}-error` : undefined;
	const anchorRef = React.useRef<HTMLDivElement | null>(null);
	const triggerRef = React.useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const [internalValue, setInternalValue] =
		React.useState<DateRangeValue | null>(() =>
			normalizeDateRange(defaultValue),
		);
	const isControlled = value !== undefined;
	const selectedValue = normalizeDateRange(
		isControlled ? value : internalValue,
	);
	const resolvedPresets = presets === false ? [] : presets;

	const updateOpen = (nextOpen: boolean, restoreFocus = false) => {
		setOpen(nextOpen);
		if (!nextOpen && restoreFocus) {
			requestAnimationFrame(() => {
				triggerRef.current?.focus({ preventScroll: true });
			});
		}
	};

	const commitValue = (
		nextValue: DateRangeValue | null,
		reason: DateRangeChangeReason,
	) => {
		if (!isControlled) setInternalValue(nextValue);
		onChange?.(nextValue, reason);
	};

	return (
		<Field
			className={className}
			description={description}
			descriptionId={descriptionId}
			inputId={inputId}
			label={label}
			message={error}
			messageId={errorId}
			required={required}
			tone={error ? "error" : "default"}
		>
			<div className="relative" ref={anchorRef}>
				{startName ? (
					<input
						disabled={disabled}
						form={form}
						name={startName}
						readOnly
						type="hidden"
						value={selectedValue?.start ?? ""}
					/>
				) : null}
				{endName ? (
					<input
						disabled={disabled}
						form={form}
						name={endName}
						readOnly
						type="hidden"
						value={selectedValue?.end ?? ""}
					/>
				) : null}
				<InputFrame
					disabled={disabled}
					fullWidth
					tone={error ? "error" : "default"}
				>
					<button
						aria-describedby={
							[descriptionId, errorId].filter(Boolean).join(" ") || undefined
						}
						aria-expanded={open}
						aria-haspopup="dialog"
						aria-invalid={Boolean(error)}
						className={clsx(
							inputTextClasses,
							"flex items-center justify-between gap-3 text-left",
						)}
						disabled={disabled}
						id={inputId}
						onClick={() => updateOpen(!open)}
						ref={triggerRef}
						type="button"
						{...props}
					>
						<span
							className={clsx(
								"min-w-0 truncate",
								!selectedValue && "text-muted-foreground",
							)}
						>
							{selectedValue ? formatDisplayRange(selectedValue) : emptyLabel}
						</span>
						<CaretDown
							aria-hidden
							className={clsx(
								"shrink-0 text-muted-foreground transition-transform motion-micro",
								open && "rotate-180",
							)}
							size={16}
						/>
					</button>
				</InputFrame>
				<CalendarPopover
					anchorRef={anchorRef}
					dropdownPortalTargetId={dropdownPortalTargetId}
					dropdownPositionStrategy={dropdownPositionStrategy}
					max={max}
					min={min}
					mode="range"
					onChangeRange={commitValue}
					onOpenChange={updateOpen}
					open={open}
					presets={resolvedPresets}
					required={required}
					valueRange={selectedValue}
				/>
			</div>
		</Field>
	);
}

function DateRangeInputSkeleton(props: InputSkeletonProps) {
	return <InputSkeleton {...props} />;
}

export const DateRangeInput = Object.assign(DateRangeInputRoot, {
	Skeleton: DateRangeInputSkeleton,
});
