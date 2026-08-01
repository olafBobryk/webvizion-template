// components/ui/input/selection/SelectInput.tsx
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: input + listbox handle keyboard interactions */
"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { InputSkeleton } from "@/components/ui/input/InputSkeleton";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	type DropdownPositionStrategy,
	useDropdownListNavigation,
} from "@/components/ui/primitives/dropdown";
import { dropdownListClassName } from "@/components/ui/primitives/dropdownStyles";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	type InputFrameSize,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import { Listbox } from "@/components/ui/primitives/Listbox";
import { Text } from "@/components/ui/primitives/Text";

type IconProp = IconName | Exclude<React.ReactNode, string | number>;

export type SelectOption<T> = {
	value: T;
	label: string;
	symbol?: string;
	icon?: IconProp;
	/** Replaces only the open listbox row using its intrinsic-height presentation layout. */
	dropdownContent?: React.ReactNode;
	searchText?: string;
	disabled?: boolean;
};

export type SelectInputProps<T> = {
	label: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	id?: string;
	name?: string;
	value: T | null;
	onChange: (value: T) => void;
	/** Return true to intercept the selection and skip the normal value change. */
	// biome-ignore lint/suspicious/noConfusingVoidType: void preserves existing callbacks while true adds interception.
	onOptionSelect?: (value: T, option: SelectOption<T>) => boolean | void;
	options: SelectOption<T>[];
	required?: boolean;
	disabled?: boolean;
	error?: React.ReactNode;
	validate?: (value: string) => string | null;
	filterOption?: (query: string, option: SelectOption<T>) => boolean;
	matchOption?: (query: string, option: SelectOption<T>) => boolean;
	size?: InputFrameSize;
	className?: string;
	inputClassName?: string;
	menuClassName?: string;
	menuListClassName?: string;
	optionClassName?: string;
	optionActiveClassName?: string;
	optionSelectedClassName?: string;
	portalTargetId?: string;
	dropdownPositionStrategy?: DropdownPositionStrategy;
	showSelectedIcon?: boolean;
};

const normalizeQuery = (value: string) =>
	value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const getOptionSearchText = <T,>(option: SelectOption<T>) =>
	option.searchText ?? `${option.label} ${option.symbol ?? ""}`;

const defaultFilter = <T,>(query: string, option: SelectOption<T>) => {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return true;
	return normalizeQuery(getOptionSearchText(option)).includes(normalizedQuery);
};

const defaultMatch = <T,>(query: string, option: SelectOption<T>) => {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return false;
	return normalizeQuery(getOptionSearchText(option)) === normalizedQuery;
};

const getMatchRank = (query: string, option: SelectOption<unknown>) => {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return 0;
	const text = normalizeQuery(getOptionSearchText(option));
	if (text === normalizedQuery) return 0;
	if (text.startsWith(normalizedQuery)) return 1;
	if (text.includes(normalizedQuery)) return 2;
	return 3;
};

const isSearchKey = (value: string) => /^[a-zA-Z0-9]$/.test(value);

const renderOptionIcon = (icon?: IconProp, size: "sm" | "md" | "lg" = "sm") => {
	if (!icon) return null;
	if (typeof icon === "string") {
		return <Icon name={icon as IconName} size={size} />;
	}
	return icon;
};

