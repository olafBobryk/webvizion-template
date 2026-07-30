// components/ui/primitives/Listbox.tsx
"use client";

import { CaretRight } from "@phosphor-icons/react";
import clsx from "clsx";
import * as React from "react";
import { Button } from "@/components/ui/primitives/Button";
import { DropdownSurface } from "@/components/ui/primitives/dropdown/DropdownSurface";
import {
	type DropdownCollectionController,
	useDropdownCollectionController,
} from "@/components/ui/primitives/dropdown/useDropdownCollectionController";
import {
	type DropdownOptionTone,
	dropdownEmptyStateClassName,
	dropdownListClassName,
	dropdownListWrapperClassName,
	getDropdownOptionClassName,
} from "@/components/ui/primitives/dropdownStyles";
import { Text } from "@/components/ui/primitives/Text";

const interactiveDescendantSelector =
	'input,textarea,select,button,[role="button"]';
const cascadeTriggerSelector = "[data-dropdown-cascade-trigger]";

export type ListboxOption<T> = {
	key?: React.Key;
	value: T;
	content: React.ReactNode;
	href?: string;
	disabled?: boolean;
	dividerAfter?: boolean;
	dividerBefore?: boolean;
	layout?: "default" | "presentation";
	tone?: DropdownOptionTone;
	selected?: boolean;
	className?: string;
	activeClassName?: string;
	selectedClassName?: string;
	disabledClassName?: string;
	unwrapped?: boolean;
	children?: ListboxOption<T>[];
};

type ListboxProps<T> = {
	options: ListboxOption<T>[];
	activeIndex?: number;
	onActiveIndexChange?: (index: number) => void;
	onSelect?: (
		option: ListboxOption<T>,
		index: number,
		event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
	) => void;
	emptyState?: React.ReactNode;
	listRef?: React.Ref<HTMLDivElement>;
	listId?: string;
	optionIdPrefix?: string;
	listTabIndex?: number;
	ariaActivedescendant?: string;
	onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
	onFocus?: React.FocusEventHandler<HTMLDivElement>;
	className?: string;
	listClassName?: string;
	optionClassName?: string;
	optionActiveClassName?: string;
	optionSelectedClassName?: string;
	optionDisabledClassName?: string;
	role?: "listbox" | "menu";
	optionRole?: "option" | "menuitem";
	multiselectable?: boolean;
	disabled?: boolean;
	collectionController?: DropdownCollectionController;
	onRequestCloseRoot?: (options?: { restoreFocus?: boolean }) => void;
	portalTargetId?: string;
};

type ListboxLevelProps<T> = Omit<
	ListboxProps<T>,
	"collectionController" | "portalTargetId"
> & {
	controller: DropdownCollectionController;
	levelPath: number[];
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (!ref) return;
	if (typeof ref === "function") {
		ref(value);
		return;
	}
	ref.current = value;
}

function isTowardChildrenKey(key: string, direction: "ltr" | "rtl") {
	return key === (direction === "rtl" ? "ArrowLeft" : "ArrowRight");
}

function isTowardParentKey(key: string, direction: "ltr" | "rtl") {
	return key === (direction === "rtl" ? "ArrowRight" : "ArrowLeft");
}

