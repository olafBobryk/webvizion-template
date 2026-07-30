// components/ui/input/text/PhoneInput.tsx
"use client";

import type { CountryCode } from "libphonenumber-js";
import {
	isValidPhoneNumber,
	parsePhoneNumberFromString,
} from "libphonenumber-js/min";
import * as React from "react";
import { IconSwap } from "@/components/ui/helpers/IconSwap";
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
import { PhoneCountryListbox } from "./PhoneCountryListbox";
import type {
	CountryOption,
	InternalCountryOption,
} from "./phoneCountryOptions";
import {
	createInternalCountries,
	filterCountryOptions,
	matchCountryFromValue as findCountryFromValue,
	normalizeDialCode,
} from "./phoneCountryOptions";

export type { CountryOption } from "./phoneCountryOptions";

type PhoneValue = string | undefined; // E.164

type PhoneInputProps = {
	label: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;

	id?: string;
	name?: string;

	value?: PhoneValue;
	onChange?: (value: PhoneValue) => void;

	// Optional extended API
	country?: CountryCode;
	defaultCountry?: CountryCode;
	onCountryChange?: (countryCode: CountryCode) => void;
	formatOnBlur?: boolean;
	e164Name?: string;
	showSpinnerOnMismatch?: boolean;
	size?: InputFrameSize;

	required?: boolean;
	disabled?: boolean;

	error?: React.ReactNode;
	validate?: (value: PhoneValue, country?: CountryCode) => string | null;

	className?: string;
	inputClassName?: string;
	menuClassName?: string;
	optionClassName?: string;
	optionActiveClassName?: string;
	optionSelectedClassName?: string;
	portalTargetId?: string;

	countries?: CountryOption[]; // allow override/extension
};

const isLetterKey = (value: string) => /^[a-zA-Z]$/.test(value);
const isNumberKey = (value: string) => /^[0-9]$/.test(value);

const defaultValidate = (value: PhoneValue, country?: CountryCode) => {
	if (!value) return null;
	if (!country) return "Select a country.";
	return isValidPhoneNumber(
		value,
		country as Parameters<typeof isValidPhoneNumber>[1],
	)
		? null
		: "Enter a valid phone number.";
};

