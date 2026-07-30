"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { getSpring } from "@/components/ui/foundations/spring";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import type { ComboboxMultiSelectOption } from "./ComboboxMultiSelectInput.types";

type ComboboxMultiSelectQueryInputProps = {
	id: string;
	name?: string;
	type: "text";
	disabled?: boolean;
	placeholder?: string;
	required?: boolean;
	className: string;
	value: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
	onFocus: React.FocusEventHandler<HTMLInputElement>;
	"aria-invalid": boolean;
	"aria-describedby"?: string;
	"aria-controls": string;
	"aria-expanded": boolean;
	"aria-autocomplete": "list";
	"aria-activedescendant"?: string;
	role: "combobox";
	autoComplete: "off";
	spellCheck: false;
};

type ComboboxMultiSelectInputContentProps<T> = {
	inputRef: React.RefObject<HTMLInputElement | null>;
	inputProps: ComboboxMultiSelectQueryInputProps;
	selectedOptions: ComboboxMultiSelectOption<T>[];
	onToggleOption: (option: ComboboxMultiSelectOption<T>) => void;
	disabled?: boolean;
	contentPaddingClass: string;
	chipClassName?: string;
	chipTextClassName?: string;
	chipRemoveClassName?: string;
	chipListClassName?: string;
};

export function ComboboxMultiSelectInputContent<T>({
	inputRef,
	inputProps,
	selectedOptions,
	onToggleOption,
	disabled,
	contentPaddingClass,
	chipClassName,
	chipTextClassName,
	chipRemoveClassName,
	chipListClassName,
}: ComboboxMultiSelectInputContentProps<T>) {
	const motionAllowed = useMotionAllowed(true);
	const chipTransition = getSpring("feedback", { intensity: "strong" });

	const renderChipContent = (option: ComboboxMultiSelectOption<T>) => (
		<>
			<Text
				variant="body"
				as="span"
				className={clsx(
					"text-foreground/80 !leading-[17px]",
					chipTextClassName,
				)}
			>
				{option.label}
			</Text>
			<Button
				variant="ghost"
				size="none"
				className={clsx(
					"text-foreground/50 hover:text-foreground",
					chipRemoveClassName,
				)}
				onMouseDown={(event) => {
					event.preventDefault();
				}}
				onClick={() => {
					if (disabled || option.disabled) return;
					onToggleOption(option);
				}}
			>
				<Icon name="close" size="sm" />
			</Button>
		</>
	);

	const renderChipClassName = (index: number) =>
		clsx(
			"flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-foreground/25 pr-2",
			index === selectedOptions.length - 1 ? "border-r-0 pr-0" : undefined,
			chipClassName,
		);

	const input = motionAllowed ? (
		<motion.input
			key="combo-input"
			layout
			transition={chipTransition}
			ref={inputRef}
			{...inputProps}
		/>
	) : (
		<input ref={inputRef} {...inputProps} />
	);

	return (
		<div
			className={clsx(
				"flex w-full flex-1 min-w-0 flex-nowrap items-center gap-x-2.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				contentPaddingClass,
				chipListClassName,
			)}
		>
			{motionAllowed ? (
				<AnimatePresence initial={false}>
					{selectedOptions.map((option, index) => (
						<motion.div
							key={`${option.value}`}
							layout
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							transition={chipTransition}
							className={renderChipClassName(index)}
						>
							{renderChipContent(option)}
						</motion.div>
					))}
					{input}
				</AnimatePresence>
			) : (
				<>
					{selectedOptions.map((option, index) => (
						<div key={`${option.value}`} className={renderChipClassName(index)}>
							{renderChipContent(option)}
						</div>
					))}
					{input}
				</>
			)}
		</div>
	);
}
