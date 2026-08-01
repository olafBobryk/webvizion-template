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
	const indicator = (
		<div
			className={clsx(
				"choice-field-indicator relative h-[26px] min-w-[42px] shrink-0 overflow-hidden rounded-full transition-colors motion-micro",
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
					"absolute left-1 top-1 h-[18px] w-[22px] rounded-full transition-[background-color,translate,box-shadow] motion-interactive",
					checked
						? "translate-x-[calc(20px-0.5rem)] bg-primary-foreground shadow-sm"
						: "translate-x-0 bg-white shadow-sm dark:bg-muted-foreground",
				)}
			/>
		</div>
	);

	if (size === "default") return indicator;

	return (
		<div className="relative h-5 min-w-[34px] shrink-0">
			<div className="absolute left-1/2 top-1/2 h-[26px] w-[42px] -translate-x-1/2 -translate-y-1/2">
				<div
					className="h-[26px] w-[42px] origin-center"
					style={{ transform: `scale(${10 / 13})` }}
				>
					{indicator}
				</div>
			</div>
		</div>
	);
}
