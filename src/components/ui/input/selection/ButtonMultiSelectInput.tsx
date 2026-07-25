"use client";

import clsx from "clsx";
import * as React from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Field } from "@/components/ui/primitives/Field";

export type ButtonMultiSelectOption<T extends string = string> = {
	disabled?: boolean;
	label: React.ReactNode;
	value: T;
};

export type ButtonMultiSelectInputProps<T extends string = string> = Omit<
	React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
	"children" | "defaultValue" | "disabled" | "onChange"
> & {
	defaultValue?: readonly T[];
	description?: React.ReactNode;
	disabled?: boolean;
	fieldClassName?: string;
	label?: React.ReactNode;
	message?: React.ReactNode;
	name?: string;
	onChange?: (value: T[]) => void;
	options: ButtonMultiSelectOption<T>[];
	required?: boolean;
	tone?: "default" | "error" | "success";
	value?: readonly T[];
};

type ButtonMultiSelectInputSkeletonProps<T extends string = string> = Pick<
	ButtonMultiSelectInputProps<T>,
	| "className"
	| "description"
	| "fieldClassName"
	| "label"
	| "options"
	| "required"
>;

function ButtonMultiSelectInputRoot<T extends string = string>({
	className,
	defaultValue = [],
	description,
	disabled = false,
	fieldClassName,
	id,
	label,
	message,
	name,
	onChange,
	options,
	required,
	tone = "default",
	value,
	...props
}: ButtonMultiSelectInputProps<T>) {
	const generatedId = React.useId();
	const baseId = id ?? name ?? generatedId;
	const groupName = name ?? baseId;
	const descriptionId = description ? `${baseId}-description` : undefined;
	const messageId = message ? `${baseId}-message` : undefined;
	const labelTargetId = options[0]?.value
		? `${baseId}-${options[0].value}`
		: undefined;
	const describedBy =
		[descriptionId, message ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = React.useState<T[]>([
		...defaultValue,
	]);
	const selectedValues = isControlled ? [...(value ?? [])] : internalValue;
	const isInvalid = tone === "error" && Boolean(message);

	function toggleValue(nextValue: T) {
		if (disabled) return;

		const nextValues = selectedValues.includes(nextValue)
			? selectedValues.filter((selectedValue) => selectedValue !== nextValue)
			: [...selectedValues, nextValue];

		if (!isControlled) {
			setInternalValue(nextValues);
		}

		onChange?.(nextValues);
	}

	return (
		<Field
			label={label}
			description={description}
			message={message}
			tone={tone}
			required={required}
			inputId={labelTargetId}
			descriptionId={descriptionId}
			messageId={messageId}
			className={fieldClassName}
		>
			<fieldset
				id={baseId}
				aria-describedby={describedBy}
				aria-invalid={isInvalid || undefined}
				data-required={required ? "" : undefined}
				disabled={disabled}
				className={clsx(
					"flex min-w-0 flex-wrap items-start gap-2 border-0 p-0",
					disabled && "opacity-60",
					className,
				)}
				{...props}
			>
				{name
					? selectedValues.map((selectedValue) => (
							<input
								key={selectedValue}
								type="hidden"
								name={groupName}
								value={selectedValue}
							/>
						))
					: null}
				{options.map((option) => {
					const selected = selectedValues.includes(option.value);
					const optionDisabled = Boolean(disabled || option.disabled);
					const optionId = `${baseId}-${option.value}`;

					return (
						<Button
							key={option.value}
							id={optionId}
							type="button"
							variant={selected ? "primary" : "secondary"}
							aria-pressed={selected}
							disabled={optionDisabled}
							onClick={() => toggleValue(option.value)}
						>
							{option.label}
						</Button>
					);
				})}
			</fieldset>
		</Field>
	);
}

function ButtonMultiSelectInputSkeleton<T extends string = string>({
	className,
	description,
	fieldClassName,
	label,
	options,
	required,
}: ButtonMultiSelectInputSkeletonProps<T>) {
	return (
		<Field
			className={fieldClassName}
			description={description}
			disableMessage
			label={label}
			required={required}
		>
			<div
				className={clsx("flex min-w-0 flex-wrap items-start gap-2", className)}
			>
				{options.map((option) => (
					<Button.Skeleton key={option.value} variant="secondary">
						{option.label}
					</Button.Skeleton>
				))}
			</div>
		</Field>
	);
}

export const ButtonMultiSelectInput = Object.assign(
	ButtonMultiSelectInputRoot,
	{
		Skeleton: ButtonMultiSelectInputSkeleton,
	},
);