function PhoneInputRoot({
	label,
	description,
	placeholder = "Phone number",
	id,
	name,
	value,
	onChange,
	country,
	defaultCountry = "US",
	onCountryChange,
	required,
	disabled,
	error,
	validate = defaultValidate,
	formatOnBlur = false,
	e164Name,
	showSpinnerOnMismatch = true,
	size,
	className,
	inputClassName,
	menuClassName,
	optionClassName,
	optionActiveClassName,
	optionSelectedClassName,
	portalTargetId,
	countries,
}: PhoneInputProps) {
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

	const isCountryControlled = country !== undefined;
	const [internalCountry, setInternalCountry] = React.useState<CountryCode>(
		defaultCountry ?? "US",
	);

	const [displayValue, setDisplayValue] = React.useState("");

	React.useEffect(() => {
		if (!value) {
			setDisplayValue("");
			return;
		}
		try {
			const parsed = parsePhoneNumberFromString(value);
			if (!parsed) {
				setDisplayValue(value);
				return;
			}
			setDisplayValue(parsed.formatInternational());
			if (parsed.country && !isCountryControlled) {
				setInternalCountry(parsed.country as CountryCode);
			}
		} catch {
			setDisplayValue(value);
		}
	}, [value, isCountryControlled]);

	React.useEffect(() => {
		if (isCountryControlled) return;
		if (defaultCountry && defaultCountry !== internalCountry) {
			setInternalCountry(defaultCountry);
		}
	}, [defaultCountry, internalCountry, isCountryControlled]);

	const selectedCountryCode = isCountryControlled ? country : internalCountry;

	const displayNames = React.useMemo(() => {
		try {
			return new Intl.DisplayNames(["en"], { type: "region" });
		} catch {
			return null;
		}
	}, []);

	const internalCountries: InternalCountryOption[] = React.useMemo(
		() => createInternalCountries(countries, displayNames),
		[countries, displayNames],
	);

	const selectedCountry =
		internalCountries.find((item) => item.code === selectedCountryCode) ?? null;

	const parsedPhone = React.useMemo(() => {
		if (!displayValue || !selectedCountryCode) return null;
		try {
			return parsePhoneNumberFromString(
				displayValue,
				selectedCountryCode as Parameters<typeof parsePhoneNumberFromString>[1],
			);
		} catch {
			return null;
		}
	}, [displayValue, selectedCountryCode]);

	const e164Value = parsedPhone?.number;
	const describedBy =
		[descriptionId, derivedError ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	const filteredCountries = React.useMemo(
		() => filterCountryOptions(internalCountries, searchQuery),
		[internalCountries, searchQuery],
	);

	const matchCountryFromValue = React.useCallback(
		(nextValue: string) => findCountryFromValue(internalCountries, nextValue),
		[internalCountries],
	);

	const resolvedDial = selectedCountry?.dial_code
		? normalizeDialCode(selectedCountry.dial_code)
		: null;
	const normalizedValue = normalizeDialCode(displayValue.trim());
	const normalizedValueWithPlus =
		normalizedValue && !normalizedValue.startsWith("+")
			? `+${normalizedValue}`
			: normalizedValue;
	const selectedMatchesValue =
		resolvedDial && normalizedValueWithPlus.startsWith(resolvedDial);

	const iconCountry =
		selectedCountry && selectedMatchesValue
			? selectedCountry
			: matchCountryFromValue(displayValue);

	const showSpinner = showSpinnerOnMismatch && !iconCountry;
	const [menuOpen, setMenuOpen] = React.useState(false);
	const navigationOptions = React.useMemo(
		() =>
			filteredCountries.map((country) => ({
				selected: country.code === selectedCountry?.code,
			})),
		[filteredCountries, selectedCountry?.code],
	);
	const { activeIndex, getNextIndex, listRef, setActiveIndex } =
		useDropdownListNavigation({ isOpen: menuOpen, options: navigationOptions });

	const updateActiveIndex = React.useCallback(
		(direction: 1 | -1) => {
			setActiveIndex((current) => getNextIndex(current, direction));
		},
		[getNextIndex, setActiveIndex],
	);

	const applyDialCode = React.useCallback(
		(nextDialCode: string) => {
			const normalizedDial = nextDialCode.startsWith("+")
				? nextDialCode
				: `+${nextDialCode}`;
			const rest = displayValue.replace(/^\+\d+\s*/, "").trimStart();
			const nextValue = rest
				? `${normalizedDial} ${rest}`
				: `${normalizedDial} `;
			setDisplayValue(nextValue);
		},
		[displayValue],
	);

	const didPrefillRef = React.useRef(false);
	React.useEffect(() => {
		if (didPrefillRef.current) return;
		if (!selectedCountry?.dial_code) return;
		if (displayValue.trim().length > 0) {
			didPrefillRef.current = true;
			return;
		}
		applyDialCode(selectedCountry.dial_code);
		didPrefillRef.current = true;
	}, [applyDialCode, displayValue, selectedCountry?.dial_code]);

	const syncCountryFromValue = React.useCallback(
		(nextValue: string) => {
			const matched = matchCountryFromValue(nextValue);
			if (!matched) return;
			if (matched.code === selectedCountryCode) return;
			if (!isCountryControlled) setInternalCountry(matched.code);
			onCountryChange?.(matched.code);
		},
		[
			isCountryControlled,
			matchCountryFromValue,
			onCountryChange,
			selectedCountryCode,
		],
	);

	const handleCountrySelect = (nextCode: CountryCode) => {
		if (!isCountryControlled) setInternalCountry(nextCode);
		onCountryChange?.(nextCode);
		const nextCountry = internalCountries.find(
			(item) => item.code === nextCode,
		);
		if (nextCountry?.dial_code) {
			applyDialCode(nextCountry.dial_code);
		}
		setSearchQuery("");
	};

	const startSwap = (() => {
		const resolvedCountry = iconCountry ?? null;
		const flagIcon = resolvedCountry ? (
			<span aria-hidden="true" className="text-[18px] leading-none">
				{resolvedCountry.flag}
			</span>
		) : (
			<span />
		);
		const spinnerIcon = (
			<Icon name="flag" size="md" className="text-foreground/60" animate />
		);

		if (!resolvedCountry && !showSpinner) return null;

		return (
			<IconSwap
				size="md"
				activeIndex={showSpinner ? 1 : 0}
				items={[{ icon: flagIcon }, { icon: spinnerIcon }]}
			/>
		);
	})();

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
						menuId && isOpen && filteredCountries[activeIndex]
							? `${menuId}-option-${activeIndex}`
							: undefined;

					return (
						<InputFrame
							tone={tone}
							ref={ref as React.Ref<HTMLDivElement>}
							onMouseEnter={onRootMouseEnter}
							onMouseLeave={onRootMouseLeave}
							size={size}
							disabled={disabled}
							fullWidth
							contentClassName="relative flex min-w-0 items-center"
							start={
								<div className="flex items-center gap-2.5">
									{startSwap ? (
										<span className="flex items-center">{startSwap}</span>
									) : null}
									<span className="w-px h-5 rounded-full bg-foreground/15" />
								</div>
							}
							end={
								<div className="flex items-center gap-2.5">
									<Button
										data-dropdown-chevron
										aria-label="Toggle country list"
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
							<input
								ref={inputRef}
								id={inputId}
								name={name}
								type="tel"
								inputMode="tel"
								autoComplete="tel"
								disabled={disabled}
								placeholder={placeholder}
								required={required}
								className={[
									inputVariants({
										size,
										hasStart: true,
										hasEnd: true,
										disabled: disabled ? true : undefined,
									}),
									inputClassName,
								]
									.filter(Boolean)
									.join(" ")}
								value={displayValue}
								onChange={(event) => {
									setClientError(null);
									const next = event.target.value;
									setDisplayValue(next);
									let nextE164: PhoneValue;
									try {
										const parsed = parsePhoneNumberFromString(
											next,
											selectedCountryCode as Parameters<
												typeof parsePhoneNumberFromString
											>[1],
										);
										nextE164 = parsed?.isValid() ? parsed.number : undefined;
									} catch {
										nextE164 = undefined;
									}
									onChange?.(nextE164);
									if (!next.trim() || /\d/.test(next) || searchQuery) {
										setSearchQuery("");
										setActiveIndex(0);
									}
									syncCountryFromValue(next);
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
										const option = filteredCountries[activeIndex];
										if (option) {
											event.preventDefault();
											handleCountrySelect(option.code);
											closeMenu({ restoreFocus: false });
										}
									}
									if (event.key === "Backspace" && searchQuery.length > 0) {
										const nextQuery = searchQuery.slice(0, -1);
										setSearchQuery(nextQuery);
										if (!isOpen && nextQuery.length > 0) openMenu();
										setActiveIndex(0);
									}
									if (
										isLetterKey(event.key) &&
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
										return;
									}
									if (isNumberKey(event.key) && searchQuery.length > 0) {
										setSearchQuery("");
										setActiveIndex(0);
									}
								}}
								onBlur={() => {
									if (validate) {
										setClientError(validate(e164Value, selectedCountryCode));
									}
									if (formatOnBlur && parsedPhone) {
										const formatted = parsedPhone.formatInternational();
										if (formatted !== displayValue) {
											setDisplayValue(formatted);
										}
									}
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
							{name || e164Name ? (
								<input
									type="hidden"
									name={e164Name ?? `${name}-e164`}
									value={e164Value ?? ""}
								/>
							) : null}
						</InputFrame>
					);
				}}
				renderMenu={({ close }) => (
					<PhoneCountryListbox
						activeIndex={activeIndex}
						countries={filteredCountries}
						disabled={disabled}
						listId={menuId}
						listRef={listRef}
						onActiveIndexChange={setActiveIndex}
						onSelect={(countryOption) => {
							handleCountrySelect(countryOption.code);
							close({ restoreFocus: false });
						}}
						optionClassName={optionClassName}
						optionActiveClassName={optionActiveClassName}
						optionSelectedClassName={optionSelectedClassName}
						selectedCountryCode={selectedCountryCode}
					/>
				)}
			/>
		</Field>
	);
}

export const PhoneInput = Object.assign(PhoneInputRoot, {
	Skeleton: InputSkeleton,
});

export { PHONE_COUNTRIES } from "./phoneCountryOptions";
