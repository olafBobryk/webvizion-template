import type * as React from "react";
import type { DropdownPositionStrategy, DropdownSide } from "./types";

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
	wrapperRect,
	zIndex,
}: {
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
	wrapperRect?: DOMRect;
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

		if (positionStrategy === "fixed") {
			return {
				resolvedSide,
				style: {
					left:
						resolvedSide === "left"
							? Math.max(
									collisionPadding,
									anchorRect.left - renderedWidth - offset,
								)
							: Math.min(
									anchorRect.right + offset,
									window.innerWidth - collisionPadding - renderedWidth,
								),
					maxWidth,
					overflowX: maxWidth === undefined ? undefined : "auto",
					position: "fixed",
					top,
					width: explicitWidth,
					zIndex,
				} satisfies React.CSSProperties,
			};
		}

		if (!wrapperRect) return undefined;
		return {
			resolvedSide,
			style: {
				left:
					resolvedSide === "left"
						? anchorRect.left - wrapperRect.left - renderedWidth - offset
						: anchorRect.right - wrapperRect.left + offset,
				maxWidth,
				overflowX: maxWidth === undefined ? undefined : "auto",
				position: "absolute",
				top: top - wrapperRect.top,
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

	if (positionStrategy === "fixed") {
		let left =
			align === "end" ? anchorRect.right - measuredWidth : anchorRect.left;
		const maxLeft = Math.max(
			collisionPadding,
			window.innerWidth - measuredWidth - collisionPadding,
		);
		left = Math.min(Math.max(left, collisionPadding), maxLeft);
		const top =
			resolvedSide === "top"
				? Math.max(collisionPadding, anchorRect.top - renderedHeight - offset)
				: Math.max(
						collisionPadding,
						Math.min(
							anchorRect.bottom + offset,
							window.innerHeight - collisionPadding - renderedHeight,
						),
					);
		return {
			resolvedSide,
			style: {
				left,
				maxHeight,
				minWidth,
				overflowY: maxHeight === undefined ? undefined : "auto",
				position: "fixed",
				top,
				width: explicitWidth,
				zIndex,
			} satisfies React.CSSProperties,
		};
	}

	if (!wrapperRect) return undefined;
	const rawLeft =
		align === "end"
			? anchorRect.right - wrapperRect.left - measuredWidth
			: anchorRect.left - wrapperRect.left;
	const left = Math.max(
		0,
		Math.min(rawLeft, Math.max(0, wrapperRect.width - measuredWidth)),
	);
	return {
		resolvedSide,
		style: {
			bottom:
				resolvedSide === "top"
					? Math.max(0, wrapperRect.bottom - anchorRect.top + offset)
					: undefined,
			left,
			maxHeight,
			minWidth,
			overflowY: maxHeight === undefined ? undefined : "auto",
			position: "absolute",
			top:
				resolvedSide === "top"
					? undefined
					: anchorRect.bottom - wrapperRect.top + offset,
			width: explicitWidth,
			zIndex,
		} satisfies React.CSSProperties,
	};
}
