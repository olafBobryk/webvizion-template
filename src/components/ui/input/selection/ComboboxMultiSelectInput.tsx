// components/ui/input/selection/ComboboxMultiSelectInput.tsx
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: input + listbox handle keyboard interactions */
"use client";

import clsx from "clsx";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { InputSkeleton } from "@/components/ui/input/InputSkeleton";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	useDropdownListNavigation,
} from "@/components/ui/primitives/dropdown";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	type InputFrameSize,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import { Text } from "@/components/ui/primitives/Text";
import type {
	ComboboxMultiSelectInputProps,
	ComboboxMultiSelectOption,
} from "./ComboboxMultiSelectInput.types";
import { ComboboxMultiSelectInputContent } from "./ComboboxMultiSelectInputContent";
import {
	ComboboxMultiSelectListbox,
	renderComboboxMultiSelectIcon,
} from "./ComboboxMultiSelectListbox";

const normalizeQuery = (value: string) =>
	value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const getOptionSearchText = <T,>(option: ComboboxMultiSelectOption<T>) =>
	option.searchText ?? `${option.label} ${option.symbol ?? ""}`;

const defaultFilter = <T,>(
	query: string,
	option: ComboboxMultiSelectOption<T>,
) => {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return true;
	return normalizeQuery(getOptionSearchText(option)).includes(normalizedQuery);
};

const defaultMatch = <T,>(
	query: string,
	option: ComboboxMultiSelectOption<T>,
) => {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return false;
	return normalizeQuery(getOptionSearchText(option)) === normalizedQuery;
};

const getMatchRank = (
	query: string,
	option: ComboboxMultiSelectOption<unknown>,
) => {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return 0;
	const text = normalizeQuery(getOptionSearchText(option));
	if (text === normalizedQuery) return 0;
	if (text.startsWith(normalizedQuery)) return 1;
	if (text.includes(normalizedQuery)) return 2;
	return 3;
};

const contentPaddingBySize: Record<NonNullable<InputFrameSize>, string> = {
	sm: "px-3 py-[8.5px]",
	md: "px-[15px] py-[11.5px]",
	lg: "px-4 py-[12.5px]",
};

