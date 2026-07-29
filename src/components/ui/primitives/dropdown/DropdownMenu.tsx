"use client";

import {
	ArrowSquareOut,
	DotsThreeVertical,
	PencilSimpleIcon,
	Trash,
} from "@phosphor-icons/react";
import clsx from "clsx";
import * as React from "react";
import { Button } from "../Button";
import { Listbox } from "../Listbox";
import { DEFAULT_MENU_MIN_WIDTH } from "./constants";
import { DropdownRoot } from "./DropdownRoot";
import type {
	DropdownIcon,
	DropdownListboxProps,
	DropdownMenuEvent,
	DropdownMenuOption,
	DropdownMenuProps,
} from "./types";
import { useDropdownListNavigation } from "./useDropdownListNavigation";

function renderDropdownIcon(icon?: DropdownIcon) {
	return icon ?? null;
}

function normalizeMenuOptions(options: DropdownMenuOption[]) {
	const defaultOptions = options.filter((option) => option.tone !== "danger");
	const dangerOptions = options.filter((option) => option.tone === "danger");
	return [
		...defaultOptions,
		...dangerOptions.map((option, index) => ({
			...option,
			dividerBefore:
				index === 0 && defaultOptions.length > 0 ? true : option.dividerBefore,
		})),
	];
}

