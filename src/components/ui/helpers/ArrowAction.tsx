"use client";

import clsx from "clsx";
import type * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Button, type ButtonVariant } from "@/components/ui/primitives/Button";
import styles from "./ArrowAction.module.css";

type ArrowActionSharedProps = {
	className?: string;
	variant?: ButtonVariant;
};

type ArrowActionButtonProps = ArrowActionSharedProps & {
	"aria-label": string;
	decorative?: false;
	disabled?: boolean;
	href?: never;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	type?: "button" | "reset" | "submit";
};

type ArrowActionLinkProps = ArrowActionSharedProps & {
	"aria-label": string;
	decorative?: false;
	disabled?: boolean;
	href: string;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	rel?: string;
	target?: string;
};

type ArrowActionDecorativeProps = ArrowActionSharedProps & {
	decorative: true;
};

export type ArrowActionProps =
	| ArrowActionButtonProps
	| ArrowActionLinkProps
	| ArrowActionDecorativeProps;

function isArrowActionLink(
	props: ArrowActionButtonProps | ArrowActionLinkProps,
): props is ArrowActionLinkProps {
	return typeof props.href === "string";
}

function ArrowGlyphs() {
	return (
		<span aria-hidden="true" className={styles.iconStack}>
			<span
				className={clsx(styles.icon, styles.outgoing)}
				data-arrow-action-outgoing="true"
			>
				<Icon name="arrow-up-right" style={{ height: 12, width: 12 }} />
			</span>
			<span
				className={clsx(styles.icon, styles.incoming)}
				data-arrow-action-incoming="true"
			>
				<Icon name="arrow-up-right" style={{ height: 12, width: 12 }} />
			</span>
		</span>
	);
}

/** An icon-only action with the shared outgoing/incoming arrow transition. */
export function ArrowAction(props: ArrowActionProps) {
	const variant = props.variant ?? "secondary";

	if (props.decorative) {
		return (
			<span
				aria-hidden="true"
				className={clsx(styles.decorative, props.className)}
				data-arrow-action="decorative"
				data-testid="decorative-arrow-action"
				data-variant={variant}
			>
				<ArrowGlyphs />
			</span>
		);
	}

	if (isArrowActionLink(props)) {
		return (
			<Button
				aria-label={props["aria-label"]}
				className={clsx(styles.root, props.className)}
				data-arrow-action="interactive"
				disabled={props.disabled}
				href={props.href}
				onClick={props.onClick}
				rel={props.rel}
				size="icon"
				target={props.target}
				variant={variant}
			>
				<ArrowGlyphs />
			</Button>
		);
	}

	return (
		<Button
			aria-label={props["aria-label"]}
			className={clsx(styles.root, props.className)}
			data-arrow-action="interactive"
			disabled={props.disabled}
			onClick={props.onClick}
			size="icon"
			type={props.type}
			variant={variant}
		>
			<ArrowGlyphs />
		</Button>
	);
}
