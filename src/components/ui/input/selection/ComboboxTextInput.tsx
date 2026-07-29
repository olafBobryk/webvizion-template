// components/ui/input/selection/ComboboxTextInput.tsx
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: this input is keyboard-accessible via input + buttons */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: trigger wrapper uses Dropdown renderTrigger */
"use client";

import * as React from "react";
import { InputSkeleton } from "@/components/ui/input/InputSkeleton";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
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

export type ComboboxOption = {
	id: string;
	label: string;
	// optional: use a different value than label
	value?: string;
};

type ComboboxTextInputProps = {
	label?: React.ReactNode;
	placeholder?: string;

	id?: string;
	name?: string;

	// Uncontrolled
	defaultValue?: string;

	// Controlled
	value?: string;
	onChange?: (value: string) => void;

	required?: boolean;
	disabled?: boolean;

	// Options shown in dropdown
	options: ComboboxOption[];

	// Optional filter: if omitted, defaults to case-insensitive includes
	filterOption?: (query: string, option: ComboboxOption) => boolean;
	onSelect?: (option: ComboboxOption) => void;

	// Validation (recommended: pass error from parent)
	error?: React.ReactNode;

	// Optional client-side validation helper
	validate?: (value: string) => string | null;

	className?: string;
	inputClassName?: string;
	menuClassName?: string;
	menuListClassName?: string;
	optionClassName?: string;
	optionActiveClassName?: string;
	optionSelectedClassName?: string;
	fieldClassName?: string;
	noResultsText?: React.ReactNode;

	// Dropdown behavior
	openOnFocus?: boolean; // default true
	openOnChevronClick?: boolean; // default true
	showResultsOnEmptyQuery?: boolean;
	hideNoResults?: boolean;
	hideDropdown?: boolean | ((value: string) => boolean);

	portalTargetId?: string;
	size?: InputFrameSize;
};

function defaultFilter(query: string, option: ComboboxOption) {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return option.label.toLowerCase().includes(q);
}

