"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { spring } from "@/components/ui/foundations/spring";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import type {
	AccordionActionProps,
	AccordionCardProps,
	AccordionContentProps,
	AccordionDescriptionProps,
	AccordionFooterProps,
	AccordionHeaderProps,
	AccordionProps,
	AccordionStateProps,
	AccordionTitleProps,
	AccordionTriggerRenderProps,
} from "./Accordion.shared";

const {
	Action: CardAction,
	Content: CardContent,
	Description: CardDescription,
	Footer: CardFooter,
	Header: CardHeader,
	Title: CardTitle,
} = Card;

type DisclosureState = {
	contentId: string;
	disabled: boolean;
	handleToggle: () => void;
	isContentOverflowVisible: boolean;
	isOpen: boolean;
	setIsContentOverflowVisible: React.Dispatch<React.SetStateAction<boolean>>;
	shouldAnimate: boolean;
	titleId: string;
};

const AccordionCardContext = React.createContext<DisclosureState | null>(null);

function useAccordionCardContext(componentName: string) {
	const context = React.useContext(AccordionCardContext);
	if (!context) {
		throw new Error(`${componentName} must be used inside Accordion.Card.`);
	}
	return context;
}

function useDisclosureState({
	defaultOpen = false,
	disabled = false,
	disableWhenReducedMotion = true,
	forceReducedMotion,
	onOpenChange,
	open,
}: AccordionStateProps): DisclosureState {
	const id = React.useId().replace(/:/g, "");
	const contentId = `accordion-content-${id}`;
	const titleId = `accordion-title-${id}`;
	const isControlled = open !== undefined;
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
	const isOpen = isControlled ? open : internalOpen;
	const motionAllowed = useMotionAllowed(disableWhenReducedMotion);
	const shouldAnimate = motionAllowed && forceReducedMotion !== true;
	const [isContentOverflowVisible, setIsContentOverflowVisible] =
		React.useState(() => Boolean(open ?? defaultOpen));

	React.useEffect(() => {
		if (!isOpen || !shouldAnimate) setIsContentOverflowVisible(isOpen);
	}, [isOpen, shouldAnimate]);

	function handleToggle() {
		if (disabled) return;
		const nextOpen = !isOpen;
		if (!isControlled) setInternalOpen(nextOpen);
		onOpenChange?.(nextOpen);
	}

	return {
		contentId,
		disabled,
		handleToggle,
		isContentOverflowVisible,
		isOpen,
		setIsContentOverflowVisible,
		shouldAnimate,
		titleId,
	};
}

function CollapsibleRegion({
	children,
	className,
	includeId = true,
	state,
}: {
	children: React.ReactNode;
	className?: string;
	includeId?: boolean;
	state: DisclosureState;
}) {
	if (state.shouldAnimate) {
		return (
			<AnimatePresence initial={false}>
				{state.isOpen ? (
					<motion.div
						animate={{ height: "auto", opacity: 1 }}
						className={clsx(
							state.isContentOverflowVisible
								? "!overflow-visible"
								: "overflow-hidden",
							className,
						)}
						exit={{ height: 0, opacity: 0 }}
						id={includeId ? state.contentId : undefined}
						initial={{ height: 0, opacity: 0 }}
						onAnimationComplete={() => {
							if (state.isOpen) state.setIsContentOverflowVisible(true);
						}}
						transition={spring.disclosure}
					>
						{children}
					</motion.div>
				) : null}
			</AnimatePresence>
		);
	}

	return state.isOpen ? (
		<div
			className={clsx("!overflow-visible", className)}
			id={includeId ? state.contentId : undefined}
		>
			{children}
		</div>
	) : null;
}

