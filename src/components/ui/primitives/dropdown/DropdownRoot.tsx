/** biome-ignore-all lint/a11y/useKeyWithClickEvents: trigger interaction is delegated through render props and nested controls */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: trigger wrapper behavior is delegated through render props and nested controls */
"use client";

import { CaretDown } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { resolveMotionTransition } from "@/components/ui/foundations/motionTiming";
import Portal from "@/components/ui/overlays/Portal";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { dropdownSurfaceClassName } from "../dropdownStyles";
import { COLLISION_PADDING, DEFAULT_MENU_MIN_WIDTH } from "./constants";
import { resolveAnchoredDropdownPosition } from "./positioning";
import type { DropdownProps, DropdownSide } from "./types";

const DEFAULT_CHEVRON_ICON = ({ isOpen }: { isOpen: boolean }) => {
	return (
		<CaretDown
			aria-hidden
			data-is-open={isOpen}
			className="data-[is-open=true]:rotate-180 transition-transform motion-micro"
			size={15}
		/>
	);
};

export function DropdownRoot({
	renderTrigger,
	renderMenu,
	onLeftClick,
	className,
	collisionPadding = COLLISION_PADDING,
	menuClassName,
	portalTargetId,
	menuWidth,
	menuMinWidth = DEFAULT_MENU_MIN_WIDTH,
	align = "end",
	side = "bottom",
	offset = 8,
	positionStrategy = "absolute",
	disabled,
	open,
	openOnHover = true,
	pinOnClick = openOnHover,
	disableWhenReducedMotion = true,
	autoFocusMenu = true,
	onOpenChange,
}: DropdownProps) {
	const motionAllowed = useMotionAllowed(disableWhenReducedMotion);
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const [isPinned, setIsPinned] = React.useState(false);
	const wrapperRef = React.useRef<HTMLDivElement | null>(null);
	const rootRef = React.useRef<HTMLElement | null>(null);
	const menuRef = React.useRef<HTMLDivElement | null>(null);
	const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>();
	const [resolvedSide, setResolvedSide] = React.useState<DropdownSide>(side);
	const hoverTimeoutRef = React.useRef<number | null>(null);
	const lastOpenMethodRef = React.useRef<"keyboard" | "pointer" | null>(null);
	const isOpenControlled = open !== undefined;
	const isOpen = open ?? uncontrolledOpen;

	const setOpenState = React.useCallback(
		(next: boolean) => {
			if (!isOpenControlled) {
				setUncontrolledOpen(next);
			}
			onOpenChange?.(next);
		},
		[isOpenControlled, onOpenChange],
	);

	React.useEffect(() => {
		if (!isOpen && isPinned) {
			setIsPinned(false);
		}
	}, [isOpen, isPinned]);

	const focusableSelector =
		'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

	const isFocusableElement = React.useCallback((element: HTMLElement) => {
		if (!element.matches(focusableSelector)) return false;
		const style = window.getComputedStyle(element);
		const isDisabled =
			(element as HTMLButtonElement).disabled ||
			element.getAttribute("aria-disabled") === "true";
		return (
			style.visibility !== "hidden" && style.display !== "none" && !isDisabled
		);
	}, []);

	const getFocusableElements = React.useCallback(() => {
		return Array.from(
			document.querySelectorAll<HTMLElement>(focusableSelector),
		).filter((element) => {
			const style = window.getComputedStyle(element);
			const isDisabled =
				(element as HTMLButtonElement).disabled ||
				element.getAttribute("aria-disabled") === "true";
			return (
				style.visibility !== "hidden" && style.display !== "none" && !isDisabled
			);
		});
	}, []);

	const getTriggerFocusable = React.useCallback(() => {
		if (!rootRef.current) return null;
		if (isFocusableElement(rootRef.current)) return rootRef.current;
		return rootRef.current.querySelector<HTMLElement>(focusableSelector);
	}, [isFocusableElement]);

	const focusTrigger = React.useCallback(
		(options?: { preventScroll?: boolean }) => {
			const focusTarget = getTriggerFocusable();
			focusTarget?.focus({ preventScroll: options?.preventScroll });
		},
		[getTriggerFocusable],
	);

	const getMenuFocusableElements = React.useCallback(() => {
		if (!menuRef.current) return [];
		return Array.from(
			menuRef.current.querySelectorAll<HTMLElement>(
				'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
			),
		).filter((element) => {
			const style = window.getComputedStyle(element);
			const isDisabled =
				(element as HTMLButtonElement).disabled ||
				element.getAttribute("aria-disabled") === "true";
			return (
				style.visibility !== "hidden" && style.display !== "none" && !isDisabled
			);
		});
	}, []);

	const focusRelativeToTrigger = React.useCallback(
		(direction: "next" | "prev") => {
			const focusables = getFocusableElements();
			const triggerFocusable = getTriggerFocusable();
			if (!triggerFocusable) return;
			const triggerIndex = focusables.indexOf(triggerFocusable);
			if (triggerIndex === -1) return;
			const nextIndex =
				direction === "next" ? triggerIndex + 1 : triggerIndex - 1;
			const nextTarget = focusables[nextIndex];
			nextTarget?.focus({ preventScroll: true });
		},
		[getFocusableElements, getTriggerFocusable],
	);

	const clearHoverTimeout = React.useCallback(() => {
		if (hoverTimeoutRef.current != null) {
			window.clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}
	}, []);

	const scheduleClose = React.useCallback(() => {
		clearHoverTimeout();
		hoverTimeoutRef.current = window.setTimeout(() => {
			if (!isPinned) {
				setOpenState(false);
			}
		}, 120);
	}, [clearHoverTimeout, isPinned, setOpenState]);

	const openMenu = React.useCallback(
		(options?: { focusMenu?: boolean; pin?: boolean }) => {
			if (disabled) return;
			lastOpenMethodRef.current = options?.focusMenu ? "keyboard" : "pointer";
			setOpenState(true);
			if (typeof options?.pin === "boolean") {
				setIsPinned(options.pin);
			}
		},
		[disabled, setOpenState],
	);

	const closeMenu = React.useCallback(
		(options?: { restoreFocus?: boolean }) => {
			const restoreFocus = options?.restoreFocus ?? true;
			clearHoverTimeout();
			setOpenState(false);
			setIsPinned(false);
			if (restoreFocus) {
				focusTrigger({ preventScroll: true });
			}
		},
		[clearHoverTimeout, focusTrigger, setOpenState],
	);

	const handleRootMouseEnter = () => {
		if (!openOnHover || disabled) return;
		clearHoverTimeout();
		if (!isPinned) openMenu();
	};

	const handleRootMouseLeave = () => {
		if (!openOnHover || disabled) return;
		if (!isPinned) scheduleClose();
	};

	const handleLeftClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (disabled) return;
		lastOpenMethodRef.current = event.detail === 0 ? "keyboard" : "pointer";
		setIsPinned(true);
		setOpenState(true);
		onLeftClick?.();
	};

	const handleRightClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (disabled) return;
		lastOpenMethodRef.current = event.detail === 0 ? "keyboard" : "pointer";

		if (openOnHover && pinOnClick) {
			setIsPinned((prev) => {
				const next = !prev;
				setOpenState(next);
				return next;
			});
			return;
		}

		setIsPinned(false);
		setOpenState(!isOpen);
	};

	const calculateMenuPosition = React.useCallback(() => {
		if (!rootRef.current) return;

		const rect = rootRef.current.getBoundingClientRect();
		const explicitWidth = menuWidth === "trigger" ? rect.width : menuWidth;
		const resolvedMinWidth =
			explicitWidth ?? (menuWidth === "trigger" ? rect.width : menuMinWidth);
		const measuredWidth =
			explicitWidth ??
			menuRef.current?.getBoundingClientRect().width ??
			resolvedMinWidth;
		const measuredHeight =
			menuRef.current?.scrollHeight ??
			menuRef.current?.getBoundingClientRect().height ??
			0;
		const position = resolveAnchoredDropdownPosition({
			align,
			anchorRect: rect,
			collisionPadding,
			explicitWidth,
			measuredHeight,
			measuredWidth,
			minWidth: resolvedMinWidth,
			offset,
			positionStrategy,
			side,
			wrapperRect: wrapperRef.current?.getBoundingClientRect(),
			zIndex: 90,
		});
		if (!position) return;
		setResolvedSide(position.resolvedSide);
		setMenuStyle(position.style);
	}, [
		align,
		collisionPadding,
		menuMinWidth,
		menuWidth,
		offset,
		positionStrategy,
		side,
	]);

	React.useEffect(() => {
		if (isOpen) {
			calculateMenuPosition();
		} else {
			setMenuStyle(undefined);
			setResolvedSide(side);
		}
	}, [isOpen, calculateMenuPosition, side]);

	React.useEffect(() => {
		if (!isOpen) return;
		if (
			autoFocusMenu &&
			menuRef.current &&
			lastOpenMethodRef.current === "keyboard"
		) {
			const focusTarget = menuRef.current.querySelector<HTMLElement>(
				'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
			);
			focusTarget?.focus({ preventScroll: true });
		}
		const handleResize = () => calculateMenuPosition();
		window.addEventListener("resize", handleResize);
		if (positionStrategy === "fixed") {
			window.addEventListener("scroll", handleResize, true);
		}
		return () => {
			window.removeEventListener("resize", handleResize);
			if (positionStrategy === "fixed") {
				window.removeEventListener("scroll", handleResize, true);
			}
		};
	}, [isOpen, calculateMenuPosition, autoFocusMenu, positionStrategy]);

	React.useEffect(() => {
		if (!isOpen && !isPinned) return;
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				rootRef.current &&
				!rootRef.current.contains(target) &&
				menuRef.current &&
				!menuRef.current.contains(target)
			) {
				closeMenu({ restoreFocus: false });
			}
		};
		const handleFocusOutside = (event: FocusEvent) => {
			const target = event.target as Node;
			if (
				rootRef.current &&
				!rootRef.current.contains(target) &&
				menuRef.current &&
				!menuRef.current.contains(target)
			) {
				closeMenu({ restoreFocus: false });
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closeMenu({ restoreFocus: true });
				return;
			}
			if (event.key !== "Tab" || !menuRef.current) return;
			const active = document.activeElement as HTMLElement | null;
			if (!active || !menuRef.current.contains(active)) return;

			const menuFocusables = getMenuFocusableElements();
			if (menuFocusables.length === 0) return;
			const first = menuFocusables[0];
			const last = menuFocusables[menuFocusables.length - 1];

			if (event.shiftKey && active === first) {
				event.preventDefault();
				closeMenu({ restoreFocus: false });
				focusRelativeToTrigger("prev");
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				closeMenu({ restoreFocus: false });
				focusRelativeToTrigger("next");
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("focusin", handleFocusOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("focusin", handleFocusOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		closeMenu,
		isOpen,
		isPinned,
		getMenuFocusableElements,
		focusRelativeToTrigger,
	]);

	const setMenuNode = React.useCallback(
		(node: HTMLDivElement | null) => {
			menuRef.current = node;
			if (node && isOpen) {
				calculateMenuPosition();
			}
		},
		[isOpen, calculateMenuPosition],
	);

	const baseMenuClassName = [
		dropdownSurfaceClassName,
		"w-fit z-[91]",
		positionStrategy === "fixed" ? "fixed" : "absolute",
	]
		.filter(Boolean)
		.join(" ");
	const resolvedMenuClassName = [baseMenuClassName, menuClassName]
		.filter(Boolean)
		.join(" ");
	const menuMotionY = resolvedSide === "top" ? 6 : -6;
	const menuNode = motionAllowed ? (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					ref={setMenuNode}
					key="dropdown-menu"
					initial={{ opacity: 0, y: menuMotionY }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: menuMotionY }}
					transition={resolveMotionTransition("disclosure")}
					style={menuStyle}
					className={resolvedMenuClassName}
					onMouseEnter={clearHoverTimeout}
					onMouseLeave={() => {
						if (!isPinned && openOnHover) scheduleClose();
					}}
				>
					{renderMenu({ close: closeMenu })}
				</motion.div>
			) : null}
		</AnimatePresence>
	) : isOpen ? (
		<div
			ref={setMenuNode}
			key="dropdown-menu"
			style={menuStyle}
			className={resolvedMenuClassName}
			onMouseEnter={clearHoverTimeout}
			onMouseLeave={() => {
				if (!isPinned && openOnHover) scheduleClose();
			}}
		>
			{renderMenu({ close: closeMenu })}
		</div>
	) : null;

	return (
		<div
			ref={wrapperRef}
			className={
				positionStrategy === "absolute" ? "relative max-w-full" : undefined
			}
		>
			{renderTrigger({
				ref: rootRef,
				isOpen,
				isPinned,
				className,
				onRootMouseEnter: handleRootMouseEnter,
				onRootMouseLeave: handleRootMouseLeave,
				onLeftClick: onLeftClick ? handleLeftClick : undefined,
				onRightClick: handleRightClick,
				openMenu,
				closeMenu,
				chevronIcon: <DEFAULT_CHEVRON_ICON isOpen={isOpen} />,
			})}

			{positionStrategy === "fixed" ? (
				<Portal target={portalTargetId}>{menuNode}</Portal>
			) : (
				menuNode
			)}
		</div>
	);
}
