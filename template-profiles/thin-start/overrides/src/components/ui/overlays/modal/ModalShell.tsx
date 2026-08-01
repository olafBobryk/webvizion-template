"use client";

import clsx from "clsx";
import * as React from "react";
import Portal from "@/components/ui/overlays/Portal";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";

type ModalShellProps = {
	ariaLabel?: string;
	children: React.ReactNode;
	isTopMost?: boolean;
	layerIndex?: number;
	onClose: () => void;
	placement?: "center" | "top";
	portalTargetId?: string;
};

type ModalShellContextValue = {
	beginSubmission: () => boolean;
	endSubmission: () => void;
	isSubmitting: boolean;
	onClose: () => void;
};
type ModalHeaderContextValue = { leadingIcon?: React.ReactNode };

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
	children,
	isTopMost = true,
	layerIndex,
	onClose,
	placement = "center",
	portalTargetId,
}: ModalShellProps) {
	const wrapperRef = React.useRef<HTMLDivElement | null>(null);
	const previousActiveElementRef = React.useRef<HTMLElement | null>(null);
	const submissionRef = React.useRef(false);
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

	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (!isTopMost) return;
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				if (!submissionRef.current) onClose();
				return;
			}
			if (event.key !== "Tab" || !wrapperRef.current) return;
			const focusable = getFocusableElements(wrapperRef.current);
			if (focusable.length === 0) {
				event.preventDefault();
				wrapperRef.current.focus();
				return;
			}
			const first = focusable[0];
			const last = focusable.at(-1);
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isTopMost, onClose]);
	React.useLayoutEffect(() => {
		previousActiveElementRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		const wrapper = wrapperRef.current;
		if (wrapper && isTopMost) {
			(getFocusableElements(wrapper)[0] ?? wrapper).focus();
		}
		return () => previousActiveElementRef.current?.focus();
	}, [isTopMost]);

	React.useEffect(() => {
		const body = document.body;
		const currentCount = Number(body.dataset.modalOpenCount ?? "0");
		if (currentCount === 0) {
			body.dataset.modalPrevOverflow = body.style.overflow;
			body.style.overflow = "hidden";
		}
		body.dataset.modalOpenCount = String(currentCount + 1);
		return () => {
			const nextCount = Number(body.dataset.modalOpenCount ?? "1") - 1;
			if (nextCount <= 0) {
				body.style.overflow = body.dataset.modalPrevOverflow ?? "";
				delete body.dataset.modalOpenCount;
				delete body.dataset.modalPrevOverflow;
			} else {
				body.dataset.modalOpenCount = String(nextCount);
			}
		};
	}, []);

	return (
		<Portal target={portalTargetId}>
			<div
				className={clsx(
					"fixed inset-0 z-50 flex justify-center overflow-hidden overscroll-contain px-4 sm:px-6",
					placement === "top"
						? "items-start py-[9vh]"
						: "items-center py-4 sm:py-6",
				)}
				data-modal-shell=""
				style={layerIndex ? { zIndex: layerIndex } : undefined}
			>
				<button
					aria-label="Close modal"
					className="absolute inset-0 bg-background/20 backdrop-blur-md"
					onClick={requestClose}
					type="button"
				/>
				<div
					aria-label={ariaLabel}
					aria-modal="true"
					className="relative flex max-h-[calc(100dvh-2rem)] w-full min-w-0 justify-center sm:max-h-[calc(100dvh-3rem)]"
					ref={wrapperRef}
					role="dialog"
					tabIndex={-1}
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
				</div>
			</div>
		</Portal>
	);
}

type ModalHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
	actions?: React.ReactNode;
	closeDisabled?: boolean;
	closeLabel?: string;
	leadingIcon?: React.ReactNode;
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
		<Card.Header className={clsx("border-b px-5 py-4", className)} {...props}>
			<ModalHeaderContext.Provider value={{ leadingIcon }}>
				{children}
			</ModalHeaderContext.Provider>
			{actions || (showCloseButton && closeHandler) ? (
				<Card.Action className="inline-flex items-center gap-1">
					{actions}
					{showCloseButton && closeHandler ? (
						<Button
							aria-label={closeLabel}
							autoFocus
							disabled={resolvedCloseDisabled}
							onClick={closeHandler}
							size="icon-sm"
							type="button"
							variant="ghost"
						>
							<span aria-hidden>×</span>
						</Button>
					) : null}
				</Card.Action>
			) : null}
		</Card.Header>
	);
}

export function ModalContent({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<Card.Content
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
		<Card.Footer
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
}: React.ComponentProps<typeof Card.Title> & {
	leadingIcon?: React.ReactNode;
}) {
	const headerContext = React.useContext(ModalHeaderContext);
	const resolvedLeadingIcon = leadingIcon ?? headerContext?.leadingIcon;
	return (
		<Card.Title
			className={clsx("inline-flex items-center gap-2 text-base", className)}
			{...props}
		>
			{resolvedLeadingIcon ? (
				<span className="inline-flex shrink-0 text-muted-foreground [&_svg]:size-4">
					{resolvedLeadingIcon}
				</span>
			) : null}
			{children}
		</Card.Title>
	);
}

export function ModalDescription(
	props: React.ComponentProps<typeof Card.Description>,
) {
	return <Card.Description {...props} />;
}
