"use client";

import type { ReactNode } from "react";
import { SelectInput, type SelectInputProps } from "@/components/ui/input";

export type EntitySelectorProps<TEntity, TValue> = Omit<
	SelectInputProps<TValue>,
	"dropdownPositionStrategy" | "options" | "showSelectedIcon"
> & {
	getOptionLabel: (entity: TEntity) => string;
	getOptionSearchText: (entity: TEntity) => string;
	getOptionValue: (entity: TEntity) => TValue;
	items: readonly TEntity[];
	renderOption: (entity: TEntity) => ReactNode;
};

function EntitySelectorRoot<TEntity, TValue>({
	getOptionLabel,
	getOptionSearchText,
	getOptionValue,
	items,
	renderOption,
	...inputProps
}: EntitySelectorProps<TEntity, TValue>) {
	return (
		<SelectInput
			{...inputProps}
			dropdownPositionStrategy="fixed"
			options={items.map((entity) => ({
				dropdownContent: renderOption(entity),
				label: getOptionLabel(entity),
				searchText: getOptionSearchText(entity),
				value: getOptionValue(entity),
			}))}
		/>
	);
}

export const EntitySelector = Object.assign(EntitySelectorRoot, {
	Skeleton: SelectInput.Skeleton,
});
