// components/ui/input/selection/ComboboxMultiSelectInput.tsx
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: input + listbox handle keyboard interactions */
"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { getSpring } from "@/components/ui/foundations/spring";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { ChoiceIndicatorMulti } from "@/components/ui/input/choice/ChoiceIndicators";
import { InputSkeleton } from "@/components/ui/input/InputSkeleton";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	useDropdownListNavigation,
} from "@/components/ui/primitives/Dropdown";
import { dropdownListClassName } from "@/components/ui/primitives/dropdownStyles";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	type InputFrameSize,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import { Listbox } from "@/components/ui/primitives/Listbox";
import { Text } from "@/components/ui/primitives/Text";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

type IconProp = IconName | Exclude<React.ReactNode, string | number>;

type ComboboxMultiSelectOption<T> = {
	value: T;
	label: string;
	symbol?: string;
	icon?: IconProp;
	searchText?: string;
	disabled?: boolean;
};

type ComboboxMultiSelectInputProps<T> = {
	label: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	id?: string;
	name?: string;
	value: T[];
	onChange: (value: T[]) => void;
	options: ComboboxMultiSelectOption<T>[];
	required?: boolean;
	disabled?: boolean;
	error?: React.ReactNode;
	validate?: (value: string) => string | null;
	filterOption?: (
		query: string,
		option: ComboboxMultiSelectOption<T>,
	) => boolean;
	matchOption?: (
		query: string,
		option: ComboboxMultiSelectOption<T>,
	) => boolean;
	leadingIcon?: IconProp;
	showSpinnerOnMismatch?: boolean;
	size?: InputFrameSize;
	iconSize?: "sm" | "md" | "lg";
	endText?: React.ReactNode;
	className?: string;
	inputClassName?: string;
	menuClassName?: string;
	menuListClassName?: string;
	optionClassName?: string;
	optionActiveClassName?: string;
	portalTargetId?: string;
	chipClassName?: string;
	chipTextClassName?: string;
	chipRemoveClassName?: string;
	chipListClassName?: string;
	noResultsText?: React.ReactNode;
	allSelectedText?: React.ReactNode;
};

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

