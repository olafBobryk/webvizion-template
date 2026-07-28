"use client";

import clsx from "clsx";
import { focusRing } from "@/components/ui/foundations/focus";
import { Icon } from "@/components/ui/icons/Icon";

type ChoiceIndicatorBaseProps = {
	checked: boolean;
	disabled?: boolean;
	className?: string;
};

export type ChoiceIndicatorSize = "compact" | "default";

type ChoiceIndicatorMultiProps = ChoiceIndicatorBaseProps & {
	size?: ChoiceIndicatorSize;
};

const uncheckedIndicatorSurface =
	"bg-input group-hover:bg-input/80 dark:group-hover:bg-foreground/25 group-data-[tone=error]/field:bg-danger/15";

export function ChoiceIndicatorRadio({
	checked,
	disabled,
	className,
}: ChoiceIndicatorBaseProps) {
	return (
		<div
			className={clsx(
				"choice-field-indicator relative size-[22px] shrink-0 overflow-hidden rounded-full transition-colors motion-micro",
				focusRing.peerDefault,
				focusRing.peerError,
				disabled ? "opacity-60" : "opacity-100",
				checked
					? "bg-primary group-hover:bg-primary-hover group-active:bg-primary-active"
					: uncheckedIndicatorSurface,
				className,
			)}
		>
			<div
				className={clsx(
					"absolute inset-[5px] size-3 rounded-full bg-primary-foreground transition-[scale] motion-interactive",
					checked ? "scale-100" : "scale-0",
				)}
			/>
		</div>
	);
}

export function ChoiceIndicatorMulti({
	checked,
	disabled,
	className,
	size = "default",
}: ChoiceIndicatorMultiProps) {
	return (
		<div
			className={clsx(
				"choice-field-indicator relative shrink-0 overflow-hidden transition-colors motion-micro",
				size === "compact"
					? "size-[18px] rounded-[6px]"
					: "size-[22px] rounded-[8px]",
				focusRing.peerDefault,
				focusRing.peerError,
				disabled ? "opacity-60" : "opacity-100",
				checked
					? "bg-primary group-hover:bg-primary-hover group-active:bg-primary-active"
					: uncheckedIndicatorSurface,
				className,
			)}
		>
			<Icon
				aria-hidden
				name="check"
				size="sm"
				className={clsx(
					"absolute text-primary-foreground transition-[scale] motion-interactive",
					size === "compact" ? "inset-[3px]" : "inset-[5px]",
					checked ? "scale-100" : "scale-0",
				)}
			/>
		</div>
	);
}

export function ChoiceIndicatorToggle({
	checked,
	disabled,
	className,
	size = "default",
}: ChoiceIndicatorBaseProps & { size?: ChoiceIndicatorSize }) {
	return (
		<div
			className={clsx(
				"choice-field-indicator relative shrink-0 overflow-hidden rounded-full transition-colors motion-micro",
				size === "compact" ? "h-5 min-w-[34px]" : "h-[26px] min-w-[42px]",
				focusRing.peerDefault,
				focusRing.peerError,
				disabled ? "opacity-60" : "opacity-100",
				checked
					? "bg-primary group-hover:bg-primary-hover group-active:bg-primary-active"
					: uncheckedIndicatorSurface,
				className,
			)}
		>
			<div
				className={clsx(
					size === "compact"
						? "absolute left-0.5 rounded-full transition-[background-color,translate,box-shadow] motion-interactive"
						: "absolute left-1 rounded-full transition-[background-color,translate,box-shadow] motion-interactive",
					size === "compact" ? "top-0.5 size-4" : "top-1 h-[18px] w-[22px]",
					checked
						? size === "compact"
							? "translate-x-[calc(34px-1.25rem)] bg-primary-foreground shadow-sm"
							: "translate-x-[calc(20px-0.5rem)] bg-primary-foreground shadow-sm"
						: "translate-x-0 bg-white shadow-sm dark:bg-muted-foreground",
				)}
			/>
		</div>
	);
}
