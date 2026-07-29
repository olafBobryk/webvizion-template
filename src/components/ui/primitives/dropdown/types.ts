import type * as React from "react";
import type { ButtonBaseProps } from "../Button";
import type { ListboxOption } from "../Listbox";
import type { PanelProps } from "../Panel";

export type DropdownTriggerRenderProps = {
	ref: React.Ref<HTMLElement>;
	isOpen: boolean;
	isPinned: boolean;
	className?: string;

	// root mouse events (for hover open/close)
	onRootMouseEnter: () => void;
	onRootMouseLeave: () => void;

	// click handlers (already wired to pin/open behavior)
	onLeftClick?: (e: React.MouseEvent) => void;
	onRightClick: (e: React.MouseEvent) => void;

	// programmatic controls
	openMenu: (options?: { focusMenu?: boolean; pin?: boolean }) => void;
	closeMenu: (options?: { restoreFocus?: boolean }) => void;

	// built-in chevron icon you can use anywhere in the trigger
	chevronIcon: React.ReactNode;
};

export type DropdownProps = {
	renderTrigger: (props: DropdownTriggerRenderProps) => React.ReactNode;
	renderMenu: (helpers: {
		close: (options?: { restoreFocus?: boolean }) => void;
	}) => React.ReactNode;
	/**
	 * Optional handler for the "left" part of the trigger (e.g. your label).
	 * Behavior is the same as before: clicking left side pins + opens, then calls onLeftClick.
	 */
	onLeftClick?: () => void;
	className?: string;
	collisionPadding?: number;
	menuClassName?: string;
	portalTargetId?: string;
	menuWidth?: number | "trigger";
	menuMinWidth?: number;
	align?: "start" | "end";
	side?: "top" | "bottom";
	offset?: number;
	positionStrategy?: "fixed" | "absolute";
	disabled?: boolean;
	open?: boolean;
	openOnHover?: boolean;
	pinOnClick?: boolean;
	disableWhenReducedMotion?: boolean;
	autoFocusMenu?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export type DropdownSide = NonNullable<DropdownProps["side"]>;
export type DropdownPositionStrategy = "absolute" | "fixed";
type DropdownAnchorRef = { current: Element | null };

export type DropdownSurfaceProps = PanelProps<"div"> & {
	align?: "start" | "end";
	anchorRef?: DropdownAnchorRef;
	collisionPadding?: number;
	matchAnchorWidth?: boolean;
	offset?: number;
	portalTargetId?: string;
	positionStrategy?: DropdownPositionStrategy;
	ref?: React.Ref<HTMLDivElement>;
	side?: DropdownSide;
};

export type DropdownMenuEvent =
	| React.MouseEvent<HTMLElement>
	| React.KeyboardEvent<HTMLElement>;

export type DropdownIcon = Exclude<React.ReactNode, string | number>;

export type DropdownMenuOption = {
	active?: boolean;
	className?: string;
	disabled?: boolean;
	dividerAfter?: boolean;
	dividerBefore?: boolean;
	href?: string;
	id?: string;
	label: React.ReactNode;
	layout?: "default" | "presentation";
	leadingIcon?: DropdownIcon;
	onSelect?: (event: DropdownMenuEvent) => void;
	textClassName?: string;
	tone?: "danger" | "default";
	trailingIcon?: DropdownIcon;
};

type DropdownTriggerButtonProps = Omit<ButtonBaseProps, "children" | "href"> &
	Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		"children" | "onClick" | "onKeyDown" | "onMouseEnter" | "onMouseLeave"
	>;

type DropdownCompoundProps = Pick<
	DropdownProps,
	| "align"
	| "collisionPadding"
	| "menuClassName"
	| "menuMinWidth"
	| "menuWidth"
	| "offset"
	| "openOnHover"
	| "pinOnClick"
	| "portalTargetId"
	| "positionStrategy"
	| "side"
> & {
	ariaLabel: string;
	disabled?: boolean;
	listClassName?: string;
	menuContentClassName?: string;
	onOpenChange?: (open: boolean) => void;
	optionActiveClassName?: string;
	optionClassName?: string;
	triggerButtonProps?: DropdownTriggerButtonProps;
	triggerContent?: React.ReactNode;
};

export type DropdownMenuProps = DropdownCompoundProps & {
	options: DropdownMenuOption[];
};

export type DropdownListboxProps<T> = DropdownCompoundProps & {
	emptyState?: React.ReactNode;
	onSelect: (
		value: T,
		option: ListboxOption<T>,
		event: DropdownMenuEvent,
	) => void;
	options: ListboxOption<T>[];
};

export type DropdownNavigableOption = {
	disabled?: boolean;
	selected?: boolean;
};
