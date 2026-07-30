"use client";

import * as React from "react";

const ROOT_PATH_KEY = "root";
const POINTER_CLOSE_DELAY = 120;

export type DropdownCollectionNode = {
	disabled?: boolean;
	selected?: boolean;
	children?: readonly DropdownCollectionNode[];
};

type CollectionPath = readonly number[];
type ActiveIndexUpdate = number | ((current: number) => number);

function getPathKey(path: CollectionPath) {
	return path.length === 0 ? ROOT_PATH_KEY : path.join("-");
}

function isPathPrefix(prefix: CollectionPath, path: CollectionPath) {
	return prefix.every((value, index) => path[index] === value);
}

function arePathsEqual(left: CollectionPath, right: CollectionPath) {
	return left.length === right.length && isPathPrefix(left, right);
}

export function useDropdownCollectionController({
	initiallyOpen = false,
	onOpenChange,
	options,
	rootId,
}: {
	initiallyOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	options: readonly DropdownCollectionNode[];
	rootId: string;
}) {
	const [isRootOpen, setIsRootOpen] = React.useState(initiallyOpen);
	const [openPath, setOpenPath] = React.useState<number[]>([]);
	const [activeIndices, setActiveIndices] = React.useState<
		Record<string, number>
	>({ [ROOT_PATH_KEY]: -1 });
	const listNodesRef = React.useRef(new Map<string, HTMLDivElement>());
	const anchorRefsRef = React.useRef(
		new Map<string, { current: HTMLElement | null }>(),
	);
	const surfaceNodesRef = React.useRef(new Map<string, HTMLElement>());
	const rootHoverHandlersRef = React.useRef<
		| {
				cancel: () => void;
				schedule: () => boolean;
		  }
		| undefined
	>(undefined);
	const pointerCloseTimerRef = React.useRef<number | null>(null);
	const pendingRootFocusRef = React.useRef(false);
	const pendingLevelFocusRef = React.useRef<string | null>(null);
	const warnedCyclesRef = React.useRef(new WeakSet<object>());

	const warnCycle = React.useCallback((node: DropdownCollectionNode) => {
		if (process.env.NODE_ENV === "production") return;
		if (warnedCyclesRef.current.has(node)) return;
		warnedCyclesRef.current.add(node);
		console.warn(
			"Dropdown collection omitted a recursive option that repeats an ancestor object.",
			node,
		);
	}, []);

	const getOptionsAtPath = React.useCallback(
		(path: CollectionPath) => {
			let levelOptions = options;
			const ancestors = new Set<DropdownCollectionNode>();
			for (const index of path) {
				const parent = levelOptions[index];
				if (!parent || ancestors.has(parent)) return [];
				ancestors.add(parent);
				levelOptions = (parent.children ?? []).filter((child) => {
					if (!ancestors.has(child)) return true;
					warnCycle(child);
					return false;
				});
			}
			return levelOptions;
		},
		[options, warnCycle],
	);

	const getChildren = React.useCallback(
		(path: CollectionPath, index: number) => {
			const levelOptions = getOptionsAtPath(path);
			const node = levelOptions[index];
			if (!node?.children?.length) return [];
			const ancestors = new Set<DropdownCollectionNode>();
			let ancestorOptions = options;
			for (const ancestorIndex of path) {
				const ancestor = ancestorOptions[ancestorIndex];
				if (!ancestor) break;
				ancestors.add(ancestor);
				ancestorOptions = ancestor.children ?? [];
			}
			ancestors.add(node);
			return node.children.filter((child) => {
				if (!ancestors.has(child)) return true;
				warnCycle(child);
				return false;
			});
		},
		[getOptionsAtPath, options, warnCycle],
	);

	const getEnabledIndices = React.useCallback(
		(path: CollectionPath) =>
			getOptionsAtPath(path)
				.map((option, index) => ({ index, option }))
				.filter(({ option }) => !option.disabled)
				.map(({ index }) => index),
		[getOptionsAtPath],
	);

	const getBoundaryIndex = React.useCallback(
		(path: CollectionPath, boundary: "first" | "last") => {
			const enabledIndices = getEnabledIndices(path);
			return boundary === "first"
				? (enabledIndices[0] ?? -1)
				: (enabledIndices.at(-1) ?? -1);
		},
		[getEnabledIndices],
	);

	const getNextIndex = React.useCallback(
		(path: CollectionPath, current: number, direction: 1 | -1) => {
			const enabledIndices = getEnabledIndices(path);
			if (enabledIndices.length === 0) return -1;
			const currentPosition = enabledIndices.indexOf(current);
			const nextPosition =
				currentPosition === -1
					? direction === 1
						? 0
						: enabledIndices.length - 1
					: (currentPosition + direction + enabledIndices.length) %
						enabledIndices.length;
			return enabledIndices[nextPosition] ?? -1;
		},
		[getEnabledIndices],
	);

	const getActiveIndex = React.useCallback(
		(path: CollectionPath) => activeIndices[getPathKey(path)] ?? -1,
		[activeIndices],
	);

	const setActiveIndex = React.useCallback(
		(path: CollectionPath, update: ActiveIndexUpdate) => {
			const pathKey = getPathKey(path);
			setActiveIndices((current) => {
				const currentIndex = current[pathKey] ?? -1;
				const nextIndex =
					typeof update === "function" ? update(currentIndex) : update;
				if (nextIndex === currentIndex) return current;
				return { ...current, [pathKey]: nextIndex };
			});
		},
		[],
	);

	const getListId = React.useCallback(
		(path: CollectionPath) =>
			path.length === 0 ? rootId : `${rootId}-children-${path.join("-")}`,
		[rootId],
	);

	const getOptionId = React.useCallback(
		(path: CollectionPath, index: number) =>
			`${getListId(path)}-option-${index}`,
		[getListId],
	);

	const registerList = React.useCallback(
		(path: CollectionPath, node: HTMLDivElement | null) => {
			const pathKey = getPathKey(path);
			if (node) {
				listNodesRef.current.set(pathKey, node);
				if (pendingLevelFocusRef.current === pathKey) {
					pendingLevelFocusRef.current = null;
					window.requestAnimationFrame(() =>
						node.focus({ preventScroll: true }),
					);
				}
			} else {
				listNodesRef.current.delete(pathKey);
			}
		},
		[],
	);

	const getAnchorRef = React.useCallback(
		(path: CollectionPath, index: number) => {
			const key = `${getPathKey(path)}:${index}`;
			let anchorRef = anchorRefsRef.current.get(key);
			if (!anchorRef) {
				anchorRef = { current: null };
				anchorRefsRef.current.set(key, anchorRef);
			}
			return anchorRef;
		},
		[],
	);

	const registerAnchor = React.useCallback(
		(path: CollectionPath, index: number, node: HTMLElement | null) => {
			getAnchorRef(path, index).current = node;
		},
		[getAnchorRef],
	);

	const registerSurface = React.useCallback(
		(path: CollectionPath, node: HTMLElement | null) => {
			const pathKey = getPathKey(path);
			if (node) surfaceNodesRef.current.set(pathKey, node);
			else surfaceNodesRef.current.delete(pathKey);
		},
		[],
	);

	const focusLevel = React.useCallback((path: CollectionPath) => {
		window.requestAnimationFrame(() => {
			listNodesRef.current
				.get(getPathKey(path))
				?.focus({ preventScroll: true });
		});
	}, []);

	const clearPointerClose = React.useCallback(() => {
		if (pointerCloseTimerRef.current == null) return;
		window.clearTimeout(pointerCloseTimerRef.current);
		pointerCloseTimerRef.current = null;
	}, []);

	const closeChildrenFrom = React.useCallback(
		(path: CollectionPath, options?: { focusLevel?: boolean }) => {
			clearPointerClose();
			setOpenPath((current) =>
				isPathPrefix(path, current) && !arePathsEqual(path, current)
					? [...path]
					: current,
			);
			if (options?.focusLevel) focusLevel(path);
		},
		[clearPointerClose, focusLevel],
	);

	const scheduleCloseChildrenFrom = React.useCallback(
		(path: CollectionPath) => {
			clearPointerClose();
			pointerCloseTimerRef.current = window.setTimeout(() => {
				setOpenPath((current) =>
					isPathPrefix(path, current) && !arePathsEqual(path, current)
						? [...path]
						: current,
				);
			}, POINTER_CLOSE_DELAY);
		},
		[clearPointerClose],
	);

	const scheduleCloseCascade = React.useCallback(() => {
		scheduleCloseChildrenFrom([]);
	}, [scheduleCloseChildrenFrom]);

	const openChildren = React.useCallback(
		(path: CollectionPath, index: number, options?: { focus?: boolean }) => {
			const option = getOptionsAtPath(path)[index];
			const children = getChildren(path, index);
			if (!option || option.disabled || children.length === 0) return false;
			clearPointerClose();
			const childPath = [...path, index];
			setOpenPath((current) =>
				arePathsEqual(current, childPath) ? current : childPath,
			);
			setActiveIndex(
				childPath,
				options?.focus ? getBoundaryIndex(childPath, "first") : -1,
			);
			if (options?.focus) {
				pendingLevelFocusRef.current = getPathKey(childPath);
				focusLevel(childPath);
			}
			return true;
		},
		[
			clearPointerClose,
			focusLevel,
			getBoundaryIndex,
			getChildren,
			getOptionsAtPath,
			setActiveIndex,
		],
	);

	const closeDeepest = React.useCallback(
		(options?: { focusParent?: boolean }) => {
			if (openPath.length === 0) return false;
			const parentPath = openPath.slice(0, -1);
			setOpenPath(parentPath);
			if (options?.focusParent) focusLevel(parentPath);
			return true;
		},
		[focusLevel, openPath],
	);

	const resetLevels = React.useCallback(() => {
		clearPointerClose();
		setOpenPath([]);
		setActiveIndices({ [ROOT_PATH_KEY]: -1 });
	}, [clearPointerClose]);

	const setRootOpen = React.useCallback(
		(next: boolean) => {
			setIsRootOpen(next);
			if (!next) resetLevels();
			onOpenChange?.(next);
		},
		[onOpenChange, resetLevels],
	);

	const preparePointerOpen = React.useCallback(() => {
		pendingRootFocusRef.current = false;
		setActiveIndex([], -1);
	}, [setActiveIndex]);

	const prepareKeyboardOpen = React.useCallback(
		(direction?: 1 | -1) => {
			const selectedIndex = options.findIndex(
				(option) => option.selected && !option.disabled,
			);
			const nextIndex = direction
				? getBoundaryIndex([], direction === 1 ? "first" : "last")
				: selectedIndex >= 0
					? selectedIndex
					: getBoundaryIndex([], "first");
			pendingRootFocusRef.current = true;
			setActiveIndex([], nextIndex);
		},
		[getBoundaryIndex, options, setActiveIndex],
	);

	React.useEffect(() => {
		if (!isRootOpen || !pendingRootFocusRef.current) return;
		focusLevel([]);
		pendingRootFocusRef.current = false;
	}, [focusLevel, isRootOpen]);

	React.useEffect(() => {
		if (openPath.length === 0) return;
		let validPath: number[] = [];
		for (let depth = 0; depth < openPath.length; depth += 1) {
			const index = openPath[depth];
			const option = getOptionsAtPath(validPath)[index];
			if (
				!option ||
				option.disabled ||
				getChildren(validPath, index).length === 0
			) {
				break;
			}
			validPath = [...validPath, index];
		}
		if (validPath.length !== openPath.length) {
			const activeElement = document.activeElement;
			const focusWasInRemovedLevel = openPath
				.slice(validPath.length)
				.some((_index, offset) =>
					listNodesRef.current
						.get(getPathKey(openPath.slice(0, validPath.length + offset + 1)))
						?.contains(activeElement),
				);
			setOpenPath(validPath);
			if (focusWasInRemovedLevel) focusLevel(validPath);
		}

		const visibleLevelPaths = [
			[],
			...openPath.map((_index, depth) => openPath.slice(0, depth + 1)),
		];
		setActiveIndices((current) => {
			let next = current;
			for (const levelPath of visibleLevelPaths) {
				const pathKey = getPathKey(levelPath);
				const activeIndex = current[pathKey] ?? -1;
				if (activeIndex < 0) continue;
				const activeOption = getOptionsAtPath(levelPath)[activeIndex];
				if (activeOption && !activeOption.disabled) continue;
				if (next === current) next = { ...current };
				next[pathKey] = getBoundaryIndex(levelPath, "first");
			}
			return next;
		});
	}, [focusLevel, getBoundaryIndex, getChildren, getOptionsAtPath, openPath]);

	React.useEffect(() => () => clearPointerClose(), [clearPointerClose]);

	const containsTarget = React.useCallback((target: Node) => {
		for (const listNode of listNodesRef.current.values()) {
			if (listNode.contains(target)) return true;
		}
		for (const surfaceNode of surfaceNodesRef.current.values()) {
			if (surfaceNode.contains(target)) return true;
		}
		return false;
	}, []);

	const connectRootHoverHandlers = React.useCallback(
		(handlers: { cancel: () => void; schedule: () => boolean } | undefined) => {
			rootHoverHandlersRef.current = handlers;
		},
		[],
	);

	return {
		cancelPointerClose: clearPointerClose,
		cancelRootHoverClose: () => rootHoverHandlersRef.current?.cancel(),
		closeChildrenFrom,
		closeDeepest,
		containsTarget,
		connectRootHoverHandlers,
		focusLevel,
		getActiveIndex,
		getAnchorRef,
		getBoundaryIndex,
		getChildren,
		getListId,
		getNextIndex,
		getOptionId,
		getOptionsAtPath,
		isChildOpen: (path: CollectionPath, index: number) =>
			openPath.length > path.length &&
			isPathPrefix(path, openPath) &&
			openPath[path.length] === index,
		isRootOpen,
		openChildren,
		openPath,
		prepareKeyboardOpen,
		preparePointerOpen,
		registerAnchor,
		registerList,
		registerSurface,
		resetLevels,
		scheduleCloseCascade,
		scheduleCloseChildrenFrom,
		scheduleRootHoverClose: () =>
			rootHoverHandlersRef.current?.schedule() ?? false,
		setActiveIndex,
		setRootOpen,
	};
}

export type DropdownCollectionController = ReturnType<
	typeof useDropdownCollectionController
>;
