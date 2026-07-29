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
import { formatDisplayDate, parseISODate } from "./dateUtils";
import type { ISODateString } from "./types";

export type DateInputProps = Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	"children" | "defaultValue" | "onChange" | "value"
> & {
	defaultValue?: ISODateString | null;
	description?: React.ReactNode;
	dropdownPortalTargetId?: string;
	dropdownPositionStrategy?: DropdownPositionStrategy;
	emptyLabel?: string;
	error?: React.ReactNode;
	label?: React.ReactNode;
	max?: ISODateString;
	min?: ISODateString;
	onChange?: (value: ISODateString | null) => void;
	required?: boolean;
	value?: ISODateString | null;
};

function normalizeDateValue(value?: ISODateString | null) {
	return parseISODate(value) ? (value ?? null) : null;
}

function DateInputRoot({
	className,
	defaultValue = null,
	description,
	disabled,
	dropdownPortalTargetId,
	dropdownPositionStrategy = "absolute",
	emptyLabel = "Select date",
	error,
	form,
	id,
	label,
	max,
	min,
	name,
	onChange,
	required,
	value,
	...props
}: DateInputProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const errorId = error ? `${inputId}-error` : undefined;
	const anchorRef = React.useRef<HTMLDivElement | null>(null);
	const triggerRef = React.useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const [internalValue, setInternalValue] =
		React.useState<ISODateString | null>(() =>
			normalizeDateValue(defaultValue),
		);
	const isControlled = value !== undefined;
	const selectedValue = normalizeDateValue(
		isControlled ? value : internalValue,
	);

	const updateOpen = (nextOpen: boolean, restoreFocus = false) => {
		setOpen(nextOpen);
		if (!nextOpen && restoreFocus) {
			requestAnimationFrame(() => {
				triggerRef.current?.focus({ preventScroll: true });
			});
		}
	};

	const commitValue = (nextValue: ISODateString | null) => {
		if (!isControlled) setInternalValue(nextValue);
		onChange?.(nextValue);
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
				{name ? (
					<input
						disabled={disabled}
						form={form}
						name={name}
						readOnly
						type="hidden"
						value={selectedValue ?? ""}
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
								"truncate",
								!selectedValue && "text-muted-foreground",
							)}
						>
							{selectedValue ? formatDisplayDate(selectedValue) : emptyLabel}
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
					mode="single"
					onChangeSingle={commitValue}
					onOpenChange={updateOpen}
					open={open}
					required={required}
					valueSingle={selectedValue}
				/>
			</div>
		</Field>
	);
}

function DateInputSkeleton(props: InputSkeletonProps) {
	return <InputSkeleton {...props} />;
}

export const DateInput = Object.assign(DateInputRoot, {
	Skeleton: DateInputSkeleton,
});
