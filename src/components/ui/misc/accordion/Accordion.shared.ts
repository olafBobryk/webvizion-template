import type * as React from "react";
import type { Card, CardProps } from "@/components/ui/primitives/surfaces";

export type AccordionStateProps = {
	defaultOpen?: boolean;
	disabled?: boolean;
	disableWhenReducedMotion?: boolean;
	forceReducedMotion?: boolean;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
};

export type AccordionTriggerRenderProps = {
	"aria-controls": string;
	"aria-expanded": boolean;
	disabled: boolean;
	onClick: () => void;
	type: "button";
};

export type AccordionProps = AccordionStateProps & {
	buttonClassName?: string;
	children?: React.ReactNode;
	className?: string;
	contentClassName?: string;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	iconClassName?: string;
	renderTrigger?: (props: AccordionTriggerRenderProps) => React.ReactNode;
	title: React.ReactNode;
	titleClassName?: string;
	triggerClassName?: string;
};

export type AccordionSkeletonProps = {
	children?: React.ReactNode;
	className?: string;
	contentClassName?: string;
	description?: React.ReactNode;
	descriptionClassName?: string;
	leadingIcon?: boolean;
	open?: boolean;
	title?: React.ReactNode;
	titleClassName?: string;
	trailingIcon?: boolean;
	triggerClassName?: string;
};

export type AccordionCardProps = Omit<CardProps, "children"> &
	AccordionStateProps & {
		children: React.ReactNode;
	};

export type AccordionHeaderProps = React.ComponentPropsWithoutRef<
	typeof Card.Header
>;

export type AccordionTitleProps = React.ComponentPropsWithoutRef<
	typeof Card.Title
>;

export type AccordionDescriptionProps = React.ComponentPropsWithoutRef<
	typeof Card.Description
>;

export type AccordionActionProps = React.ComponentPropsWithoutRef<
	typeof Card.Action
>;

export type AccordionContentProps = React.ComponentPropsWithoutRef<
	typeof Card.Content
>;

export type AccordionFooterProps = React.ComponentPropsWithoutRef<
	typeof Card.Footer
>;

export type AccordionCardSkeletonProps = Omit<
	AccordionCardProps,
	keyof AccordionStateProps | "children"
> & {
	action?: React.ReactNode;
	actionClassName?: string;
	children?: React.ReactNode;
	contentClassName?: string;
	description?: React.ReactNode;
	descriptionClassName?: string;
	footer?: React.ReactNode;
	footerClassName?: string;
	headerClassName?: string;
	open?: boolean;
	title?: React.ReactNode;
	titleClassName?: string;
	trailingIcon?: boolean;
};
