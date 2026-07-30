"use client";

import clsx from "clsx";
import type * as React from "react";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { ChoiceIndicatorMulti } from "@/components/ui/input/choice/ChoiceIndicators";
import { dropdownListClassName } from "@/components/ui/primitives/dropdownStyles";
import { Listbox } from "@/components/ui/primitives/Listbox";
import { Text } from "@/components/ui/primitives/Text";
import type {
	ComboboxMultiSelectIcon,
	ComboboxMultiSelectOption,
} from "./ComboboxMultiSelectInput.types";

type ComboboxMultiSelectListboxProps<T> = {
	activeIndex: number;
	allSelectedText?: React.ReactNode;
	disabled?: boolean;
	filteredOptionCount: number;
	iconSize: "sm" | "md" | "lg";
	listId: string;
	listRef: React.Ref<HTMLDivElement>;
	menuListClassName?: string;
	noResultsText?: React.ReactNode;
	onActiveIndexChange: React.Dispatch<React.SetStateAction<number>>;
	onToggleOption: (option: ComboboxMultiSelectOption<T>) => void;
	optionActiveClassName?: string;
	optionClassName?: string;
	options: readonly ComboboxMultiSelectOption<T>[];
};

export function renderComboboxMultiSelectIcon(
	icon?: ComboboxMultiSelectIcon,
	size: "sm" | "md" | "lg" = "md",
) {
	if (!icon) return null;
	if (typeof icon === "string") {
		return <Icon name={icon as IconName} size={size} />;
	}
	return icon;
}

export function ComboboxMultiSelectListbox<T>({
	activeIndex,
	allSelectedText,
	disabled,
	filteredOptionCount,
	iconSize,
	listId,
	listRef,
	menuListClassName,
	noResultsText,
	onActiveIndexChange,
	onToggleOption,
	optionActiveClassName,
	optionClassName,
	options,
}: ComboboxMultiSelectListboxProps<T>) {
	return (
		<Listbox
			options={options.map((option) => {
				const optionIcon = renderComboboxMultiSelectIcon(option.icon, iconSize);
				return {
					key: `${option.value}`,
					value: option.value,
					disabled: option.disabled,
					content: (
						<>
							{optionIcon ? (
								<span className="flex shrink-0 items-center">{optionIcon}</span>
							) : null}
							<span className="min-w-0 truncate">
								<span className="text-foreground/80">{option.label}</span>
								{option.symbol ? (
									<span className="text-foreground/50"> {option.symbol}</span>
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
			})}
			activeIndex={activeIndex}
			onActiveIndexChange={onActiveIndexChange}
			onSelect={(_, index) => {
				const option = options[index];
				if (!option) return;
				onToggleOption(option);
			}}
			emptyState={
				<Text variant="body">
					{filteredOptionCount === 0
						? (noResultsText ?? "No results")
						: (allSelectedText ?? "All options selected")}
				</Text>
			}
			listRef={listRef}
			listId={listId}
			optionIdPrefix={listId ? `${listId}-option` : undefined}
			listClassName={clsx(dropdownListClassName, menuListClassName)}
			optionClassName={clsx("[&>span]:w-full", optionClassName)}
			optionActiveClassName={optionActiveClassName}
			multiselectable
			disabled={disabled}
		/>
	);
}
