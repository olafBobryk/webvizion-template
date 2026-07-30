"use client";

import {
	ArrowSquareOut,
	DotsThreeVertical,
	PencilSimpleIcon,
	Trash,
	Warning,
} from "@phosphor-icons/react";
import clsx from "clsx";
import * as React from "react";
import type { ListboxOption } from "../Listbox";
import { DropdownCollection } from "./DropdownCollection";
import type {
	DropdownIcon,
	DropdownListboxProps,
	DropdownMenuEvent,
	DropdownMenuOption,
	DropdownMenuProps,
} from "./types";

const warnedMenuCycles = new WeakSet<object>();

function renderDropdownIcon(icon?: DropdownIcon) {
	return icon ?? null;
}

function warnMenuCycle(option: DropdownMenuOption) {
	if (process.env.NODE_ENV === "production" || warnedMenuCycles.has(option)) {
		return;
	}
	warnedMenuCycles.add(option);
	console.warn(
		"Dropdown.Menu omitted a recursive option that repeats an ancestor object.",
		option,
	);
}

function renderMenuOptionContent(option: DropdownMenuOption) {
	return (
		<>
			{option.leadingIcon ? (
				<span className="flex shrink-0 items-center">
					{renderDropdownIcon(option.leadingIcon)}
				</span>
			) : null}
			<span
				className={clsx(
					"min-w-0 flex-1",
					option.layout === "presentation"
						? "overflow-visible whitespace-normal"
						: "truncate text-sm",
					option.tone === "danger" || option.tone === "warning"
						? "text-inherit"
						: option.active
							? "text-foreground"
							: "text-foreground/80",
					option.textClassName,
				)}
			>
				{option.label}
			</span>
			{option.trailingIcon ? (
				<span className="flex shrink-0 items-center">
					{renderDropdownIcon(option.trailingIcon)}
				</span>
			) : null}
		</>
	);
}

function toMenuListboxOptions(
	options: DropdownMenuOption[],
	ancestors = new Set<DropdownMenuOption>(),
): ListboxOption<DropdownMenuOption>[] {
	const defaultOptions = options.filter(
		(option) => option.tone !== "warning" && option.tone !== "danger",
	);
	const warningOptions = options.filter((option) => option.tone === "warning");
	const dangerOptions = options.filter((option) => option.tone === "danger");
	const orderedOptions = [
		...defaultOptions,
		...warningOptions,
		...dangerOptions,
	];

	return orderedOptions.flatMap((option, index) => {
		if (ancestors.has(option)) {
			warnMenuCycle(option);
			return [];
		}
		const nextAncestors = new Set(ancestors);
		nextAncestors.add(option);
		const children = option.children?.length
			? toMenuListboxOptions(option.children, nextAncestors)
			: undefined;
		const startsSemanticGroup =
			index === defaultOptions.length && defaultOptions.length > 0;

		return [
			{
				children: children?.length ? children : undefined,
				className: option.className,
				content: renderMenuOptionContent(option),
				disabled: option.disabled,
				dividerAfter: option.dividerAfter,
				dividerBefore: startsSemanticGroup ? true : option.dividerBefore,
				href: option.href,
				key: option.id ?? index,
				layout: option.layout,
				selected: option.active,
				tone: option.tone,
				value: option,
			},
		];
	});
}

export function DropdownMenu({ options, ...props }: DropdownMenuProps) {
	const listboxOptions = React.useMemo(
		() => toMenuListboxOptions(options),
		[options],
	);

	return (
		<DropdownCollection
			{...props}
			ariaLabel={props.ariaLabel ?? "More options"}
			defaultOpenOnHover
			defaultTriggerSize="icon-sm"
			defaultTriggerVariant="ghost"
			onSelectOption={(option, event) => {
				option.value.onSelect?.(event);
				if (option.href && event.type === "keydown") {
					window.location.assign(option.href);
				}
			}}
			optionClassName={clsx("text-left", props.optionClassName)}
			optionRole="menuitem"
			options={listboxOptions}
			role="menu"
			triggerContent={
				props.triggerContent ?? <DotsThreeVertical aria-hidden size={15} />
			}
		/>
	);
}

export function DropdownListbox<T>({
	onSelect,
	options,
	...props
}: DropdownListboxProps<T>) {
	return (
		<DropdownCollection
			{...props}
			defaultOpenOnHover={false}
			defaultTriggerSize="md"
			defaultTriggerVariant="secondary"
			onSelectOption={(option, event) => onSelect(option.value, option, event)}
			options={options}
			role="listbox"
		/>
	);
}

type DropdownMenuFactoryHandler = (event: DropdownMenuEvent) => void;

export const dropdownMenuOptions = {
	delete({
		disabled,
		label = "Delete",
		onSelect,
	}: {
		disabled?: boolean;
		label?: React.ReactNode;
		onSelect?: DropdownMenuFactoryHandler;
	}): DropdownMenuOption {
		return {
			disabled,
			id: "delete",
			label,
			leadingIcon: <Trash aria-hidden size={12} />,
			onSelect,
			tone: "danger",
		};
	},
	edit({
		disabled,
		onSelect,
	}: {
		disabled?: boolean;
		onSelect: DropdownMenuFactoryHandler;
	}): DropdownMenuOption {
		return {
			disabled,
			id: "edit",
			label: "Edit",
			leadingIcon: <PencilSimpleIcon aria-hidden size={12} />,
			onSelect,
		};
	},
	open({
		href,
		leadingIcon,
	}: {
		href: string;
		leadingIcon?: DropdownIcon;
	}): DropdownMenuOption {
		return {
			href,
			id: "open",
			label: "Open",
			leadingIcon: leadingIcon ?? <ArrowSquareOut aria-hidden size={12} />,
		};
	},
	warning({
		disabled,
		label = "Warning",
		onSelect,
	}: {
		disabled?: boolean;
		label?: React.ReactNode;
		onSelect?: DropdownMenuFactoryHandler;
	}): DropdownMenuOption {
		return {
			disabled,
			id: "warning",
			label,
			leadingIcon: <Warning aria-hidden size={12} />,
			onSelect,
			tone: "warning",
		};
	},
};