function ListboxLevel<T>({
	options,
	activeIndex,
	onActiveIndexChange,
	onSelect,
	emptyState,
	listRef,
	listId,
	optionIdPrefix,
	listTabIndex,
	ariaActivedescendant,
	onKeyDown,
	onFocus,
	className,
	listClassName,
	optionClassName,
	optionActiveClassName,
	optionSelectedClassName,
	optionDisabledClassName,
	role = "listbox",
	optionRole = "option",
	multiselectable,
	disabled,
	controller,
	levelPath,
	onRequestCloseRoot,
}: ListboxLevelProps<T>) {
	const resolvedEmpty = emptyState ?? <Text variant="body">No results</Text>;
	const pointerOwnsActiveIndexRef = React.useRef(false);
	const [direction, setDirection] = React.useState<"ltr" | "rtl">("ltr");
	const controllerActiveIndex = controller.getActiveIndex(levelPath);
	const resolvedActiveIndex = activeIndex ?? controllerActiveIndex;
	const hasRecursiveOptions = options.some(
		(_option, index) => controller.getChildren(levelPath, index).length > 0,
	);
	const resolvedListId =
		levelPath.length === 0
			? (listId ??
				(hasRecursiveOptions ? controller.getListId(levelPath) : undefined))
			: controller.getListId(levelPath);
	const resolvedOptionIdPrefix =
		levelPath.length === 0
			? (optionIdPrefix ??
				(hasRecursiveOptions
					? `${controller.getListId(levelPath)}-option`
					: undefined))
			: `${controller.getListId(levelPath)}-option`;
	const resolvedAriaActivedescendant =
		ariaActivedescendant ??
		((levelPath.length > 0 || hasRecursiveOptions) && resolvedActiveIndex >= 0
			? controller.getOptionId(levelPath, resolvedActiveIndex)
			: undefined);
	const resolvedListTabIndex =
		listTabIndex ??
		(levelPath.length > 0 || hasRecursiveOptions ? 0 : undefined);

	const setResolvedActiveIndex = React.useCallback(
		(update: number | ((current: number) => number)) => {
			const nextIndex =
				typeof update === "function" ? update(resolvedActiveIndex) : update;
			controller.setActiveIndex(levelPath, nextIndex);
			onActiveIndexChange?.(nextIndex);
		},
		[controller, levelPath, onActiveIndexChange, resolvedActiveIndex],
	);

	const setListNode = React.useCallback(
		(node: HTMLDivElement | null) => {
			controller.registerList(levelPath, node);
			assignRef(listRef, node);
			if (node) {
				setDirection(
					window.getComputedStyle(node).direction === "rtl" ? "rtl" : "ltr",
				);
			}
		},
		[controller, levelPath, listRef],
	);

	const handleOptionMouseMove = (
		index: number,
		isDisabled: boolean,
		hasChildren: boolean,
	) => {
		if (isDisabled) return;
		pointerOwnsActiveIndexRef.current = true;
		setResolvedActiveIndex(index);
		if (hasChildren) {
			controller.openChildren(levelPath, index);
		} else {
			controller.closeChildrenFrom(levelPath);
		}
	};

	const handleListMouseLeave = () => {
		if (controller.openPath.length > levelPath.length) {
			controller.scheduleCloseChildrenFrom(levelPath);
			return;
		}
		if (!pointerOwnsActiveIndexRef.current) return;
		pointerOwnsActiveIndexRef.current = false;
		setResolvedActiveIndex(-1);
	};

	const selectActiveOption = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const option = options[resolvedActiveIndex];
		if (!option || option.disabled || disabled) return;
		event.preventDefault();
		onSelect?.(option, resolvedActiveIndex, event);
	};

	const handleListKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
		event,
	) => {
		pointerOwnsActiveIndexRef.current = false;
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const step = event.key === "ArrowDown" ? 1 : -1;
			setResolvedActiveIndex((current) =>
				controller.getNextIndex(levelPath, current, step),
			);
		} else if (event.key === "Home" || event.key === "End") {
			event.preventDefault();
			setResolvedActiveIndex(
				controller.getBoundaryIndex(
					levelPath,
					event.key === "Home" ? "first" : "last",
				),
			);
		} else if (isTowardChildrenKey(event.key, direction)) {
			const option = options[resolvedActiveIndex];
			if (
				option &&
				!option.disabled &&
				controller.getChildren(levelPath, resolvedActiveIndex).length > 0
			) {
				event.preventDefault();
				controller.openChildren(levelPath, resolvedActiveIndex, {
					focus: true,
				});
			}
		} else if (
			isTowardParentKey(event.key, direction) &&
			levelPath.length > 0
		) {
			event.preventDefault();
			controller.closeDeepest({ focusParent: true });
		} else if (event.key === "Escape" && levelPath.length > 0) {
			event.preventDefault();
			event.stopPropagation();
			controller.closeDeepest({ focusParent: true });
		} else if (event.key === "Escape" && onRequestCloseRoot) {
			event.preventDefault();
			event.stopPropagation();
			onRequestCloseRoot({ restoreFocus: true });
		} else if (event.key === "Enter" || event.key === " ") {
			selectActiveOption(event);
		}
		onKeyDown?.(event);
	};

	const listContent =
		options.length === 0 ? (
			<div className={dropdownEmptyStateClassName}>{resolvedEmpty}</div>
		) : (
			<div className={clsx(dropdownListClassName, listClassName)}>
				{options.map((option, index) => {
					const isActive = resolvedActiveIndex === index;
					const isSelected = Boolean(option.selected);
					const isDisabled = Boolean(disabled || option.disabled);
					const children = controller.getChildren(levelPath, index);
					const hasChildren = children.length > 0;
					const isChildOpen = controller.isChildOpen(levelPath, index);
					const optionId = resolvedOptionIdPrefix
						? `${resolvedOptionIdPrefix}-${index}`
						: undefined;
					const childListId = hasChildren
						? controller.getListId([...levelPath, index])
						: undefined;
					const resolvedOptionClassName = [optionClassName, option.className]
						.filter(Boolean)
						.join(" ");
					const resolvedActiveClassName = [
						optionActiveClassName,
						option.activeClassName,
					]
						.filter(Boolean)
						.join(" ");
					const resolvedSelectedClassName = [
						optionSelectedClassName,
						option.selectedClassName,
					]
						.filter(Boolean)
						.join(" ");
					const resolvedDisabledClassName = [
						optionDisabledClassName,
						option.disabledClassName,
					]
						.filter(Boolean)
						.join(" ");

					const optionClasses = getDropdownOptionClassName({
						active: isActive,
						selected: isSelected,
						disabled: isDisabled,
						dividerAfter: option.dividerAfter,
						dividerBefore: option.dividerBefore,
						layout: option.layout,
						tone: option.tone,
						className: resolvedOptionClassName,
						activeClassName: resolvedActiveClassName,
						selectedClassName: resolvedSelectedClassName,
						disabledClassName: resolvedDisabledClassName,
					});
					const content = hasChildren ? (
						<>
							{option.content}
							<span
								aria-hidden
								className="-mr-1 ml-auto flex shrink-0 items-center px-1 rtl:mr-auto rtl:-ml-1"
								data-dropdown-cascade-trigger
							>
								<CaretRight className="rtl:rotate-180" size={14} />
							</span>
						</>
					) : (
						option.content
					);
					const openChildFromChevron = (target: EventTarget | null) => {
						if (!(target instanceof Element)) return false;
						if (!target.closest(cascadeTriggerSelector)) return false;
						controller.openChildren(levelPath, index, { focus: false });
						return true;
					};
					const sharedAriaProps = hasChildren
						? {
								"aria-controls": childListId,
								"aria-expanded": isChildOpen,
								"aria-haspopup":
									role === "menu" ? ("menu" as const) : ("listbox" as const),
							}
						: {};

					if (option.unwrapped) {
						const optionKey = String(option.key ?? index);
						const unwrappedOptionProps = {
							...sharedAriaProps,
							key: optionKey,
							"data-option-index": index,
							id: optionId,
							"aria-disabled": isDisabled ? true : undefined,
							className: optionClasses,
							ref: (node: HTMLDivElement | null) =>
								controller.registerAnchor(levelPath, index, node),
							onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
								const target = event.target as HTMLElement;
								if (target.closest(interactiveDescendantSelector)) return;
								event.preventDefault();
							},
							onMouseMove: () =>
								handleOptionMouseMove(index, isDisabled, hasChildren),
							onMouseLeave: () => {
								if (hasChildren)
									controller.scheduleCloseChildrenFrom(levelPath);
							},
							onClick: (event: React.MouseEvent<HTMLDivElement>) => {
								if (isDisabled) {
									event.preventDefault();
									return;
								}
								if (openChildFromChevron(event.target)) {
									event.preventDefault();
									return;
								}
								const target = event.target as HTMLElement;
								if (target.closest(interactiveDescendantSelector)) return;
								onSelect?.(option, index, event);
							},
							onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
								if (event.key !== "Enter" && event.key !== " ") return;
								if (isDisabled) {
									event.preventDefault();
									return;
								}
								event.preventDefault();
								onSelect?.(option, index, event);
							},
						};

						if (optionRole === "menuitem") {
							return (
								<div {...unwrappedOptionProps} role="menuitem" tabIndex={-1}>
									{content}
								</div>
							);
						}

						return (
							<div
								{...unwrappedOptionProps}
								role="option"
								aria-selected={isSelected}
								tabIndex={-1}
							>
								{content}
							</div>
						);
					}

					return (
						<Button
							{...sharedAriaProps}
							key={option.key ?? `${index}`}
							href={option.href}
							data-option-index={index}
							id={optionId}
							role={optionRole}
							aria-selected={optionRole === "option" ? isSelected : undefined}
							aria-disabled={isDisabled ? true : undefined}
							tabIndex={-1}
							disabled={optionRole === "menuitem" ? undefined : isDisabled}
							variant="ghost"
							align="left"
							size="md"
							className={optionClasses}
							ref={(node) => controller.registerAnchor(levelPath, index, node)}
							onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
								event.preventDefault();
							}}
							onMouseMove={() =>
								handleOptionMouseMove(index, isDisabled, hasChildren)
							}
							onMouseLeave={() => {
								if (hasChildren)
									controller.scheduleCloseChildrenFrom(levelPath);
							}}
							onClick={(event: React.MouseEvent<HTMLElement>) => {
								if (isDisabled) {
									event.preventDefault();
									return;
								}
								if (openChildFromChevron(event.target)) {
									event.preventDefault();
									event.stopPropagation();
									return;
								}
								onSelect?.(option, index, event);
							}}
						>
							{content}
						</Button>
					);
				})}
			</div>
		);

	if (role === "menu") {
		return (
			<div
				ref={setListNode}
				id={resolvedListId}
				role="menu"
				tabIndex={resolvedListTabIndex}
				aria-activedescendant={resolvedAriaActivedescendant}
				onKeyDown={handleListKeyDown}
				onMouseEnter={controller.cancelPointerClose}
				onMouseLeave={handleListMouseLeave}
				onFocus={onFocus}
				className={clsx(dropdownListWrapperClassName, className)}
			>
				{listContent}
			</div>
		);
	}

	return (
		<div
			ref={setListNode}
			id={resolvedListId}
			role="listbox"
			tabIndex={resolvedListTabIndex}
			aria-activedescendant={resolvedAriaActivedescendant}
			aria-multiselectable={multiselectable ? true : undefined}
			onKeyDown={handleListKeyDown}
			onMouseEnter={controller.cancelPointerClose}
			onMouseLeave={handleListMouseLeave}
			onFocus={onFocus}
			className={clsx(dropdownListWrapperClassName, className)}
		>
			{listContent}
		</div>
	);
}