function SelectInputRoot<T>({
	label,
	description,
	placeholder = "Select option",
	id,
	name,
	value,
	onChange,
	onOptionSelect,
	options,
	required,
	disabled,
	error,
	validate,
	filterOption = defaultFilter,
	matchOption = defaultMatch,
	size,
	className,
	inputClassName,
	menuClassName,
	menuListClassName,
	optionClassName,
	optionActiveClassName,
	optionSelectedClassName,
	portalTargetId,
	dropdownPositionStrategy = "absolute",
	showSelectedIcon = false,
}: SelectInputProps<T>) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [clientError, setClientError] = React.useState<string | null>(null);
	const derivedError = error ?? clientError;
	const tone = derivedError ? "error" : "default";

	const fallbackId = React.useId();
	const inputId = id ?? name ?? fallbackId;
	const descriptionId = description ? `${inputId}-description` : undefined;
	const messageId = derivedError ? `${inputId}-message` : undefined;
	const menuId = `${inputId}-menu`;

	const selectedOption =
		options.find((option) => option.value === value) ?? null;
	const selectedOptionIcon = showSelectedIcon
		? renderOptionIcon(selectedOption?.icon, "sm")
		: null;
	const formatOptionLabel = React.useCallback(
		(option?: SelectOption<T> | null) => {
			if (!option) return "";
			return option.symbol ? `${option.label} ${option.symbol}` : option.label;
		},
		[],
	);

	const normalizedQuery = normalizeQuery(searchQuery);
	const exactMatch =
		normalizedQuery.length > 0
			? (options.find((option) => matchOption(searchQuery, option)) ?? null)
			: null;
	const filteredOptions = React.useMemo(() => {
		const base = options.filter((option) => filterOption(searchQuery, option));
		if (!normalizedQuery) return base;
		return base
			.map((option, index) => ({ option, index }))
			.sort((a, b) => {
				const rank =
					getMatchRank(searchQuery, a.option) -
					getMatchRank(searchQuery, b.option);
				if (rank !== 0) return rank;
				return a.index - b.index;
			})
			.map((entry) => entry.option);
	}, [options, filterOption, searchQuery, normalizedQuery]);

	const [menuOpen, setMenuOpen] = React.useState(false);
	const navigationOptions = React.useMemo(
		() =>
			filteredOptions.map((option) => ({
				disabled: option.disabled,
				selected: exactMatch
					? option.value === exactMatch.value
					: option.value === value,
			})),
		[exactMatch, filteredOptions, value],
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

	const selectOption = (option: SelectOption<T>) => {
		if (onOptionSelect?.(option.value, option) === true) {
			setSearchQuery("");
			return;
		}
		onChange(option.value);
		setSearchQuery("");
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
			<Dropdown
				positionStrategy={dropdownPositionStrategy}
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
						menuId && isOpen && filteredOptions[activeIndex]
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
							start={
								selectedOptionIcon ? (
									<span aria-hidden>{selectedOptionIcon}</span>
								) : undefined
							}
							end={
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
							<input
								ref={inputRef}
								id={inputId}
								name={name}
								type="text"
								disabled={disabled}
								placeholder={placeholder}
								required={required}
								readOnly
								className={[
									inputVariants({
										size,
										hasStart: selectedOptionIcon ? true : undefined,
										hasEnd: true,
										disabled: disabled ? true : undefined,
									}),
									inputClassName,
								]
									.filter(Boolean)
									.join(" ")}
								value={formatOptionLabel(selectedOption)}
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
										const option = filteredOptions[activeIndex];
										if (option && !option.disabled) {
											event.preventDefault();
											selectOption(option);
											closeMenu({ restoreFocus: false });
										}
									}
									if (event.key === "Escape" && isOpen) {
										event.preventDefault();
										setSearchQuery("");
										closeMenu({ restoreFocus: false });
									}
									if (event.key === "Backspace" && searchQuery.length > 0) {
										const nextQuery = searchQuery.slice(0, -1);
										setSearchQuery(nextQuery);
										if (!isOpen && nextQuery.length > 0) openMenu();
										setActiveIndex(0);
									}
									if (
										isSearchKey(event.key) &&
										!event.metaKey &&
										!event.ctrlKey &&
										!event.altKey
									) {
										event.preventDefault();
										setSearchQuery((current) =>
											`${current}${event.key}`.trim(),
										);
										if (!isOpen) openMenu();
										setActiveIndex(0);
									}
								}}
								onBlur={(event) => {
									if (validate) setClientError(validate(event.target.value));
									setSearchQuery("");
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
								spellCheck={false}
							/>
							<input
								type="text"
								tabIndex={-1}
								aria-hidden="true"
								className="sr-only"
								value={searchQuery}
								readOnly
							/>
						</InputFrame>
					);
				}}
				renderMenu={({ close }) => (
					<Listbox
						options={filteredOptions.map((option) => {
							const hasDropdownContent = option.dropdownContent !== undefined;
							const optionIcon = renderOptionIcon(option.icon, "sm");
							return {
								key: `${option.value}`,
								value: option.value,
								selected: option.value === value,
								disabled: option.disabled,
								layout: hasDropdownContent ? "presentation" : undefined,
								content: hasDropdownContent ? (
									option.dropdownContent
								) : (
									<>
										{optionIcon ? (
											<span className="flex shrink-0 items-center">
												{optionIcon}
											</span>
										) : null}
										<Text as="span" variant="body" className="min-w-0 truncate">
											<span className="text-foreground">{option.label}</span>
											{option.symbol ? (
												<span className="text-foreground/50">
													{" "}
													{option.symbol}
												</span>
											) : null}
										</Text>
									</>
								),
							};
						})}
						activeIndex={activeIndex}
						onActiveIndexChange={setActiveIndex}
						onSelect={(_, index) => {
							const option = filteredOptions[index];
							if (!option) return;
							selectOption(option);
							close({ restoreFocus: false });
						}}
						emptyState={<Text variant="body">No results</Text>}
						listRef={listRef}
						listId={menuId}
						optionIdPrefix={menuId ? `${menuId}-option` : undefined}
						listClassName={[dropdownListClassName, menuListClassName]
							.filter(Boolean)
							.join(" ")}
						optionClassName={optionClassName}
						optionActiveClassName={optionActiveClassName}
						optionSelectedClassName={optionSelectedClassName}
						disabled={disabled}
					/>
				)}
			/>
		</Field>
	);
}

export const SelectInput = Object.assign(SelectInputRoot, {
	Skeleton: InputSkeleton,
});