export function DropdownMenu({
	align = "start",
	ariaLabel = "More options",
	collisionPadding,
	disabled,
	listClassName,
	menuClassName,
	menuContentClassName,
	menuMinWidth = DEFAULT_MENU_MIN_WIDTH,
	menuWidth,
	offset,
	onOpenChange,
	openOnHover = true,
	optionActiveClassName,
	optionClassName,
	options,
	pinOnClick = false,
	portalTargetId,
	positionStrategy = "absolute",
	side = "bottom",
	triggerButtonProps,
	triggerContent,
}: DropdownMenuProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const listId = React.useId();
	const normalizedOptions = React.useMemo(
		() => normalizeMenuOptions(options),
		[options],
	);
	const navigationOptions = React.useMemo(
		() =>
			normalizedOptions.map((option) => ({
				disabled: option.disabled,
				selected: option.active,
			})),
		[normalizedOptions],
	);
	const navigation = useDropdownListNavigation({
		isOpen,
		options: navigationOptions,
	});
	const handleOpenChange = React.useCallback(
		(next: boolean) => {
			setIsOpen(next);
			onOpenChange?.(next);
		},
		[onOpenChange],
	);

	return (
		<DropdownRoot
			align={align}
			autoFocusMenu={false}
			collisionPadding={collisionPadding}
			disabled={disabled}
			menuClassName={clsx("max-w-[calc(100vw-32px)]", menuClassName)}
			menuMinWidth={menuMinWidth}
			menuWidth={menuWidth}
			offset={offset}
			onOpenChange={handleOpenChange}
			openOnHover={openOnHover}
			pinOnClick={pinOnClick}
			portalTargetId={portalTargetId}
			positionStrategy={positionStrategy}
			renderTrigger={(trigger) => (
				<Button
					{...triggerButtonProps}
					align={triggerButtonProps?.align ?? "center"}
					aria-activedescendant={
						trigger.isOpen && navigation.activeIndex >= 0
							? `${listId}-option-${navigation.activeIndex}`
							: undefined
					}
					aria-controls={trigger.isOpen ? listId : undefined}
					aria-expanded={trigger.isOpen}
					aria-haspopup="menu"
					aria-label={ariaLabel}
					disabled={disabled}
					onClick={(event) => {
						if (!trigger.isOpen) navigation.preparePointerOpen();
						trigger.onRightClick(event);
					}}
					onKeyDown={(event) => {
						if (disabled) return;
						if (event.key === "ArrowDown" || event.key === "ArrowUp") {
							event.preventDefault();
							const direction = event.key === "ArrowDown" ? 1 : -1;
							if (!trigger.isOpen) {
								navigation.prepareKeyboardOpen(direction);
								trigger.openMenu({ focusMenu: true });
								return;
							}
							navigation.setActiveIndex((current) =>
								navigation.getNextIndex(current, direction),
							);
							return;
						}
						if (
							(event.key === "Enter" || event.key === " ") &&
							!trigger.isOpen
						) {
							event.preventDefault();
							navigation.prepareKeyboardOpen();
							trigger.openMenu({ focusMenu: true });
						}
					}}
					onMouseEnter={trigger.onRootMouseEnter}
					onMouseLeave={trigger.onRootMouseLeave}
					ref={trigger.ref}
					size={triggerButtonProps?.size ?? "icon-sm"}
					variant={triggerButtonProps?.variant ?? "ghost"}
				>
					{triggerContent ?? <DotsThreeVertical aria-hidden size={15} />}
				</Button>
			)}
			renderMenu={({ close }) => (
				<Listbox
					activeIndex={navigation.activeIndex}
					ariaActivedescendant={
						navigation.activeIndex >= 0
							? `${listId}-option-${navigation.activeIndex}`
							: undefined
					}
					className={menuContentClassName}
					disabled={disabled}
					listClassName={listClassName}
					listId={listId}
					listRef={navigation.listRef}
					listTabIndex={0}
					onActiveIndexChange={navigation.setActiveIndex}
					onKeyDown={(event) => {
						if (event.key === "ArrowDown" || event.key === "ArrowUp") {
							event.preventDefault();
							const direction = event.key === "ArrowDown" ? 1 : -1;
							navigation.setActiveIndex((current) =>
								navigation.getNextIndex(current, direction),
							);
							return;
						}
						if (event.key === "Home" || event.key === "End") {
							event.preventDefault();
							navigation.setActiveIndex(
								navigation.getBoundaryIndex(
									event.key === "Home" ? "first" : "last",
								),
							);
							return;
						}
						if (event.key !== "Enter" && event.key !== " ") return;
						const option = normalizedOptions[navigation.activeIndex];
						if (!option || option.disabled) return;
						event.preventDefault();
						option.onSelect?.(event);
						if (option.href) window.location.assign(option.href);
						close();
					}}
					onSelect={(option, _index, event) => {
						if (disabled || option.value.disabled) {
							event.preventDefault();
							return;
						}
						option.value.onSelect?.(event);
						close();
					}}
					optionActiveClassName={optionActiveClassName}
					optionClassName={clsx("text-left", optionClassName)}
					optionIdPrefix={`${listId}-option`}
					optionRole="menuitem"
					options={normalizedOptions.map((option, index) => ({
						className: option.className,
						content: (
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
										option.tone === "danger"
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
						),
						disabled: option.disabled,
						dividerAfter: option.dividerAfter,
						dividerBefore: option.dividerBefore,
						href: option.href,
						key: option.id ?? index,
						layout: option.layout,
						selected: option.active,
						tone: option.tone,
						value: option,
					}))}
					role="menu"
				/>
			)}
			side={side}
		/>
	);
}

