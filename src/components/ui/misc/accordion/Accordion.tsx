import clsx from "clsx";
import { Icon } from "@/components/ui/icons/Icon";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import type {
	AccordionActionProps,
	AccordionCardProps,
	AccordionCardSkeletonProps,
	AccordionContentProps,
	AccordionDescriptionProps,
	AccordionFooterProps,
	AccordionHeaderProps,
	AccordionProps,
	AccordionSkeletonProps,
	AccordionTitleProps,
} from "./Accordion.shared";
import {
	AccordionCardAction,
	AccordionCardClient,
	AccordionCardContent,
	AccordionCardDescription,
	AccordionCardFooter,
	AccordionCardHeader,
	AccordionCardTitle,
	AccordionClient,
} from "./AccordionClient";

export type {
	AccordionActionProps,
	AccordionCardProps,
	AccordionCardSkeletonProps,
	AccordionContentProps,
	AccordionDescriptionProps,
	AccordionFooterProps,
	AccordionHeaderProps,
	AccordionProps,
	AccordionSkeletonProps,
	AccordionTitleProps,
};

function AccordionRoot(props: AccordionProps) {
	return <AccordionClient {...props} />;
}

function AccordionSkeleton({
	children,
	className,
	contentClassName,
	description,
	descriptionClassName,
	leadingIcon = false,
	open = false,
	title = "Accordion title",
	titleClassName,
	trailingIcon = true,
	triggerClassName,
}: AccordionSkeletonProps) {
	return (
		<div
			aria-hidden="true"
			className={clsx(
				"pointer-events-none rounded-none border-0 bg-transparent",
				className,
			)}
			data-open={open ? "true" : "false"}
		>
			<div
				className={clsx(
					"flex min-h-0 w-full items-center gap-1.5 rounded-none px-0 py-2.5",
					triggerClassName,
				)}
			>
				{leadingIcon ? (
					<span className="grid size-6 shrink-0 place-items-center">
						<Icon.Skeleton size="sm" />
					</span>
				) : null}
				<span className="grid min-w-0 flex-1 gap-0.5">
					<Text.Skeleton
						as="span"
						textClassName={clsx("font-medium", titleClassName)}
						variant="support"
					>
						{title}
					</Text.Skeleton>
					{description ? (
						<Text.Skeleton
							as="span"
							textClassName={descriptionClassName}
							tone="muted"
							variant="caption"
						>
							{description}
						</Text.Skeleton>
					) : null}
				</span>
				{trailingIcon ? (
					<span className="grid size-6 shrink-0 place-items-center">
						<Icon.Skeleton size="sm" />
					</span>
				) : null}
			</div>
			{open ? (
				<div className={clsx("border-t-0 px-0 py-3", contentClassName)}>
					{children ?? (
						<div className="grid gap-2">
							<Skeleton className="h-4 w-full rounded-md" />
							<Skeleton className="h-4 w-3/4 rounded-md" />
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}

function AccordionCardSkeleton({
	action,
	actionClassName,
	children,
	className,
	contentClassName,
	description,
	descriptionClassName,
	footer,
	footerClassName,
	headerClassName,
	open = false,
	title = "Accordion card title",
	titleClassName,
	trailingIcon = true,
	...cardProps
}: AccordionCardSkeletonProps) {
	return (
		<Card
			{...cardProps}
			aria-hidden="true"
			className={clsx(
				"pointer-events-none !pb-4 data-[open=false]:gap-0 data-[size=sm]:!pb-3",
				className,
			)}
			data-open={open ? "true" : "false"}
		>
			<CardHeader
				className={clsx(
					"grid-cols-[minmax(0,1fr)_auto_auto]",
					headerClassName,
					!open && "!border-transparent !pb-0",
				)}
				style={{ gridTemplateColumns: "minmax(0, 1fr) auto auto" }}
			>
				<CardTitle
					className={clsx("!col-start-1 !row-start-1", titleClassName)}
				>
					<Text.Skeleton
						as="span"
						interactive={null}
						theme={null}
						tone={null}
						variant={null}
					>
						{title}
					</Text.Skeleton>
				</CardTitle>
				{description ? (
					<CardDescription
						className={clsx("!col-start-1 !row-start-2", descriptionClassName)}
					>
						<Text.Skeleton
							as="span"
							interactive={null}
							theme={null}
							tone={null}
							variant={null}
						>
							{description}
						</Text.Skeleton>
					</CardDescription>
				) : null}
				{action ? (
					<CardAction
						className={clsx(
							"!col-start-2 !row-start-1 flex items-center gap-2 self-center",
							actionClassName,
						)}
					>
						{action}
					</CardAction>
				) : null}
				{trailingIcon ? (
					<CardAction className="!col-start-3 !row-start-1 self-center">
						<span className="grid size-8 place-items-center">
							<Icon.Skeleton size="sm" />
						</span>
					</CardAction>
				) : null}
			</CardHeader>
			{open ? (
				<CardContent className={contentClassName}>
					{children ?? (
						<div className="grid gap-2">
							<Skeleton className="h-4 w-full rounded-md" />
							<Skeleton className="h-4 w-3/4 rounded-md" />
						</div>
					)}
				</CardContent>
			) : null}
			{open && footer ? (
				<CardFooter className={clsx(footerClassName, "!pb-0")}>
					{footer}
				</CardFooter>
			) : null}
		</Card>
	);
}

const AccordionCard = Object.assign(AccordionCardClient, {
	Skeleton: AccordionCardSkeleton,
});

export const Accordion = Object.assign(AccordionRoot, {
	Skeleton: AccordionSkeleton,
	Card: AccordionCard,
	Header: AccordionCardHeader,
	Title: AccordionCardTitle,
	Description: AccordionCardDescription,
	Action: AccordionCardAction,
	Content: AccordionCardContent,
	Footer: AccordionCardFooter,
});
