"use client";

import clsx from "clsx";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Icon } from "@/components/ui/icons/Icon";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import {
	Dropdown,
	type DropdownPositionStrategy,
} from "@/components/ui/primitives/dropdown";
import { Field } from "@/components/ui/primitives/Field";
import { ColorPickerPanel } from "./ColorInput";

const defaultCustomColor = "#3567EA";

export type ColorSwatchPreset<T extends string = string> = {
	colorHex: string;
	label: string;
	value: T;
};

export type ColorSwatchSelection<T extends string = string> = {
	customColorHex: string | null;
	value: T;
};

export const SEMANTIC_COLOR_SWATCH_PRESETS = [
	{ colorHex: "#8A8A99", label: "Neutral", value: "neutral" },
	{ colorHex: "#3567EA", label: "Blue", value: "info" },
	{ colorHex: "#36C24C", label: "Green", value: "success" },
	{ colorHex: "#FDB31F", label: "Amber", value: "warning" },
	{ colorHex: "#F14D72", label: "Red", value: "danger" },
] as const satisfies readonly ColorSwatchPreset[];

export type ColorSwatchInputProps<T extends string> = {
	className?: string;
	customColorHex?: string | null;
	defaultCustomColorHex?: string | null;
	defaultValue?: T;
	description?: React.ReactNode;
	disabled?: boolean;
	dropdownPortalTargetId?: string;
	dropdownPositionStrategy?: DropdownPositionStrategy;
	error?: React.ReactNode;
	id?: string;
	label?: React.ReactNode;
	name?: string;
	onChange?: (selection: ColorSwatchSelection<T>) => void;
	presets: readonly ColorSwatchPreset<T>[];
	required?: boolean;
	value?: T;
};

function normalizeColor(value: string | null | undefined) {
	return value && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
}

