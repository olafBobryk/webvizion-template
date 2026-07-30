"use client";

import clsx from "clsx";
import * as React from "react";
import { Button } from "../Button";
import { Listbox, type ListboxOption } from "../Listbox";
import { DEFAULT_MENU_MIN_WIDTH } from "./constants";
import { DropdownRoot } from "./DropdownRoot";
import type { DropdownCompoundProps, DropdownMenuEvent } from "./types";
import { useDropdownCollectionController } from "./useDropdownCollectionController";

type DropdownCollectionProps<T> = DropdownCompoundProps & {
	defaultOpenOnHover: boolean;
	defaultTriggerSize: "icon-sm" | "md";
	defaultTriggerVariant: "ghost" | "secondary";
	emptyState?: React.ReactNode;
	onSelectOption: (option: ListboxOption<T>, event: DropdownMenuEvent) => void;
	optionRole?: "option" | "menuitem";
	options: ListboxOption<T>[];
	role: "listbox" | "menu";
};

export function DropdownCollection<T>({
	align = "start",
	ariaLabel,
	collisionPadding,
	defaultOpenOnHover,
	defaultTriggerSize,
	defaultTriggerVariant,
	disabled,
	emptyState,
	listClassName,
	menuClassName,
	menuContentClassName,
	menuMinWidth = DEFAULT_MENU_MIN_WIDTH,
	menuWidth,
	offset,
	onOpenChange,
	onSelectOption,
	openOnHover = defaultOpenOnHover,
	optionActiveClassName,
	optionClassName,
	optionRole = "option",
	options,
	pinOnClick = false,
	portalTargetId,
	positionStrategy,
	role,
	side = "bottom",
	triggerButtonProps,
	triggerContent,
}: DropdownCollectionProps<T>) {
	const listId = React.useId();
	const resolvedPositionStrategy =
		positionStrategy ??
		(options.some((option) => (option.children?.length ?? 0) > 0)
			? "fixed"
			: "absolute");
	const controller = useDropdownCollectionController({
		onOpenChange,
		options,
		rootId: listId,
	});
	const activeIndex = controller.getActiveIndex([]);

	const handleTriggerKeyDown = React.useCallback(
		(
			event: React.KeyboardEvent<HTMLElement>,
			trigger: {
				isOpen: boolean;
				openMenu: (options?: { focusMenu?: boolean; pin?: boolean }) => void;
			},
		) => {
			if (disabled) return;
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const direction = event.key === "ArrowDown" ? 1 : -1;
				if (!trigger.isOpen) {
					controller.prepareKeyboardOpen(direction);
					trigger.openMenu({ focusMenu: true });
					return;
				}
				controller.setActiveIndex([], (current) =>
					controller.getNextIndex([], current, direction),
				);
				return;
			}
			if ((event.key === "Enter" || event.key === " ") && !trigger.isOpen) {
				event.preventDefault();
				controller.prepareKeyboardOpen();
				trigger.openMenu({ focusMenu: true });
			}
		},
		[controller, disabled],
	);

	return (
		<DropdownRoot
			align={align}
			autoFocusMenu={false}
			collectionController={controller}
			collisionPadding={collisionPadding}
			disabled={disabled}
			menuClassName={clsx("max-w-[calc(100vw-32px)]", menuClassName)}
			menuMinWidth={menuMinWidth}
			menuWidth={menuWidth}
			offset={offset}
			onOpenChange={controller.setRootOpen}
			open={controller.isRootOpen}
			openOnHover={openOnHover}
			pinOnClick={pinOnClick}
			portalTargetId={portalTargetId}
			positionStrategy={resolvedPositionStrategy}
			renderTrigger={(trigger) => (
				<Button
					{...triggerButtonProps}
					aria-activedescendant={
						trigger.isOpen && activeIndex >= 0
							? `${listId}-option-${activeIndex}`
							: undefined
					}
					aria-controls={trigger.isOpen ? listId : undefined}
					aria-expanded={trigger.isOpen}
					aria-haspopup={role}
					aria-label={ariaLabel}
					disabled={disabled}
					onClick={(event) => {
						if (!trigger.isOpen) controller.preparePointerOpen();
						trigger.onRightClick(event);
					}}
					onKeyDown={(event) => handleTriggerKeyDown(event, trigger)}
					onMouseEnter={trigger.onRootMouseEnter}
					onMouseLeave={trigger.onRootMouseLeave}
					ref={trigger.ref}
					size={triggerButtonProps?.size ?? defaultTriggerSize}
					variant={triggerButtonProps?.variant ?? defaultTriggerVariant}
				>
					{triggerContent}
				</Button>
			)}
			renderMenu={({ close }) => (
				<Listbox
					activeIndex={activeIndex}
					ariaActivedescendant={
						activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
					}
					className={menuContentClassName}
					collectionController={controller}
					disabled={disabled}
					emptyState={emptyState}
					listClassName={listClassName}
					listId={listId}
					listTabIndex={0}
					onActiveIndexChange={(index) => controller.setActiveIndex([], index)}
					onRequestCloseRoot={close}
					onSelect={(option, _index, event) => {
						if (disabled || option.disabled) {
							event.preventDefault();
							return;
						}
						onSelectOption(option, event);
						close();
					}}
					optionActiveClassName={optionActiveClassName}
					optionClassName={optionClassName}
					optionIdPrefix={`${listId}-option`}
					optionRole={optionRole}
					options={options}
					portalTargetId={portalTargetId}
					role={role}
				/>
			)}
			side={side}
		/>
	);
}
