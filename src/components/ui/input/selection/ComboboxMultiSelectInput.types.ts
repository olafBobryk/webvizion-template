import type * as React from "react";
import type { IconName } from "@/components/ui/icons/Icon";
import type { InputFrameSize } from "@/components/ui/primitives/InputFrame";

export type ComboboxMultiSelectIcon =
	| IconName
	| Exclude<React.ReactNode, string | number>;

export type ComboboxMultiSelectOption<T> = {
	value: T;
	label: string;
	symbol?: string;
	icon?: ComboboxMultiSelectIcon;
	searchText?: string;
	disabled?: boolean;
};

export type ComboboxMultiSelectInputProps<T> = {
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
	leadingIcon?: ComboboxMultiSelectIcon;
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
