"use client";

import * as React from "react";
import type { DropdownNavigableOption } from "./types";

export function useDropdownListNavigation({
	isOpen,
	options,
}: {
	isOpen: boolean;
	options: readonly DropdownNavigableOption[];
}) {
	const [activeIndex, setActiveIndex] = React.useState(-1);
	const listRef = React.useRef<HTMLDivElement | null>(null);
	const focusOnOpenRef = React.useRef(false);
	const pendingOpenIndexRef = React.useRef<number | null>(null);
	const selectedIndex = options.findIndex(
		(option) => option.selected && !option.disabled,
	);
	const enabledIndices = React.useMemo(
		() =>
			options
				.map((option, index) => ({ index, option }))
				.filter(({ option }) => !option.disabled)
				.map(({ index }) => index),
		[options],
	);
	const getBoundaryIndex = React.useCallback(
		(boundary: "first" | "last") =>
			boundary === "first"
				? (enabledIndices[0] ?? -1)
				: (enabledIndices.at(-1) ?? -1),
		[enabledIndices],
	);
	const getNextIndex = React.useCallback(
		(current: number, direction: 1 | -1) => {
			if (enabledIndices.length === 0) return -1;
			const currentPosition = enabledIndices.indexOf(current);
			const nextPosition =
				currentPosition === -1
					? direction === 1
						? 0
						: enabledIndices.length - 1
					: (currentPosition + direction + enabledIndices.length) %
						enabledIndices.length;
			return enabledIndices[nextPosition] ?? enabledIndices[0] ?? -1;
		},
		[enabledIndices],
	);
	const prepareKeyboardOpen = React.useCallback(
		(direction?: 1 | -1) => {
			pendingOpenIndexRef.current = direction
				? getBoundaryIndex(direction === 1 ? "first" : "last")
				: selectedIndex >= 0
					? selectedIndex
					: getBoundaryIndex("first");
			focusOnOpenRef.current = true;
		},
		[getBoundaryIndex, selectedIndex],
	);
	const preparePointerOpen = React.useCallback(() => {
		focusOnOpenRef.current = false;
		pendingOpenIndexRef.current = null;
		setActiveIndex(-1);
	}, []);

	React.useEffect(() => {
		if (!isOpen) {
			focusOnOpenRef.current = false;
			pendingOpenIndexRef.current = null;
			setActiveIndex(-1);
			return;
		}
		const nextIndex = pendingOpenIndexRef.current ?? -1;
		pendingOpenIndexRef.current = null;
		setActiveIndex(nextIndex);
		if (!focusOnOpenRef.current) return;
		window.requestAnimationFrame(() => {
			listRef.current?.focus({ preventScroll: true });
			focusOnOpenRef.current = false;
		});
	}, [isOpen]);

	React.useEffect(() => {
		if (!isOpen || activeIndex < 0) return;
		listRef.current
			?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [activeIndex, isOpen]);

	React.useEffect(() => {
		if (!isOpen || activeIndex < 0 || enabledIndices.includes(activeIndex))
			return;
		setActiveIndex(getBoundaryIndex("first"));
	}, [activeIndex, enabledIndices, getBoundaryIndex, isOpen]);

	return {
		activeIndex,
		getBoundaryIndex,
		getNextIndex,
		listRef,
		prepareKeyboardOpen,
		preparePointerOpen,
		setActiveIndex,
	};
}
