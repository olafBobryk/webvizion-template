// components/ui/input/numeric/NumberInput.tsx
// components/ui/input/numeric/NumberInput.tsx
"use client";

import * as React from "react";
import { InputSkeleton } from "@/components/ui/input/InputSkeleton";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	type InputFrameSize,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";

type NumberInputProps = {
	label: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;

	id?: string;
	name?: string;

	// Uncontrolled
	defaultValue?: number;

	// Controlled
	value?: number | null;
	onChange?: (value: number | null) => void;

	required?: boolean;
	disabled?: boolean;

	min?: number;
	max?: number;
	step?: number;

	// Optional visual unit (e.g. "km", "mi", "%")
	unit?: React.ReactNode;

	// Validation (recommended: pass error from parent)
	error?: React.ReactNode;

	// Optional client-side validation helper (receives parsed number)
	validate?: (value: number | null) => string | null;

	className?: string;
	inputClassName?: string;
	size?: InputFrameSize;
};

function parseNumber(raw: string): number | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	// Allow user typing "-" or "." without immediately becoming NaN noise
	if (trimmed === "-" || trimmed === "." || trimmed === "-.") return null;

	const n = Number(trimmed);
	return Number.isFinite(n) ? n : null;
}

function NumberInputRoot({
	label,
	description,
	placeholder,
	id,
	name,
	defaultValue,
	value,
	onChange,
	required = false,
	disabled,
	min,
	max,
	step = 1,
	unit,
	error,
	validate,
	className,
	inputClassName,
	size,
}: NumberInputProps) {
	const isControlled = value !== undefined;
	const [clientError, setClientError] = React.useState<string | null>(null);

	const derivedError = error ?? clientError;
	const tone = derivedError ? "error" : "default";
	const fallbackId = React.useId();
	const inputId = id ?? name ?? fallbackId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const messageId = derivedError ? `${inputId}-message` : undefined;
	const describedBy =
		[descriptionId, derivedError ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const next = parseNumber(e.target.value);
		if (validate) setClientError(null);
		onChange?.(next);
	};

	const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (!validate) return;
		setClientError(validate(parseNumber(e.target.value)));
	};

	return (
		<Field
			label={label}
			description={description}
			message={derivedError ?? undefined}
			tone={tone}
			required={required}
			inputId={inputId}
			descriptionId={descriptionId}
			messageId={messageId}
			className={className}
		>
			<InputFrame
				tone={tone}
				size={size}
				disabled={disabled}
				fullWidth
				end={
					unit ? (
						<span className="whitespace-nowrap text-sm text-muted-foreground">
							{unit}
						</span>
					) : null
				}
			>
				<input
					id={inputId}
					name={name}
					type="number"
					inputMode="numeric"
					min={min}
					max={max}
					step={step}
					disabled={disabled}
					placeholder={placeholder}
					required={required}
					className={[
						inputVariants({
							size,
							hasEnd: unit ? true : undefined,
							disabled: disabled ? true : undefined,
						}),
						"[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
						inputClassName,
					]
						.filter(Boolean)
						.join(" ")}
					{...(isControlled
						? {
								value: value ?? "",
								onChange: handleChange,
							}
						: {
								defaultValue: defaultValue ?? undefined,
								onChange: handleChange,
							})}
					onBlur={handleBlur}
					aria-invalid={Boolean(derivedError)}
					aria-describedby={describedBy}
				/>
			</InputFrame>
		</Field>
	);
}

export const NumberInput = Object.assign(NumberInputRoot, {
	Skeleton: InputSkeleton,
});
