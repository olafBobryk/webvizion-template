// ModalShell.tsx
"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import * as React from "react";
import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { resolveMotionTransition } from "@/components/ui/foundations/motionTiming";
import { Icon } from "@/components/ui/icons/Icon";
import Portal from "@/components/ui/overlays/Portal";
import { Button } from "@/components/ui/primitives/Button";
import {
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/primitives/Card";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

export type ModalShellProps = {
	ariaLabel?: string;
	onClose: () => void;
	children: ReactNode;
	portalTargetId?: string;
	panelDirection?: "down" | "up" | "left" | "right";
	animate?: {
		y?: boolean;
		opacity?: boolean;
		scale?: boolean;
	};
	disableWhenReducedMotion?: boolean;
	isTopMost?: boolean;
	layerIndex?: number;
	placement?: "center" | "top";
};

type ModalShellContextValue = {
	beginSubmission: () => boolean;
	endSubmission: () => void;
	isSubmitting: boolean;
	onClose: () => void;
};
type ModalHeaderContextValue = { leadingIcon?: ReactNode };

const ModalShellContext = React.createContext<ModalShellContextValue | null>(
	null,
);
const ModalHeaderContext = React.createContext<ModalHeaderContextValue | null>(
	null,
);

export function useModalSubmission() {
	const context = React.useContext(ModalShellContext);
	if (!context) {
		throw new Error("useModalSubmission must be used inside ModalShell.");
	}
	return {
		beginSubmission: context.beginSubmission,
		endSubmission: context.endSubmission,
		isSubmitting: context.isSubmitting,
	};
}

type ModalHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
	actions?: ReactNode;
	closeDisabled?: boolean;
	closeLabel?: string;
	leadingIcon?: ReactNode;
	onClose?: () => void;
	showCloseButton?: boolean;
};

export function ModalHeader({
	actions,
	children,
	className,
	closeDisabled = false,
	closeLabel = "Close modal",
	leadingIcon,
	onClose,
	showCloseButton = true,
	...props
}: ModalHeaderProps) {
	const modalContext = React.useContext(ModalShellContext);
	const closeHandler = onClose ?? modalContext?.onClose;
	const resolvedCloseDisabled =
		closeDisabled || Boolean(modalContext?.isSubmitting);

	return (
		<CardHeader className={clsx("px-5 py-4", className)} {...props}>
			<ModalHeaderContext.Provider value={{ leadingIcon }}>
				{children}
			</ModalHeaderContext.Provider>
			{actions || (showCloseButton && closeHandler) ? (
				<CardAction className="inline-flex items-center gap-1">
					{actions}
					{showCloseButton && closeHandler ? (
						<Button
							aria-label={closeLabel}
							autoFocus
							className="text-foreground/60 hover:text-foreground"
							disabled={resolvedCloseDisabled}
							onClick={closeHandler}
							size="icon-sm"
							type="button"
							variant="ghost"
						>
							<Icon name="close" size="sm" />
						</Button>
					) : null}
				</CardAction>
			) : null}
		</CardHeader>
	);
}

export function ModalContent({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<CardContent
			className={clsx(
				"min-h-0 overflow-y-auto overscroll-contain px-5 py-4",
				className,
			)}
			{...props}
		/>
	);
}

export function ModalFooter({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<CardFooter
			className={clsx("justify-end gap-2 px-5 py-4", className)}
			{...props}
		/>
	);
}

export function ModalTitle({
	children,
	className,
	leadingIcon,
	...props
}: React.ComponentProps<typeof CardTitle> & { leadingIcon?: ReactNode }) {
	const headerContext = React.useContext(ModalHeaderContext);
	const resolvedLeadingIcon = leadingIcon ?? headerContext?.leadingIcon;
	return (
		<CardTitle
			className={clsx("inline-flex items-center gap-2 text-base", className)}
			{...props}
		>
			{resolvedLeadingIcon ? (
				<span className="inline-flex shrink-0 text-muted-foreground [&_svg]:size-4">
					{resolvedLeadingIcon}
				</span>
			) : null}
			{children}
		</CardTitle>
	);
}

export function ModalDescription(
	props: React.ComponentProps<typeof CardDescription>,
) {
	return <CardDescription {...props} />;
}

const overlayTransition = resolveMotionTransition("overlay");
const panelTransition = resolveMotionTransition("disclosure");

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(root: HTMLElement) {
	return Array.from(
		root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
	).filter(
		(node) =>
			node.tabIndex >= 0 &&
			!node.hidden &&
			node.getClientRects().length > 0 &&
			node.getAttribute("aria-hidden") !== "true" &&
			!node.closest("[inert]"),
	);
}