function ComboboxMultiSelectInputRoot<T>({
	label,
	description,
	placeholder = "Search...",
	id,
	name,
	value,
	onChange,
	options,
	required,
	disabled,
	error,
	validate,
	filterOption = defaultFilter,
	matchOption = defaultMatch,
	leadingIcon,
	showSpinnerOnMismatch = false,
	size = "sm",
	iconSize = "md",
	endText,
	className,
	inputClassName,
	menuClassName,
	menuListClassName,
	optionClassName,
	optionActiveClassName,
	portalTargetId,
	chipClassName,
	chipTextClassName,
	chipRemoveClassName,
	chipListClassName,
	noResultsText,
	allSelectedText,
}: ComboboxMultiSelectInputProps<T>) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const [query, setQuery] = React.useState("");
	const [clientError, setClientError] = React.useState<string | null>(null);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const derivedError = error ?? clientError;
	const tone = derivedError ? "error" : "default";

	const fallbackId = React.useId();
	const inputId = id ?? name ?? fallbackId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const messageId = derivedError ? `${inputId}-message` : undefined;
	const menuId = `${inputId}-menu`;

	const selectedOptions = React.useMemo(
		() =>
			value
				.map((selected) => options.find((option) => option.value === selected))
				.filter(Boolean) as ComboboxMultiSelectOption<T>[],
		[options, value],
	);

	const filteredOptions = React.useMemo(
		() => options.filter((option) => filterOption(query, option)),
		[options, filterOption, query],
	);

	const normalizedQuery = normalizeQuery(query);
	const exactMatch =
		normalizedQuery.length > 0
			? (options.find((option) => matchOption(query, option)) ?? null)
			: null;
	const showSpinner =
		showSpinnerOnMismatch && normalizedQuery.length > 0 && !exactMatch;

	const availableOptions = React.useMemo(
		() => filteredOptions.filter((option) => !value.includes(option.value)),
		[filteredOptions, value],
	);

	const displayOptions = React.useMemo(() => {
		return [...availableOptions]
			.map((option, index) => ({ option, index }))
			.sort((a, b) => {
				if (normalizedQuery.length) {
					const rank =
						getMatchRank(query, a.option) - getMatchRank(query, b.option);
					if (rank !== 0) return rank;
				}
				return a.index - b.index;
			})
			.map((entry) => entry.option);
	}, [availableOptions, normalizedQuery.length, query]);

	const navigationOptions = React.useMemo(
		() =>
			displayOptions.map((option) => ({
				disabled: option.disabled,
			})),
		[displayOptions],
	);
	const { activeIndex, getNextIndex, listRef, setActiveIndex } =
		useDropdownListNavigation({ isOpen: menuOpen, options: navigationOptions });

	const describedBy =
		[descriptionId, derivedError ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	const updateActiveIndex = React.useCallback(
		(direction: 1 | -1) => {
			setActiveIndex((current) => getNextIndex(current, direction));
		},
		[getNextIndex, setActiveIndex],
	);

	const toggleOption = React.useCallback(
		(option: ComboboxMultiSelectOption<T>) => {
			const exists = value.includes(option.value);
			const next = exists
				? value.filter((item) => item !== option.value)
				: [...value, option.value];
			onChange(next);
		},
		[onChange, value],
	);

	const iconSwap = (() => {
		const baseIcon = renderComboboxMultiSelectIcon(leadingIcon, iconSize);
		const spinnerIcon = (
			<Icon
				name="spinner"
				size={iconSize}
				className="text-foreground/60"
				animate
			/>
		);

		if (!baseIcon && !showSpinner) return null;

		return (
			<span className="flex items-center justify-center">
				{showSpinner ? spinnerIcon : baseIcon}
			</span>
		);
	})();

	const inputClasses = inputVariants({
		size,
		hasStart: iconSwap ? true : undefined,
		hasEnd: true,
		disabled: disabled ? true : undefined,
	});
	const contentPaddingClass = contentPaddingBySize[size ?? "md"];

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
			<Dropdown
				portalTargetId={portalTargetId}
				menuWidth="trigger"
				align="start"
				offset={20}
				disabled={disabled}
				openOnHover={false}
				pinOnClick={false}
				onOpenChange={setMenuOpen}
				menuClassName={menuClassName}
				renderTrigger={({
					ref,
					isOpen,
					onRootMouseEnter,
					onRootMouseLeave,
					openMenu,
					closeMenu,
					chevronIcon,
				}) => {
					const activeOptionId =
						menuId && isOpen && displayOptions[activeIndex]
							? `${menuId}-option-${activeIndex}`
							: undefined;
					const inputProps = {
						id: inputId,
						name,
						type: "text" as const,
						disabled,
						placeholder: selectedOptions.length === 0 ? placeholder : undefined,
						required,
						className: clsx(
							inputClasses,
							"!p-0 w-auto min-w-[4ch] flex-1",
							inputClassName,
						),
						value: query,
						onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
							if (validate) setClientError(null);
							setQuery(event.target.value);
							if (!isOpen) openMenu();
						},
						onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
							if (event.key === "ArrowDown") {
								event.preventDefault();
								if (!isOpen) openMenu();
								updateActiveIndex(1);
								return;
							}
							if (event.key === "ArrowUp") {
								event.preventDefault();
								if (!isOpen) openMenu();
								updateActiveIndex(-1);
								return;
							}
							if (event.key === "Enter") {
								if (!isOpen) {
									event.preventDefault();
									openMenu();
									return;
								}
								const option = displayOptions[activeIndex];
								if (option && !option.disabled) {
									event.preventDefault();
									toggleOption(option);
								}
							}
							if (event.key === "Escape" && isOpen) {
								event.preventDefault();
								closeMenu({ restoreFocus: false });
							}
							if (event.key === "Backspace" && query.length === 0) {
								const last = selectedOptions[selectedOptions.length - 1];
								if (last) {
									event.preventDefault();
									toggleOption(last);
								}
							}
						},
						onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
							if (validate) setClientError(validate(event.target.value));
						},
						onFocus: () => {
							openMenu();
						},
						"aria-invalid": Boolean(derivedError),
						"aria-describedby": describedBy,
						"aria-controls": menuId,
						"aria-expanded": isOpen,
						"aria-autocomplete": "list" as const,
						"aria-activedescendant": activeOptionId,
						role: "combobox" as const,
						autoComplete: "off" as const,
						spellCheck: false as const,
					};

					return (
						<InputFrame
							ref={ref as React.Ref<HTMLDivElement>}
							onMouseEnter={onRootMouseEnter}
							onMouseLeave={onRootMouseLeave}
							tone={tone}
							size={size}
							disabled={disabled}
							fullWidth
							contentClassName="relative flex min-w-0 items-center"
							start={iconSwap}
							end={
								<div className="flex items-center gap-2.5">
									{endText ? (
										<Text
											as="span"
											variant="body"
											className="text-foreground/50"
										>
											{endText}
										</Text>
									) : null}
									<Button
										data-dropdown-chevron
										aria-label="Toggle options"
										variant="ghost"
										size="icon-sm"
										align="center"
										className="rounded-[8px] text-foreground/60"
										onMouseDown={(event) => {
											event.preventDefault();
										}}
										onClick={() => {
											if (isOpen) {
												closeMenu({ restoreFocus: false });
												return;
											}
											openMenu();
										}}
										tabIndex={-1}
									>
										{chevronIcon}
									</Button>
								</div>
							}
							onMouseDown={(event) => {
								if (disabled) return;
								const target = event.target as HTMLElement;
								if (target.closest("[data-dropdown-chevron]")) return;
								if (target.tagName !== "INPUT") event.preventDefault();
								inputRef.current?.focus({ preventScroll: true });
								openMenu();
							}}
						>
							<ComboboxMultiSelectInputContent
								inputRef={inputRef}
								inputProps={inputProps}
								selectedOptions={selectedOptions}
								onToggleOption={toggleOption}
								disabled={disabled}
								contentPaddingClass={contentPaddingClass}
								chipClassName={chipClassName}
								chipTextClassName={chipTextClassName}
								chipRemoveClassName={chipRemoveClassName}
								chipListClassName={chipListClassName}
							/>
						</InputFrame>
					);
				}}
				renderMenu={() => (
					<ComboboxMultiSelectListbox
						activeIndex={activeIndex}
						allSelectedText={allSelectedText}
						disabled={disabled}
						filteredOptionCount={filteredOptions.length}
						iconSize={iconSize}
						listId={menuId}
						listRef={listRef}
						menuListClassName={menuListClassName}
						noResultsText={noResultsText}
						onActiveIndexChange={setActiveIndex}
						onToggleOption={toggleOption}
						optionActiveClassName={optionActiveClassName}
						optionClassName={optionClassName}
						options={displayOptions}
					/>
				)}
			/>
		</Field>
	);
}

export const ComboboxMultiSelectInput = Object.assign(
	ComboboxMultiSelectInputRoot,
	{ Skeleton: InputSkeleton },
);
