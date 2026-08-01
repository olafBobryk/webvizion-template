"use client";

import clsx from "clsx";
import * as React from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	type InputFrameSize,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import { Text } from "@/components/ui/primitives/Text";

export type EditableTextFieldPresentation = "field" | "inline";

export type EditableTextFieldProps = {
	value: string;
	onSave: (value: string) => Promise<void> | void;
	validate?: (value: string) => string | null;
	normalizeValue?: (value: string) => string;
	id?: string;
	name?: string;
	label?: React.ReactNode;
	description?: React.ReactNode;
	error?: React.ReactNode;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	size?: InputFrameSize;
	presentation?: EditableTextFieldPresentation;
	ariaLabel?: string;
	editAriaLabel?: string;
	saveAriaLabel?: string;
	cancelAriaLabel?: string;
	className?: string;
	displayClassName?: string;
	inputClassName?: string;
};

export type EditableTextFieldSkeletonProps = Pick<
	EditableTextFieldProps,
	"className" | "description" | "label" | "presentation" | "required" | "size"
> & {
	value?: React.ReactNode;
};

function defaultNormalizeValue(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Unable to save.";
}

function getAccessibleLabel(label: React.ReactNode, fallback: string) {
	return typeof label === "string" ? label : fallback;
}

function EditableTextFieldRoot({
	ariaLabel,
	cancelAriaLabel = "Cancel editing",
	className,
	description,
	disabled,
	displayClassName,
	editAriaLabel,
	error,
	id,
	inputClassName,
	label,
	name,
	normalizeValue = defaultNormalizeValue,
	onSave,
	placeholder = "Enter a value",
	presentation = "field",
	required,
	saveAriaLabel = "Save changes",
	size = "sm",
	validate,
	value,
}: EditableTextFieldProps) {
	const generatedId = React.useId();
	const inputId = id ?? name ?? generatedId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const [editing, setEditing] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [draft, setDraft] = React.useState(value);
	const [internalError, setInternalError] = React.useState<string | null>(null);
	const displayButtonRef = React.useRef<HTMLElement | null>(null);
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const restoreDisplayFocusRef = React.useRef(false);
	const derivedError = error ?? internalError;
	const messageId = derivedError ? `${inputId}-message` : undefined;
	const describedBy =
		[descriptionId, messageId].filter(Boolean).join(" ") || undefined;
	const displayValue = value || placeholder;
	const accessibleLabel =
		ariaLabel ?? `Edit ${getAccessibleLabel(label, "value")}`;
	const inputAccessibleLabel =
		editAriaLabel ?? getAccessibleLabel(label, "Editable value");

	React.useEffect(() => {
		if (editing) return;
		setDraft(value);
		setInternalError(null);
	}, [editing, value]);

	React.useEffect(() => {
		if (!editing) return;
		const frame = window.requestAnimationFrame(() => {
			inputRef.current?.focus({ preventScroll: true });
			inputRef.current?.select();
		});
		return () => window.cancelAnimationFrame(frame);
	}, [editing]);

	React.useEffect(() => {
		if (editing || !restoreDisplayFocusRef.current) return;
		restoreDisplayFocusRef.current = false;
		const frame = window.requestAnimationFrame(() => {
			displayButtonRef.current?.focus({ preventScroll: true });
		});
		return () => window.cancelAnimationFrame(frame);
	}, [editing]);

	function startEditing() {
		if (disabled || saving) return;
		setDraft(value);
		setInternalError(null);
		setEditing(true);
	}

	function finishEditing() {
		restoreDisplayFocusRef.current = true;
		setEditing(false);
	}

	function cancelEditing() {
		if (saving) return;
		setDraft(value);
		setInternalError(null);
		finishEditing();
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (saving || disabled) return;

		const nextValue = normalizeValue(draft);
		const validationError =
			validate?.(nextValue) ??
			(required && nextValue.length === 0 ? "This field is required." : null);
		if (validationError) {
			setInternalError(validationError);
			return;
		}

		if (nextValue === value) {
			cancelEditing();
			return;
		}

		setSaving(true);
		setInternalError(null);
		try {
			await onSave(nextValue);
			setSaving(false);
			finishEditing();
		} catch (saveError) {
			setInternalError(getErrorMessage(saveError));
			setSaving(false);
		}
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Escape") return;
		event.preventDefault();
		cancelEditing();
	}

	const displayContent = (
		<Text
			as="span"
			className={clsx("min-w-0 truncate", displayClassName)}
			tone={value ? "default" : "muted"}
			variant="body"
		>
			{displayValue}
		</Text>
	);

	const displayButton =
		presentation === "field" ? (
			<Button
				align="between"
				aria-describedby={describedBy}
				aria-invalid={Boolean(derivedError)}
				aria-label={accessibleLabel}
				className={clsx(
					inputVariants({ size, disabled: disabled ? true : undefined }),
					"rounded-[inherit] focus-visible:!border-transparent focus-visible:!ring-0",
				)}
				contentClassName="min-w-0"
				disabled={disabled}
				id={inputId}
				onClick={startEditing}
				ref={displayButtonRef}
				size="none"
				trailingIcon="pencil"
				type="button"
				variant="ghost"
			>
				{displayContent}
			</Button>
		) : (
			<Button
				align="left"
				aria-describedby={describedBy}
				aria-invalid={Boolean(derivedError)}
				aria-label={accessibleLabel}
				className="max-w-full"
				contentClassName="min-w-0 max-w-full gap-1.5"
				disabled={disabled}
				id={inputId}
				onClick={startEditing}
				ref={displayButtonRef}
				size="none"
				trailingIcon="pencil"
				type="button"
				variant="ghost"
			>
				{displayContent}
			</Button>
		);

	return (
		<form
			className={clsx(
				presentation === "field" ? "w-full" : "inline-block max-w-full",
				className,
			)}
			onSubmit={handleSubmit}
		>
			<Field
				description={description}
				descriptionId={descriptionId}
				disableMessage={!derivedError}
				inputId={inputId}
				label={label}
				message={derivedError}
				messageId={messageId}
				required={required}
				tone={derivedError ? "error" : "default"}
			>
				{editing ? (
					<InputFrame
						className={presentation === "inline" ? "min-w-60" : undefined}
						contentClassName="flex min-w-0 items-center"
						disabled={saving || disabled}
						end={
							<div className="flex items-center gap-1">
								<Button
									aria-label={saveAriaLabel}
									leadingIcon="check"
									loading={saving}
									size="icon-sm"
									type="submit"
									variant="ghost"
								/>
								<Button
									aria-label={cancelAriaLabel}
									disabled={saving || disabled}
									leadingIcon="close"
									onClick={cancelEditing}
									size="icon-sm"
									type="button"
									variant="ghost"
								/>
							</div>
						}
						fullWidth
						size={size}
						tone={derivedError ? "error" : "default"}
					>
						<input
							aria-describedby={describedBy}
							aria-invalid={Boolean(derivedError)}
							aria-label={inputAccessibleLabel}
							aria-required={required || undefined}
							className={clsx(
								inputVariants({
									disabled: saving || disabled ? true : undefined,
									hasEnd: true,
									size,
								}),
								inputClassName,
							)}
							disabled={saving || disabled}
							id={inputId}
							name={name}
							onChange={(event) => {
								setDraft(event.target.value);
								if (internalError) setInternalError(null);
							}}
							onKeyDown={handleInputKeyDown}
							placeholder={placeholder}
							ref={inputRef}
							value={draft}
						/>
					</InputFrame>
				) : presentation === "field" ? (
					<InputFrame
						contentClassName="flex min-w-0 items-center"
						disabled={disabled}
						fullWidth
						size={size}
						tone={derivedError ? "error" : "default"}
					>
						{displayButton}
					</InputFrame>
				) : (
					displayButton
				)}
			</Field>
		</form>
	);
}

function EditableTextFieldSkeleton({
	className,
	description,
	label,
	presentation = "field",
	required,
	size = "sm",
	value = "Editable value",
}: EditableTextFieldSkeletonProps) {
	return (
		<Field
			className={className}
			description={description}
			disableMessage
			label={label}
			required={required}
		>
			{presentation === "field" ? (
				<InputFrame.Skeleton fullWidth size={size}>
					{value}
				</InputFrame.Skeleton>
			) : (
				<Button.Skeleton
					className="max-w-full"
					size="none"
					textClassName="truncate"
					textVariant="body"
					trailingIcon
					variant="ghost"
				>
					{value}
				</Button.Skeleton>
			)}
		</Field>
	);
}

export const EditableTextField = Object.assign(EditableTextFieldRoot, {
	Skeleton: EditableTextFieldSkeleton,
});
