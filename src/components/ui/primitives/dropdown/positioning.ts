import type * as React from "react";
import type { DropdownPositionStrategy, DropdownSide } from "./types";

type AbsolutePositioningOrigin = {
	left: number;
	top: number;
};

export function getAbsolutePositioningOrigin(
	element: HTMLElement,
): AbsolutePositioningOrigin {
	const offsetParent = element.offsetParent;
	if (
		!(offsetParent instanceof HTMLElement) ||
		offsetParent === document.body ||
		offsetParent === document.documentElement
	) {
		return { left: -window.scrollX, top: -window.scrollY };
	}

	const offsetParentRect = offsetParent.getBoundingClientRect();
	return {
		left:
			offsetParentRect.left + offsetParent.clientLeft - offsetParent.scrollLeft,
		top: offsetParentRect.top + offsetParent.clientTop - offsetParent.scrollTop,
	};
}

function resolveDropdownSide({
	preferredSide,
	measuredHeight,
	measuredWidth,
	availableAbove,
	availableBelow,
	availableLeft,
	availableRight,
}: {
	preferredSide: DropdownSide;
	measuredHeight: number;
	measuredWidth: number;
	availableAbove: number;
	availableBelow: number;
	availableLeft: number;
	availableRight: number;
}): DropdownSide {
	if (preferredSide === "left" || preferredSide === "right") {
		const preferredAvailable =
			preferredSide === "left" ? availableLeft : availableRight;
		const oppositeSide = preferredSide === "left" ? "right" : "left";
		const oppositeAvailable =
			oppositeSide === "left" ? availableLeft : availableRight;

		if (measuredWidth <= preferredAvailable) return preferredSide;
		if (oppositeAvailable > preferredAvailable) return oppositeSide;
		return preferredSide;
	}

	const preferredAvailable =
		preferredSide === "top" ? availableAbove : availableBelow;
	const oppositeSide = preferredSide === "top" ? "bottom" : "top";
	const oppositeAvailable =
		oppositeSide === "top" ? availableAbove : availableBelow;

	if (measuredHeight <= preferredAvailable) return preferredSide;
	if (oppositeAvailable > preferredAvailable) return oppositeSide;
	return preferredSide;
}

export function resolveAnchoredDropdownPosition({
	absoluteOrigin,
	align,
	anchorRect,
	collisionPadding,
	explicitWidth,
	measuredHeight,
	measuredWidth,
	minWidth,
	offset,
	positionStrategy,
	side,
	zIndex,
}: {
	absoluteOrigin?: AbsolutePositioningOrigin;
	align: "start" | "end";
	anchorRect: DOMRect;
	collisionPadding: number;
	explicitWidth?: number;
	measuredHeight: number;
	measuredWidth: number;
	minWidth?: number;
	offset: number;
	positionStrategy: DropdownPositionStrategy;
	side: DropdownSide;
	zIndex: number;
}) {
	const availableAbove = Math.max(
		0,
		anchorRect.top - offset - collisionPadding,
	);
	const availableBelow = Math.max(
		0,
		window.innerHeight - anchorRect.bottom - offset - collisionPadding,
	);
	const availableLeft = Math.max(
		0,
		anchorRect.left - offset - collisionPadding,
	);
	const availableRight = Math.max(
		0,
		window.innerWidth - anchorRect.right - offset - collisionPadding,
	);
	const resolvedSide = resolveDropdownSide({
		availableAbove,
		availableBelow,
		availableLeft,
		availableRight,
		measuredHeight,
		measuredWidth,
		preferredSide: side,
	});

	if (resolvedSide === "left" || resolvedSide === "right") {
		const availableWidth =
			resolvedSide === "left" ? availableLeft : availableRight;
		const maxWidth =
			measuredWidth > availableWidth ? availableWidth : undefined;
		const renderedWidth = maxWidth ?? measuredWidth;
		const rawTop =
			align === "end" ? anchorRect.bottom - measuredHeight : anchorRect.top;
		const top = Math.min(
			Math.max(rawTop, collisionPadding),
			Math.max(
				collisionPadding,
				window.innerHeight - measuredHeight - collisionPadding,
			),
		);

		const viewportLeft =
			resolvedSide === "left"
				? Math.max(collisionPadding, anchorRect.left - renderedWidth - offset)
				: Math.min(
						anchorRect.right + offset,
						window.innerWidth - collisionPadding - renderedWidth,
					);
		if (positionStrategy === "absolute" && !absoluteOrigin) return undefined;
		return {
			resolvedSide,
			style: {
				left:
					viewportLeft -
					(positionStrategy === "absolute" ? (absoluteOrigin?.left ?? 0) : 0),
				maxWidth,
				overflowX: maxWidth === undefined ? undefined : "auto",
				position: positionStrategy,
				top:
					top -
					(positionStrategy === "absolute" ? (absoluteOrigin?.top ?? 0) : 0),
				width: explicitWidth,
				zIndex,
			} satisfies React.CSSProperties,
		};
	}
	const availableHeight =
		resolvedSide === "top" ? availableAbove : availableBelow;
	const maxHeight =
		measuredHeight > availableHeight ? availableHeight : undefined;
	const renderedHeight = maxHeight ?? measuredHeight;

	let viewportLeft =
		align === "end" ? anchorRect.right - measuredWidth : anchorRect.left;
	const maxLeft = Math.max(
		collisionPadding,
		window.innerWidth - measuredWidth - collisionPadding,
	);
	viewportLeft = Math.min(Math.max(viewportLeft, collisionPadding), maxLeft);
	const viewportTop =
		resolvedSide === "top"
			? Math.max(collisionPadding, anchorRect.top - renderedHeight - offset)
			: Math.max(
					collisionPadding,
					Math.min(
						anchorRect.bottom + offset,
						window.innerHeight - collisionPadding - renderedHeight,
					),
				);
	if (positionStrategy === "absolute" && !absoluteOrigin) return undefined;
	return {
		resolvedSide,
		style: {
			left:
				viewportLeft -
				(positionStrategy === "absolute" ? (absoluteOrigin?.left ?? 0) : 0),
			maxHeight,
			minWidth,
			overflowY: maxHeight === undefined ? undefined : "auto",
			position: positionStrategy,
			top:
				viewportTop -
				(positionStrategy === "absolute" ? (absoluteOrigin?.top ?? 0) : 0),
			width: explicitWidth,
			zIndex,
		} satisfies React.CSSProperties,
	};
}