function ComboboxTextInputRoot({
	label,
	placeholder,
	id,
	name,
	defaultValue,
	value,
	onChange,
	required = false,
	disabled,
	options,
	filterOption = defaultFilter,
	onSelect,
	error,
	validate,
	className,
	inputClassName,
	menuClassName,
	menuListClassName,
	optionClassName,
	optionActiveClassName,
	optionSelectedClassName,
	fieldClassName,
	noResultsText,
	openOnFocus = true,
	openOnChevronClick = true,
	showResultsOnEmptyQuery = true,
	hideNoResults = false,
	hideDropdown = false,
	portalTargetId,
	size,
}: ComboboxTextInputProps) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const isControlled = value !== undefined;
	const [clientError, setClientError] = React.useState<string | null>(null);
	const derivedError = error ?? clientError;
	const tone = derivedError ? "error" : "default";

	const fallbackId = React.useId();
	const inputId = id ?? name ?? fallbackId;
	const messageId = derivedError ? `${inputId}-message` : undefined;
	const menuId = `${inputId}-menu`;

	// local input state for uncontrolled mode
	const [uncontrolledValue, setUncontrolledValue] = React.useState(
		defaultValue ?? "",
	);

	const inputValue = isControlled ? (value ?? "") : uncontrolledValue;
	const shouldHideDropdownForValue = React.useCallback(
		(nextValue: string) =>
			typeof hideDropdown === "function"
				? hideDropdown(nextValue)
				: hideDropdown,
		[hideDropdown],
	);
	const shouldHideDropdown = shouldHideDropdownForValue(inputValue);

	const setValue = React.useCallback(
		(next: string) => {
			if (!isControlled) setUncontrolledValue(next);
			onChange?.(next);
		},
		[isControlled, onChange],
	);

	const filtered = React.useMemo(() => {
		if (!showResultsOnEmptyQuery && inputValue.trim().length === 0) {
			return [];
		}

		return options.filter((opt) => filterOption(inputValue, opt));
	}, [options, filterOption, inputValue, showResultsOnEmptyQuery]);

	const [menuOpen, setMenuOpen] = React.useState(false);
	const navigationOptions = React.useMemo(
		() =>
			filtered.map((option) => ({
				selected: (option.value ?? option.label) === inputValue,
			})),
		[filtered, inputValue],
	);
	const { activeIndex, getNextIndex, listRef, setActiveIndex } =
		useDropdownListNavigation({ isOpen: menuOpen, options: navigationOptions });

	const updateActiveIndex = React.useCallback(
		(direction: 1 | -1) => {
			setActiveIndex((current) => getNextIndex(current, direction));
		},
		[getNextIndex, setActiveIndex],
	);

	return (
		<Field
			label={label}
			message={derivedError ?? undefined}
			tone={tone}
			required={required}
			inputId={inputId}
			messageId={messageId}
			className={fieldClassName}
		>
			<Dropdown
				open={shouldHideDropdown ? false : menuOpen}
				portalTargetId={portalTargetId}
				menuWidth="trigger"
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
						menuId && isOpen && filtered[activeIndex]
							? `${menuId}-option-${activeIndex}`
							: undefined;

					const handleChevronClick = (event: React.MouseEvent) => {
						event.stopPropagation();
						if (!openOnChevronClick || shouldHideDropdown) return;
						if (isOpen) {
							closeMenu({ restoreFocus: false });
							return;
						}
						openMenu();
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
							end={
								openOnChevronClick ? (
									<Button
										variant="ghost"
										size="icon-sm"
										align="center"
										onClick={handleChevronClick}
										onMouseDown={(event) => {
											event.preventDefault();
										}}
										tabIndex={-1}
										className="rounded-[8px] text-foreground/60"
										aria-label="Toggle options"
									>
										{chevronIcon}
									</Button>
								) : null
							}
							className={className}
							contentClassName="flex items-center"
							onMouseDown={(event) => {
								if (disabled) return;
								const target = event.target as HTMLElement;
								if (target.tagName !== "INPUT") event.preventDefault();
								inputRef.current?.focus({ preventScroll: true });
								if (openOnFocus && !shouldHideDropdown) openMenu();
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
								className={[
									inputVariants({
										size,
										hasEnd: openOnChevronClick ? true : undefined,
										disabled: disabled ? true : undefined,
									}),
									inputClassName,
								]
									.filter(Boolean)
									.join(" ")}
								value={inputValue}
								onChange={(e) => {
									const nextValue = e.target.value;
									const nextShouldHideDropdown =
										shouldHideDropdownForValue(nextValue);
									if (validate) setClientError(null);
									setValue(nextValue);
									setActiveIndex(0);
									if (nextShouldHideDropdown) {
										if (isOpen) {
											closeMenu({ restoreFocus: false });
										}
										return;
									}
									if (!isOpen && (openOnFocus || nextValue.trim().length > 0)) {
										openMenu();
									}
								}}
								onBlur={(e) => {
									if (!validate) return;
									setClientError(validate(e.target.value));
								}}
								onFocus={() => {
									if (!openOnFocus || shouldHideDropdown) return;
									openMenu();
								}}
								onKeyDown={(event) => {
									if (event.key === "ArrowDown") {
										if (shouldHideDropdown) return;
										event.preventDefault();
										if (!isOpen) openMenu();
										updateActiveIndex(1);
										return;
									}
									if (event.key === "ArrowUp") {
										if (shouldHideDropdown) return;
										event.preventDefault();
										if (!isOpen) openMenu();
										updateActiveIndex(-1);
										return;
									}
									if (event.key === "Enter") {
										if (shouldHideDropdown) return;
										if (!isOpen) {
											event.preventDefault();
											openMenu();
											return;
										}
										const option = filtered[activeIndex];
										if (option) {
											event.preventDefault();
											setValue(option.value ?? option.label);
											onSelect?.(option);
											closeMenu({ restoreFocus: false });
										}
										return;
									}
									if (event.key === "Escape" && isOpen) {
										event.preventDefault();
										closeMenu({ restoreFocus: false });
									}
								}}
								aria-invalid={Boolean(derivedError)}
								aria-describedby={messageId}
								aria-controls={menuId}
								aria-expanded={isOpen}
								aria-autocomplete="list"
								aria-activedescendant={activeOptionId}
								role="combobox"
							/>
						</InputFrame>
					);
				}}
				renderMenu={({ close }) => (
					<Listbox
						options={filtered.map((opt) => {
							const optionValue = opt.value ?? opt.label;
							return {
								key: opt.id,
								value: optionValue,
								selected: optionValue === inputValue,
								content: <span className="min-w-0 truncate">{opt.label}</span>,
							};
						})}
						activeIndex={activeIndex}
						onActiveIndexChange={setActiveIndex}
						onSelect={(_, index) => {
							const option = filtered[index];
							if (!option) return;
							setValue(option.value ?? option.label);
							onSelect?.(option);
							close({ restoreFocus: false });
						}}
						emptyState={
							hideNoResults ? null : (
								<Text as="span" variant="body">
									{noResultsText ?? "No results"}
								</Text>
							)
						}
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

export const ComboboxTextInput = Object.assign(ComboboxTextInputRoot, {
	Skeleton: InputSkeleton,
});