function ColorSwatchInputRoot<T extends string>({
	className,
	customColorHex,
	defaultCustomColorHex,
	defaultValue,
	description,
	disabled = false,
	dropdownPortalTargetId,
	dropdownPositionStrategy = "absolute",
	error,
	id,
	label,
	name,
	onChange,
	presets,
	required,
	value,
}: ColorSwatchInputProps<T>) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const panelRef = React.useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const initialValue = defaultValue ?? presets[0]?.value;
	const [internalValue, setInternalValue] = React.useState<T | undefined>(
		initialValue,
	);
	const [internalCustomColorHex, setInternalCustomColorHex] = React.useState(
		normalizeColor(defaultCustomColorHex),
	);
	const isValueControlled = value !== undefined;
	const isCustomColorControlled = customColorHex !== undefined;
	const selectedValue = value ?? internalValue;
	const selectedCustomColorHex = isCustomColorControlled
		? normalizeColor(customColorHex)
		: internalCustomColorHex;
	const selectedPreset = presets.find(
		(preset) => preset.value === selectedValue,
	);
	const selectedColorHex =
		selectedCustomColorHex ?? selectedPreset?.colorHex ?? defaultCustomColor;

	React.useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				!rootRef.current?.contains(target) &&
				!panelRef.current?.contains(target)
			) {
				setOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [open]);

	React.useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	function commit(nextValue: T, nextCustomColorHex: string | null) {
		const normalizedCustomColorHex = normalizeColor(nextCustomColorHex);
		if (!isValueControlled) setInternalValue(nextValue);
		if (!isCustomColorControlled) {
			setInternalCustomColorHex(normalizedCustomColorHex);
		}
		onChange?.({
			customColorHex: normalizedCustomColorHex,
			value: nextValue,
		});
	}

	function choosePreset(preset: ColorSwatchPreset<T>) {
		setOpen(false);
		commit(preset.value, null);
	}

	function chooseCustom() {
		if (!selectedValue) return;
		const customColor = selectedCustomColorHex ?? defaultCustomColor;
		commit(selectedValue, customColor);
		setOpen(true);
	}

	if (!selectedValue) return null;

	return (
		<Field
			className={className}
			description={description}
			inputId={inputId}
			label={label}
			message={error}
			tone={error ? "error" : "default"}
		>
			<div className="relative" ref={rootRef}>
				{name ? (
					<input
						disabled={disabled}
						name={name}
						readOnly
						required={required}
						type="hidden"
						value={selectedColorHex}
					/>
				) : null}
				<div
					aria-label={typeof label === "string" ? label : "Color"}
					className="flex flex-wrap items-center gap-2"
					role="radiogroup"
				>
					{presets.map((preset) => {
						const checked =
							preset.value === selectedValue && !selectedCustomColorHex;

						return (
							<label className="group relative" key={preset.value}>
								<input
									checked={checked}
									className="peer sr-only"
									disabled={disabled}
									name={`${inputId}-options`}
									onChange={() => choosePreset(preset)}
									type="radio"
									value={preset.value}
								/>
								<span className="sr-only">{preset.label}</span>
								<span
									aria-hidden
									className={clsx(
										"relative block size-7 rounded-full",
										focusRing.peerDefault,
										disabled && "opacity-50",
									)}
								>
									<span
										aria-hidden
										className={clsx(
											"pointer-events-none absolute inset-0 rounded-full border transition-[border-color,border-width] motion-interactive",
											checked ? "border-2 border-border" : "border-transparent",
										)}
									/>
									<span
										aria-hidden
										className={clsx(
											"absolute inset-0 block rounded-full transition-transform motion-interactive",
											checked ? "scale-75" : "scale-100",
										)}
										style={{ backgroundColor: preset.colorHex }}
									/>
								</span>
							</label>
						);
					})}
					<label className="group relative">
						<input
							checked={Boolean(selectedCustomColorHex)}
							className="peer sr-only"
							disabled={disabled}
							name={`${inputId}-options`}
							onChange={chooseCustom}
							onClick={() => {
								if (selectedCustomColorHex) setOpen(true);
							}}
							type="radio"
							value="custom"
						/>
						<span className="sr-only">Custom color</span>
						<span
							aria-hidden
							className={clsx(
								"relative flex size-7 items-center justify-center rounded-full text-muted-foreground",
								focusRing.peerDefault,
								disabled && "opacity-50",
							)}
						>
							<span
								aria-hidden
								className={clsx(
									"pointer-events-none absolute inset-0 rounded-full border transition-[border-color,border-width] motion-interactive",
									selectedCustomColorHex
										? "border-2 border-border"
										: "border-transparent",
								)}
							/>
							{selectedCustomColorHex ? (
								<span
									aria-hidden
									className="absolute inset-0 block scale-75 rounded-full transition-transform motion-interactive"
									style={{ backgroundColor: selectedCustomColorHex }}
								/>
							) : (
								<Icon name="plus" size="sm" className="relative" />
							)}
						</span>
					</label>
				</div>
				{open ? (
					<Dropdown.Panel
						align="start"
						anchorRef={rootRef}
						className={clsx(
							dropdownPositionStrategy === "absolute" && "left-0",
							"overflow-hidden!",
						)}
						portalTargetId={dropdownPortalTargetId}
						positionStrategy={dropdownPositionStrategy}
						ref={panelRef}
						width="auto"
					>
						<ColorPickerPanel
							disabled={disabled}
							onChange={(nextColor) => commit(selectedValue, nextColor)}
							value={selectedCustomColorHex ?? defaultCustomColor}
						/>
					</Dropdown.Panel>
				) : null}
			</div>
		</Field>
	);
}

function ColorSwatchInputSkeleton({
	className,
	count = 6,
	description,
	label,
}: {
	className?: string;
	count?: number;
	description?: React.ReactNode;
	label?: React.ReactNode;
}) {
	return (
		<Field
			className={className}
			description={description}
			disableMessage
			label={label}
		>
			<div className="flex flex-wrap items-center gap-2">
				{Array.from({ length: count }, (_, index) => `swatch-${index + 1}`).map(
					(key) => (
						<Skeleton className="size-7" key={key} radius="full" />
					),
				)}
			</div>
		</Field>
	);
}

export const ColorSwatchInput = Object.assign(ColorSwatchInputRoot, {
	Skeleton: ColorSwatchInputSkeleton,
});
