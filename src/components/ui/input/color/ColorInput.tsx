"use client";

import clsx from "clsx";
import * as React from "react";
import { InputSkeleton } from "@/components/ui/input/InputSkeleton";
import {
	Dropdown,
	type DropdownPositionStrategy,
} from "@/components/ui/primitives/dropdown";
import { Field } from "@/components/ui/primitives/Field";
import { InputFrame } from "@/components/ui/primitives/InputFrame";

type ColorInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"children" | "defaultValue" | "onChange" | "type" | "value"
> & {
	description?: React.ReactNode;
	dropdownPortalTargetId?: string;
	dropdownPositionStrategy?: DropdownPositionStrategy;
	error?: React.ReactNode;
	label?: React.ReactNode;
	onChange?: (value: string) => void;
	value?: string;
	defaultValue?: string;
};

function normalizeColor(value: string | undefined) {
	return value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#2563EB";
}

function clamp(value: number, min = 0, max = 1) {
	return Math.min(max, Math.max(min, value));
}

function toHexChannel(value: number) {
	return Math.round(value).toString(16).padStart(2, "0");
}

function hslToHex(hue: number, saturation: number, lightness: number) {
	const normalizedSaturation = saturation / 100;
	const normalizedLightness = lightness / 100;
	const chroma =
		(1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
	const huePrime = hue / 60;
	const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));
	const match = normalizedLightness - chroma / 2;
	const [red, green, blue] =
		huePrime < 1
			? [chroma, secondary, 0]
			: huePrime < 2
				? [secondary, chroma, 0]
				: huePrime < 3
					? [0, chroma, secondary]
					: huePrime < 4
						? [0, secondary, chroma]
						: huePrime < 5
							? [secondary, 0, chroma]
							: [chroma, 0, secondary];

	return `#${toHexChannel((red + match) * 255)}${toHexChannel(
		(green + match) * 255,
	)}${toHexChannel((blue + match) * 255)}`;
}

function hexToFieldPosition(value: string) {
	const color = normalizeColor(value);
	const red = Number.parseInt(color.slice(1, 3), 16) / 255;
	const green = Number.parseInt(color.slice(3, 5), 16) / 255;
	const blue = Number.parseInt(color.slice(5, 7), 16) / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const lightness = (max + min) / 2;
	const delta = max - min;
	let hue = 0;

	if (delta > 0) {
		if (max === red) {
			hue = ((green - blue) / delta) % 6;
		} else if (max === green) {
			hue = (blue - red) / delta + 2;
		} else {
			hue = (red - green) / delta + 4;
		}
		hue *= 60;
		if (hue < 0) hue += 360;
	}

	return {
		x: clamp(hue / 360),
		y: clamp((88 - lightness * 100) / 58),
	};
}

function getColorFromFieldPoint(x: number, y: number) {
	return hslToHex(clamp(x) * 360, 86, 88 - clamp(y) * 58).toUpperCase();
}

type ColorPickerPanelProps = {
	ariaLabel?: string;
	disabled?: boolean;
	onChange: (value: string) => void;
	value: string;
};