const renderOptionIcon = (icon?: IconProp, size: "sm" | "md" | "lg" = "md") => {
	if (!icon) return null;
	if (typeof icon === "string") {
		return <Icon name={icon as IconName} size={size} />;
	}
	return icon;
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
	const derivedError = error ?? clientError;
	const tone = derivedError ? "error" : "default";
	const motionAllowed = useMotionAllowed(true);
	const chipTransition = getSpring("feedback", { intensity: "strong" });

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

	const [menuOpen, setMenuOpen] = React.useState(false);

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
		const baseIcon = renderOptionIcon(leadingIcon, iconSize);
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
							<div
								className={clsx(
									"flex w-full flex-1 min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2",
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
												className={clsx(
													"flex items-center gap-1.5 border-r border-foreground/25 pr-2",
													index === selectedOptions.length - 1
														? "border-r-0 pr-0"
														: undefined,
													chipClassName,
												)}
											>
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
														toggleOption(option);
													}}
												>
													<Icon name="close" size="sm" />
												</Button>
											</motion.div>
										))}
										<motion.input
											key="combo-input"
											layout
											transition={chipTransition}
											ref={inputRef}
											id={inputId}
											name={name}
											type="text"
											disabled={disabled}
											placeholder={
												selectedOptions.length === 0 ? placeholder : undefined
											}
											required={required}
											className={clsx(
												inputClasses,
												"!p-0 w-auto min-w-[4ch] flex-1",
												inputClassName,
											)}
											value={query}
											onChange={(event) => {
												if (validate) setClientError(null);
												setQuery(event.target.value);
												if (!isOpen) openMenu();
											}}
											onKeyDown={(event) => {
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
													const last =
														selectedOptions[selectedOptions.length - 1];
													if (last) {
														event.preventDefault();
														toggleOption(last);
													}
												}
											}}
											onBlur={(event) => {
												if (validate)
													setClientError(validate(event.target.value));
											}}
											onFocus={() => {
												openMenu();
											}}
											aria-invalid={Boolean(derivedError)}
											aria-describedby={describedBy}
											aria-controls={menuId}
											aria-expanded={isOpen}
											aria-autocomplete="list"
											aria-activedescendant={activeOptionId}
											role="combobox"
											autoComplete="off"
											spellCheck={false}
										/>
									</AnimatePresence>
								) : (
									<>
										{selectedOptions.map((option, index) => (
											<div
												key={`${option.value}`}
												className={clsx(
													"flex items-center gap-1.5 border-r border-foreground/25 pr-2",
													index === selectedOptions.length - 1
														? "border-r-0 pr-0"
														: undefined,
													chipClassName,
												)}
											>
												<Text
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
														toggleOption(option);
													}}
												>
													<Icon name="close" size="sm" />
												</Button>
											</div>
										))}
										<input
											ref={inputRef}
											id={inputId}
											name={name}
											type="text"
											disabled={disabled}
											placeholder={
												selectedOptions.length === 0 ? placeholder : undefined
											}
											required={required}
											className={clsx(
												inputClasses,
												"!p-0 w-auto min-w-[4ch] flex-1",
												inputClassName,
											)}
											value={query}
											onChange={(event) => {
												if (validate) setClientError(null);
												setQuery(event.target.value);
												if (!isOpen) openMenu();
											}}
											onKeyDown={(event) => {
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
													const last =
														selectedOptions[selectedOptions.length - 1];
													if (last) {
														event.preventDefault();
														toggleOption(last);
													}
												}
											}}
											onBlur={(event) => {
												if (validate)
													setClientError(validate(event.target.value));
											}}
											onFocus={() => {
												openMenu();
											}}
											aria-invalid={Boolean(derivedError)}
											aria-describedby={describedBy}
											aria-controls={menuId}
											aria-expanded={isOpen}
											aria-autocomplete="list"
											aria-activedescendant={activeOptionId}
											role="combobox"
											autoComplete="off"
											spellCheck={false}
										/>
									</>
								)}
							</div>
						</InputFrame>
					);
				}}
				renderMenu={() => (
					<Listbox
						options={
							displayOptions.length === 0
								? []
								: displayOptions.map((option) => {
										const optionIcon = renderOptionIcon(option.icon, iconSize);
										return {
											key: `${option.value}`,
											value: option.value,
											disabled: option.disabled,
											content: (
												<>
													{optionIcon ? (
														<span className="flex shrink-0 items-center">
															{optionIcon}
														</span>
													) : null}
													<span className="min-w-0 truncate">
														<span className="text-foreground/80">
															{option.label}
														</span>
														{option.symbol ? (
															<span className="text-foreground/50">
																{" "}
																{option.symbol}
															</span>
														) : null}
													</span>
													<span className="ml-auto flex shrink-0 items-center">
														<ChoiceIndicatorMulti
															checked={false}
															disabled={Boolean(option.disabled)}
														/>
													</span>
												</>
											),
										};
									})
						}
						activeIndex={activeIndex}
						onActiveIndexChange={setActiveIndex}
						onSelect={(_, index) => {
							const option = displayOptions[index];
							if (!option) return;
							toggleOption(option);
						}}
						emptyState={
							<Text variant="body">
								{filteredOptions.length === 0
									? (noResultsText ?? "No results")
									: (allSelectedText ?? "All options selected")}
							</Text>
						}
						listRef={listRef}
						listId={menuId}
						optionIdPrefix={menuId ? `${menuId}-option` : undefined}
						listClassName={clsx(dropdownListClassName, menuListClassName)}
						optionClassName={clsx("[&>span]:w-full", optionClassName)}
						optionActiveClassName={optionActiveClassName}
						multiselectable
						disabled={disabled}
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
