"use client";

import type { CountryCode } from "libphonenumber-js";
import type * as React from "react";
import { dropdownListClassName } from "@/components/ui/primitives/dropdownStyles";
import { Listbox } from "@/components/ui/primitives/Listbox";
import { Text } from "@/components/ui/primitives/Text";
import type { InternalCountryOption } from "./phoneCountryOptions";

type PhoneCountryListboxProps = {
	activeIndex: number;
	countries: readonly InternalCountryOption[];
	disabled?: boolean;
	listId: string;
	listRef: React.Ref<HTMLDivElement>;
	onActiveIndexChange: React.Dispatch<React.SetStateAction<number>>;
	onSelect: (country: InternalCountryOption) => void;
	optionClassName?: string;
	optionActiveClassName?: string;
	optionSelectedClassName?: string;
	selectedCountryCode?: CountryCode;
};

export function PhoneCountryListbox({
	activeIndex,
	countries,
	disabled,
	listId,
	listRef,
	onActiveIndexChange,
	onSelect,
	optionClassName,
	optionActiveClassName,
	optionSelectedClassName,
	selectedCountryCode,
}: PhoneCountryListboxProps) {
	return (
		<Listbox
			options={countries.map((country) => ({
				key: country.code,
				value: country.code,
				selected: country.code === selectedCountryCode,
				content: (
					<>
						<span aria-hidden="true" className="text-[18px] leading-none">
							{country.flag}
						</span>
						<Text as="span" variant="body" className="min-w-0 truncate">
							<span className="text-foreground">{country.name}</span>
							<span className="text-foreground/50"> {country.dial_code}</span>
						</Text>
					</>
				),
			}))}
			activeIndex={activeIndex}
			onActiveIndexChange={onActiveIndexChange}
			onSelect={(_, index) => {
				const country = countries[index];
				if (!country) return;
				onSelect(country);
			}}
			emptyState={<Text variant="body">No results</Text>}
			listRef={listRef}
			listId={listId}
			optionIdPrefix={listId ? `${listId}-option` : undefined}
			listClassName={dropdownListClassName}
			optionClassName={optionClassName}
			optionActiveClassName={optionActiveClassName}
			optionSelectedClassName={optionSelectedClassName}
			disabled={disabled}
		/>
	);
}