export function DropdownListbox<T>({
	align = "start",
	ariaLabel,
	collisionPadding,
	disabled,
	emptyState,
	listClassName,
	menuClassName,
	menuContentClassName,
	menuMinWidth = DEFAULT_MENU_MIN_WIDTH,
	menuWidth,
	offset,
	onOpenChange,
	onSelect,
	openOnHover = false,
	optionActiveClassName,
	optionClassName,
	options,
	pinOnClick = false,
	portalTargetId,
	positionStrategy = "absolute",
	side = "bottom",
	triggerButtonProps,
	triggerContent,
}: DropdownListboxProps<T>) {
	const [isOpen, setIsOpen] = React.useState(false);
	const listId = React.useId();
	const navigation = useDropdownListNavigation({ isOpen, options });
	const handleOpenChange = React.useCallback(
		(next: boolean) => {
			setIsOpen(next);
			onOpenChange?.(next);
		},
		[onOpenChange],
	);

	return (
		<DropdownRoot
			align={align}
			autoFocusMenu={false}
			collisionPadding={collisionPadding}
			disabled={disabled}
			menuClassName={clsx("max-w-[calc(100vw-32px)]", menuClassName)}
			menuMinWidth={menuMinWidth}
			menuWidth={menuWidth}
			offset={offset}
			onOpenChange={handleOpenChange}
			openOnHover={openOnHover}
			pinOnClick={pinOnClick}
			portalTargetId={portalTargetId}
			positionStrategy={positionStrategy}
			renderTrigger={(trigger) => (
				<Button
					{...triggerButtonProps}
					aria-activedescendant={
						trigger.isOpen && navigation.activeIndex >= 0
							? `${listId}-option-${navigation.activeIndex}`
							: undefined
					}
					aria-controls={trigger.isOpen ? listId : undefined}
					aria-expanded={trigger.isOpen}
					aria-haspopup="listbox"
					aria-label={ariaLabel}
					disabled={disabled}
					onClick={(event) => {
						if (!trigger.isOpen) navigation.preparePointerOpen();
						trigger.onRightClick(event);
					}}
					onKeyDown={(event) => {
						if (disabled) return;
						if (event.key === "ArrowDown" || event.key === "ArrowUp") {
							event.preventDefault();
							const direction = event.key === "ArrowDown" ? 1 : -1;
							if (!trigger.isOpen) {
								navigation.prepareKeyboardOpen(direction);
								trigger.openMenu({ focusMenu: true });
								return;
							}
							navigation.setActiveIndex((current) =>
								navigation.getNextIndex(current, direction),
							);
							return;
						}
						if (
							(event.key === "Enter" || event.key === " ") &&
							!trigger.isOpen
						) {
							event.preventDefault();
							navigation.prepareKeyboardOpen();
							trigger.openMenu({ focusMenu: true });
						}
					}}
					onMouseEnter={trigger.onRootMouseEnter}
					onMouseLeave={trigger.onRootMouseLeave}
					ref={trigger.ref}
					size={triggerButtonProps?.size ?? "md"}
					variant={triggerButtonProps?.variant ?? "secondary"}
				>
					{triggerContent}
				</Button>
			)}
			renderMenu={({ close }) => (
				<Listbox
					activeIndex={navigation.activeIndex}
					ariaActivedescendant={
						navigation.activeIndex >= 0
							? `${listId}-option-${navigation.activeIndex}`
							: undefined
					}
					className={menuContentClassName}
					disabled={disabled}
					emptyState={emptyState}
					listClassName={listClassName}
					listId={listId}
					listRef={navigation.listRef}
					listTabIndex={0}
					onActiveIndexChange={navigation.setActiveIndex}
					onKeyDown={(event) => {
						if (event.key === "ArrowDown" || event.key === "ArrowUp") {
							event.preventDefault();
							const direction = event.key === "ArrowDown" ? 1 : -1;
							navigation.setActiveIndex((current) =>
								navigation.getNextIndex(current, direction),
							);
							return;
						}
						if (event.key === "Home" || event.key === "End") {
							event.preventDefault();
							navigation.setActiveIndex(
								navigation.getBoundaryIndex(
									event.key === "Home" ? "first" : "last",
								),
							);
							return;
						}
						if (event.key !== "Enter" && event.key !== " ") return;
						const option = options[navigation.activeIndex];
						if (!option || option.disabled || disabled) return;
						event.preventDefault();
						onSelect(option.value, option, event);
						close();
					}}
					onSelect={(option, _index, event) => {
						if (disabled || option.disabled) {
							event.preventDefault();
							return;
						}
						onSelect(option.value, option, event);
						close();
					}}
					optionActiveClassName={optionActiveClassName}
					optionClassName={optionClassName}
					optionIdPrefix={`${listId}-option`}
					options={options}
				/>
			)}
			side={side}
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
};