export function Listbox<T>(props: ListboxProps<T>) {
	const generatedListId = React.useId();
	const ownController = useDropdownCollectionController({
		initiallyOpen: true,
		options: props.options,
		rootId: props.listId ?? generatedListId,
	});
	const controller = props.collectionController ?? ownController;
	const isStandalone = props.collectionController === undefined;
	const rootListRef = React.useRef<HTMLDivElement | null>(null);
	const [direction, setDirection] = React.useState<"ltr" | "rtl">("ltr");
	const resolvedListRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			rootListRef.current = node;
			assignRef(props.listRef, node);
			if (node) {
				setDirection(
					window.getComputedStyle(node).direction === "rtl" ? "rtl" : "ltr",
				);
			}
		},
		[props.listRef],
	);

	React.useEffect(() => {
		if (!isStandalone || controller.openPath.length === 0) return;
		const closeChildrenOnOutsidePointer = (event: MouseEvent) => {
			if (!controller.containsTarget(event.target as Node)) {
				controller.closeChildrenFrom([]);
			}
		};
		const closeChildrenOnTab = (event: KeyboardEvent) => {
			if (event.key === "Tab") controller.closeChildrenFrom([]);
		};
		document.addEventListener("mousedown", closeChildrenOnOutsidePointer);
		document.addEventListener("keydown", closeChildrenOnTab);
		return () => {
			document.removeEventListener("mousedown", closeChildrenOnOutsidePointer);
			document.removeEventListener("keydown", closeChildrenOnTab);
		};
	}, [controller, isStandalone]);

	return (
		<>
			<ListboxLevel
				{...props}
				controller={controller}
				levelPath={[]}
				listRef={resolvedListRef}
			/>
			{controller.openPath.map((parentIndex, depth) => {
				const parentPath = controller.openPath.slice(0, depth);
				const childPath = controller.openPath.slice(0, depth + 1);
				const childOptions = controller.getOptionsAtPath(
					childPath,
				) as ListboxOption<T>[];
				if (childOptions.length === 0) return null;
				return (
					<DropdownSurface
						align="start"
						anchorRef={controller.getAnchorRef(parentPath, parentIndex)}
						className="max-w-[calc(100vw-32px)]"
						key={childPath.join("-")}
						offset={4}
						padding="none"
						portalTargetId={props.portalTargetId}
						positionStrategy="fixed"
						ref={(node) => controller.registerSurface(childPath, node)}
						role="presentation"
						shadow="lg"
						side={direction === "rtl" ? "left" : "right"}
						width="auto"
						zIndex={110 + depth}
						onMouseEnter={() => {
							controller.cancelPointerClose();
							controller.cancelRootHoverClose();
						}}
						onMouseLeave={() => {
							if (!controller.scheduleRootHoverClose()) {
								controller.scheduleCloseCascade();
							}
						}}
					>
						<ListboxLevel
							{...props}
							activeIndex={undefined}
							ariaActivedescendant={undefined}
							controller={controller}
							levelPath={childPath}
							listId={controller.getListId(childPath)}
							listRef={undefined}
							onActiveIndexChange={undefined}
							onFocus={undefined}
							onKeyDown={undefined}
							optionIdPrefix={`${controller.getListId(childPath)}-option`}
							options={childOptions}
						/>
					</DropdownSurface>
				);
			})}
		</>
	);
}