export function AccordionClient({
	buttonClassName,
	children,
	className,
	contentClassName,
	defaultOpen = false,
	description,
	disabled = false,
	disableWhenReducedMotion = true,
	forceReducedMotion,
	icon,
	iconClassName,
	onOpenChange,
	open,
	renderTrigger,
	title,
	titleClassName,
	triggerClassName,
}: AccordionProps) {
	const state = useDisclosureState({
		defaultOpen,
		disabled,
		disableWhenReducedMotion,
		forceReducedMotion,
		onOpenChange,
		open,
	});
	const triggerProps = {
		"aria-controls": state.contentId,
		"aria-expanded": state.isOpen,
		disabled: state.disabled,
		onClick: state.handleToggle,
		type: "button" as const,
	} satisfies AccordionTriggerRenderProps;

	return (
		<div
			className={clsx(
				"group/accordion rounded-none border-0 bg-transparent transition-colors motion-micro",
				disabled && "opacity-60",
				className,
			)}
			data-open={state.isOpen ? "true" : "false"}
		>
			{renderTrigger ? (
				renderTrigger(triggerProps)
			) : (
				<Button
					align="left"
					className={clsx(
						"!min-h-0 w-full !rounded-md !border-0 !px-0 !py-2.5 hover:!bg-transparent hover:opacity-70 disabled:!opacity-100",
						buttonClassName,
						triggerClassName,
					)}
					contentClassName="w-full gap-1.5"
					size="none"
					{...triggerProps}
					variant="ghost"
				>
					{icon ? (
						<span
							className={clsx(
								"grid size-6 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5",
								iconClassName,
							)}
						>
							{icon}
						</span>
					) : null}
					<span className="grid min-w-0 flex-1 gap-0.5">
						<Text
							as="span"
							className={clsx("font-medium", titleClassName)}
							variant="support"
						>
							{title}
						</Text>
						{description ? (
							<Text as="span" tone="muted" variant="caption">
								{description}
							</Text>
						) : null}
					</span>
					<span
						aria-hidden
						className="grid size-6 shrink-0 place-items-center text-muted-foreground transition-transform motion-micro group-data-[open=true]/accordion:rotate-180"
					>
						<Icon name="chevron-down" size="sm" />
					</span>
				</Button>
			)}
			<CollapsibleRegion state={state}>
				<div className={clsx("border-t-0 px-0 py-3", contentClassName)}>
					{children}
				</div>
			</CollapsibleRegion>
		</div>
	);
}

function AccordionCardToggle() {
	const state = useAccordionCardContext("Accordion.Card toggle");

	return (
		<Button
			aria-controls={state.contentId}
			aria-expanded={state.isOpen}
			aria-label={state.isOpen ? "Collapse section" : "Expand section"}
			aria-labelledby={state.titleId}
			disabled={state.disabled}
			onClick={state.handleToggle}
			size="icon-sm"
			variant="ghost"
		>
			<Icon
				aria-hidden
				className={clsx(
					"transition-transform motion-micro",
					state.isOpen && "rotate-180",
				)}
				name="chevron-down"
				size="sm"
			/>
		</Button>
	);
}

export function AccordionCardHeader({
	children,
	className,
	style,
	...props
}: AccordionHeaderProps) {
	const state = useAccordionCardContext("Accordion.Header");

	return (
		<CardHeader
			{...props}
			className={clsx(
				"grid-cols-[minmax(0,1fr)_auto_auto] transition-[padding,border-color] motion-micro",
				className,
				!state.isOpen && "!border-transparent !pb-0",
			)}
			style={{
				...style,
				gridTemplateColumns: "minmax(0, 1fr) auto auto",
			}}
		>
			{children}
			<CardAction className="!col-start-3 !row-start-1 self-center">
				<AccordionCardToggle />
			</CardAction>
		</CardHeader>
	);
}

export function AccordionCardTitle({
	className,
	...props
}: AccordionTitleProps) {
	const state = useAccordionCardContext("Accordion.Title");
	return (
		<CardTitle
			className={clsx("!col-start-1 !row-start-1", className)}
			{...props}
			id={state.titleId}
		/>
	);
}

export function AccordionCardDescription({
	className,
	...props
}: AccordionDescriptionProps) {
	return (
		<CardDescription
			className={clsx("!col-start-1 !row-start-2", className)}
			{...props}
		/>
	);
}

export function AccordionCardAction({
	children,
	className,
	...props
}: AccordionActionProps) {
	return (
		<CardAction
			className={clsx(
				"!col-start-2 !row-start-1 flex items-center gap-2 self-center",
				className,
			)}
			{...props}
		>
			{children}
		</CardAction>
	);
}

export function AccordionCardContent(props: AccordionContentProps) {
	const state = useAccordionCardContext("Accordion.Content");
	return (
		<CollapsibleRegion state={state}>
			<CardContent {...props} />
		</CollapsibleRegion>
	);
}

export function AccordionCardFooter({
	className,
	...props
}: AccordionFooterProps) {
	const state = useAccordionCardContext("Accordion.Footer");
	return (
		<CollapsibleRegion includeId={false} state={state}>
			<CardFooter className={clsx(className, "!pb-0")} {...props} />
		</CollapsibleRegion>
	);
}

export function AccordionCardClient({
	children,
	className,
	defaultOpen = false,
	disabled = false,
	disableWhenReducedMotion = true,
	forceReducedMotion,
	onOpenChange,
	open,
	...cardProps
}: AccordionCardProps) {
	const state = useDisclosureState({
		defaultOpen,
		disabled,
		disableWhenReducedMotion,
		forceReducedMotion,
		onOpenChange,
		open,
	});
	return (
		<AccordionCardContext.Provider value={state}>
			<Card
				{...cardProps}
				className={clsx(
					"group/accordion-card !pb-4 transition-[gap] motion-micro data-[open=false]:gap-0 data-[size=sm]:!pb-3",
					disabled && "opacity-60",
					className,
				)}
				data-open={state.isOpen ? "true" : "false"}
			>
				{children}
			</Card>
		</AccordionCardContext.Provider>
	);
}