export function ColorPickerPanel({
	ariaLabel = "Choose color",
	disabled,
	onChange,
	value,
}: ColorPickerPanelProps) {
	const fieldRef = React.useRef<HTMLButtonElement | null>(null);
	const selectedValue = normalizeColor(value);
	const markerPosition = hexToFieldPosition(selectedValue);
	const updateFromPointer = (clientX: number, clientY: number) => {
		const rect = fieldRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = clamp((clientX - rect.left) / rect.width);
		const y = clamp((clientY - rect.top) / rect.height);
		onChange(getColorFromFieldPoint(x, y));
	};

	return (
		<button
			aria-label={ariaLabel}
			className={clsx(
				"relative block h-36 w-56 cursor-crosshair outline-none",
				"focus-visible:ring-3 focus-visible:ring-ring/30",
			)}
			disabled={disabled}
			onKeyDown={(event) => {
				const step = event.shiftKey ? 0.1 : 0.03;
				let nextX = markerPosition.x;
				let nextY = markerPosition.y;

				if (event.key === "ArrowLeft") nextX -= step;
				else if (event.key === "ArrowRight") nextX += step;
				else if (event.key === "ArrowUp") nextY -= step;
				else if (event.key === "ArrowDown") nextY += step;
				else return;

				event.preventDefault();
				onChange(getColorFromFieldPoint(nextX, nextY));
			}}
			onPointerDown={(event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				updateFromPointer(event.clientX, event.clientY);
			}}
			onPointerMove={(event) => {
				if (event.buttons !== 1) return;
				updateFromPointer(event.clientX, event.clientY);
			}}
			ref={fieldRef}
			style={{
				backgroundImage:
					"linear-gradient(to bottom, rgba(255,255,255,0.72), rgba(255,255,255,0) 42%, rgba(0,0,0,0.74)), linear-gradient(to right, #ff0033, #ffcc00, #32d74b, #00c7ff, #3b5bff, #d633ff, #ff0033)",
			}}
			type="button"
		>
			<span
				aria-hidden
				className="-translate-x-1/2 -translate-y-1/2 absolute size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
				style={{
					backgroundColor: selectedValue,
					left: `${markerPosition.x * 100}%`,
					top: `${markerPosition.y * 100}%`,
				}}
			/>
		</button>
	);
}

function ColorInputRoot({
	className,
	defaultValue,
	description,
	disabled,
	dropdownPortalTargetId,
	dropdownPositionStrategy = "absolute",
	error,
	form,
	id,
	label,
	name,
	onChange,
	required,
	value,
}: ColorInputProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const errorId = error ? `${inputId}-error` : undefined;
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const panelRef = React.useRef<HTMLDivElement | null>(null);
	const isControlled = value !== undefined;
	const [open, setOpen] = React.useState(false);
	const [internalValue, setInternalValue] = React.useState(() =>
		normalizeColor(defaultValue),
	);
	const selectedValue = normalizeColor(isControlled ? value : internalValue);

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

	const commitValue = (nextValue: string) => {
		const normalizedValue = normalizeColor(nextValue);

		if (!isControlled) setInternalValue(normalizedValue);
		onChange?.(normalizedValue);
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
			tone={error ? "error" : "default"}
		>
			<div className="relative" ref={rootRef}>
				{name ? (
					<input
						disabled={disabled}
						form={form}
						name={name}
						readOnly
						required={required}
						type="hidden"
						value={selectedValue}
					/>
				) : null}
				<InputFrame fullWidth tone={error ? "error" : "default"}>
					<button
						aria-describedby={
							[descriptionId, errorId].filter(Boolean).join(" ") || undefined
						}
						aria-expanded={open}
						aria-haspopup="dialog"
						aria-invalid={Boolean(error)}
						className="flex h-full w-full min-w-0 items-center justify-between gap-3 px-3 text-left text-base outline-none md:text-sm"
						disabled={disabled}
						id={inputId}
						onClick={() => setOpen((current) => !current)}
						type="button"
					>
						<span className="inline-flex min-w-0 items-center gap-2">
							<span
								aria-hidden
								className="size-4 shrink-0 rounded-full border border-border"
								style={{ backgroundColor: selectedValue }}
							/>
							<span className="truncate">{selectedValue.toUpperCase()}</span>
						</span>
					</button>
				</InputFrame>
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
							ariaLabel={
								typeof label === "string"
									? `Choose ${label.toLowerCase()}`
									: "Choose color"
							}
							disabled={disabled}
							onChange={commitValue}
							value={selectedValue}
						/>
					</Dropdown.Panel>
				) : null}
			</div>
		</Field>
	);
}

export const ColorInput = Object.assign(ColorInputRoot, {
	Skeleton: InputSkeleton,
});