export function ModalShell({
	ariaLabel,
	onClose,
	children,
	portalTargetId = "modal-root",
	panelDirection = "down",
	animate = { y: true, opacity: true },
	disableWhenReducedMotion = true,
	isTopMost = true,
	layerIndex,
	placement = "center",
}: ModalShellProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);
	const submissionRef = useRef(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	function beginSubmission() {
		if (submissionRef.current) return false;
		submissionRef.current = true;
		setIsSubmitting(true);
		return true;
	}

	function endSubmission() {
		submissionRef.current = false;
		setIsSubmitting(false);
	}

	function requestClose() {
		if (submissionRef.current) return;
		onClose();
	}

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isTopMost) return;

			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				if (!submissionRef.current) onClose();
				return;
			}

			if (event.key !== "Tab") return;

			const wrapper = wrapperRef.current;
			if (!wrapper) return;

			const focusable = getFocusableElements(wrapper);
			if (focusable.length === 0) {
				event.preventDefault();
				wrapper.focus({ preventScroll: true });
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;

			if (!active || !wrapper.contains(active)) {
				event.preventDefault();
				(event.shiftKey ? last : first)?.focus({ preventScroll: true });
				return;
			}

			if (event.shiftKey && active === first) {
				event.preventDefault();
				last?.focus({ preventScroll: true });
				return;
			}

			if (!event.shiftKey && active === last) {
				event.preventDefault();
				first?.focus({ preventScroll: true });
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isTopMost, onClose]);

	useLayoutEffect(() => {
		previousActiveElementRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;

		const wrapper = wrapperRef.current;
		if (wrapper && isTopMost) {
			const [firstFocusable] = getFocusableElements(wrapper);
			(firstFocusable ?? wrapper).focus({ preventScroll: true });
		}

		return () => {
			const previous = previousActiveElementRef.current;
			if (previous && document.contains(previous)) {
				previous.focus({ preventScroll: true });
			}
		};
	}, [isTopMost]);

	useEffect(() => {
		const body = document.body;
		const currentCount = Number(body.dataset.modalOpenCount ?? "0");
		if (currentCount === 0) {
			body.dataset.modalPrevOverflow = body.style.overflow;
			body.dataset.modalPrevPaddingRight = body.style.paddingRight;
			const scrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth;
			body.style.overflow = "hidden";
			if (scrollbarWidth > 0) {
				body.style.paddingRight = `${scrollbarWidth}px`;
			}
		}
		body.dataset.modalOpenCount = String(currentCount + 1);

		return () => {
			const nextCount = Number(body.dataset.modalOpenCount ?? "1") - 1;
			if (nextCount <= 0) {
				body.style.overflow = body.dataset.modalPrevOverflow ?? "";
				body.style.paddingRight = body.dataset.modalPrevPaddingRight ?? "";
				delete body.dataset.modalPrevOverflow;
				delete body.dataset.modalPrevPaddingRight;
				delete body.dataset.modalOpenCount;
			} else {
				body.dataset.modalOpenCount = String(nextCount);
			}
		};
	}, []);

	const motionAllowed = useMotionAllowed(disableWhenReducedMotion);
	const animateY = animate?.y ?? true;
	const animateOpacity = animate?.opacity ?? true;
	const animateScale = animate?.scale ?? true;

	const offset = (() => {
		switch (panelDirection) {
			case "up":
				return { x: 0, y: -24 };
			case "left":
				return { x: -24, y: 0 };
			case "right":
				return { x: 24, y: 0 };
			default:
				return { x: 0, y: 24 };
		}
	})();

	const backdropInitial = motionAllowed
		? { ...(animateOpacity ? { opacity: 0 } : {}) }
		: undefined;
	const backdropAnimate = motionAllowed
		? { ...(animateOpacity ? { opacity: 1 } : {}) }
		: undefined;
	const backdropExit = motionAllowed
		? { ...(animateOpacity ? { opacity: 0 } : {}) }
		: undefined;

	const panelInitial = motionAllowed
		? {
				...(animateOpacity ? { opacity: 0 } : {}),
				...(animateY
					? {
							...(offset.x ? { x: offset.x } : {}),
							...(offset.y ? { y: offset.y } : {}),
						}
					: {}),
				...(animateScale ? { scale: 0.98 } : {}),
			}
		: undefined;
	const panelAnimate = motionAllowed
		? {
				...(animateOpacity ? { opacity: 1 } : {}),
				...(animateY ? { x: 0, y: 0 } : {}),
				...(animateScale ? { scale: 1 } : {}),
			}
		: undefined;
	const panelExit = motionAllowed
		? {
				...(animateOpacity ? { opacity: 0 } : {}),
				...(animateY
					? {
							...(offset.x ? { x: offset.x } : {}),
							...(offset.y ? { y: offset.y } : {}),
						}
					: {}),
				...(animateScale ? { scale: 0.98 } : {}),
			}
		: undefined;

	return (
		<Portal target={portalTargetId}>
			<div
				className={clsx(
					"fixed inset-0 z-80 flex w-full justify-center overflow-hidden overscroll-contain px-4 sm:px-6",
					placement === "top"
						? "items-start py-[9vh]"
						: "items-center py-4 sm:py-6",
				)}
				data-modal-shell=""
				style={layerIndex ? { zIndex: layerIndex } : undefined}
			>
				<motion.button
					aria-label="Close modal"
					key="modal-backdrop"
					className="absolute inset-0 bg-background/20 backdrop-blur-md will-change-opacity"
					initial={backdropInitial}
					animate={backdropAnimate}
					exit={backdropExit}
					transition={motionAllowed ? overlayTransition : undefined}
					onClick={requestClose}
					type="button"
				/>

				<motion.div
					ref={wrapperRef}
					key="modal-content-wrapper"
					className="relative flex max-h-[calc(100dvh-2rem)] w-full min-w-0 justify-center will-change-transform sm:max-h-[calc(100dvh-3rem)]"
					initial={panelInitial}
					animate={panelAnimate}
					exit={panelExit}
					transition={motionAllowed ? panelTransition : undefined}
					aria-modal="true"
					role="dialog"
					aria-label={ariaLabel}
					tabIndex={-1}
					onClick={(event) => {
						if (event.target === event.currentTarget) requestClose();
					}}
				>
					<ModalShellContext.Provider
						value={{
							beginSubmission,
							endSubmission,
							isSubmitting,
							onClose: requestClose,
						}}
					>
						{children}
					</ModalShellContext.Provider>
				</motion.div>
			</div>
		</Portal>
	);
}
