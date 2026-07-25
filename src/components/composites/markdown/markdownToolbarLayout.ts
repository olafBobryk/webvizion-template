"use client";

import * as React from "react";

const MAX_COLLAPSE_STAGE = 6;

export function useMarkdownToolbarCollapse() {
	const toolbarRef = React.useRef<HTMLDivElement>(null);
	const commandRegionRef = React.useRef<HTMLDivElement>(null);
	const trailingActionsRef = React.useRef<HTMLDivElement>(null);
	const lastToolbarWidthRef = React.useRef<number | null>(null);
	const [toolbarWidth, setToolbarWidth] = React.useState(0);
	const [collapseStage, setCollapseStage] = React.useState(0);

	React.useLayoutEffect(() => {
		const toolbar = toolbarRef.current;
		const toolbarShell = toolbar?.parentElement;
		if (!toolbar || !toolbarShell) return;

		function measureToolbarWidth() {
			const width = Math.round(
				toolbarRef.current?.getBoundingClientRect().width ?? 0,
			);
			if (lastToolbarWidthRef.current === width) return;

			lastToolbarWidthRef.current = width;
			setToolbarWidth(width);
			setCollapseStage(0);
		}

		const resizeObserver = new ResizeObserver(measureToolbarWidth);
		resizeObserver.observe(toolbarShell);
		measureToolbarWidth();

		return () => resizeObserver.disconnect();
	}, []);

	React.useLayoutEffect(() => {
		const toolbar = toolbarRef.current;
		const commandRegion = commandRegionRef.current;
		const trailingActions = trailingActionsRef.current;
		if (!toolbar || !commandRegion || !trailingActions || toolbarWidth === 0) {
			return;
		}

		const availableWidth = toolbar.clientWidth;
		const requiredWidth =
			commandRegion.scrollWidth + trailingActions.scrollWidth;
		if (
			requiredWidth <= availableWidth + 1 ||
			collapseStage >= MAX_COLLAPSE_STAGE
		) {
			return;
		}

		setCollapseStage((current) => Math.min(MAX_COLLAPSE_STAGE, current + 1));
	}, [collapseStage, toolbarWidth]);

	return {
		commandRegionRef,
		historyCollapsed: collapseStage >= 3,
		mergeHistoryMenu: collapseStage >= 6,
		mergeStructureMenu: collapseStage >= 4,
		mergeTextMenu: collapseStage >= 5,
		structureCollapsed: collapseStage >= 1,
		textCollapsed: collapseStage >= 2,
		toolbarRef,
		trailingActionsRef,
	};
}
