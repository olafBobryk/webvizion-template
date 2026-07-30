import { focusRing } from "@/components/ui/foundations/focus";

export type DropdownOptionTone = "default" | "warning" | "danger";

type DropdownOptionClassOptions = {
	active?: boolean;
	selected?: boolean;
	disabled?: boolean;
	dividerAfter?: boolean;
	dividerBefore?: boolean;
	layout?: "default" | "presentation";
	tone?: DropdownOptionTone;
	className?: string;
	activeClassName?: string;
	selectedClassName?: string;
	disabledClassName?: string;
};

export const dropdownListWrapperClassName = "flex flex-col gap-0 p-0";
export const dropdownListClassName =
	"flex max-h-[252px] flex-col gap-0 overflow-y-auto p-0";
export const dropdownEmptyStateClassName = "px-4 py-3";
export const dropdownSurfaceClassName =
	"overflow-hidden rounded-[10px] border border-border bg-card text-card-foreground shadow-[2px_4px_15px_-2px_rgba(1,1,3,0.05)]";
export const dropdownOptionBaseClassName =
	"flex w-full min-w-0 items-center gap-2.5 !border-0 !bg-clip-border !px-[15px] !py-2.5 text-left text-sm text-foreground/80 !transition-none";
export const dropdownPresentationOptionClassName =
	"!h-auto !min-h-16 !gap-0 !px-3 !py-3";
export const dropdownOptionRadiusClassName = "rounded-none";

export function getDropdownOptionClassName({
	active,
	selected,
	disabled,
	dividerAfter,
	dividerBefore,
	layout = "default",
	tone = "default",
	className,
	activeClassName,
	selectedClassName,
	disabledClassName,
}: DropdownOptionClassOptions = {}) {
	return [
		dropdownOptionBaseClassName,
		layout === "presentation" ? dropdownPresentationOptionClassName : undefined,
		dropdownOptionRadiusClassName,
		dividerBefore ? "!border-t !border-border" : undefined,
		dividerAfter ? "!border-b !border-border" : undefined,
		focusRing.visibleDefault,
		selected && tone === "default" ? "!text-foreground" : undefined,
		active && !disabled && tone === "default"
			? "[&&]:!bg-foreground/5 !text-foreground"
			: undefined,
		tone === "danger"
			? [
					"!text-danger",
					disabled ? undefined : "[&&]:hover:!bg-danger/10 hover:!text-danger",
				]
					.filter(Boolean)
					.join(" ")
			: undefined,
		tone === "warning"
			? [
					"!text-warning",
					disabled
						? undefined
						: "[&&]:hover:!bg-warning-accent/10 hover:!text-warning",
				]
					.filter(Boolean)
					.join(" ")
			: undefined,
		active && !disabled && tone === "danger"
			? "[&&]:!bg-danger/10 !text-danger"
			: undefined,
		active && !disabled && tone === "warning"
			? "[&&]:!bg-warning-accent/10 !text-warning"
			: undefined,
		disabled
			? "cursor-not-allowed opacity-50 [&&]:hover:!bg-transparent [&&]:hover:!opacity-50 [&&]:active:!opacity-50"
			: [
					"cursor-pointer",
					tone === "default" ? "[&&]:hover:!bg-foreground/5" : undefined,
					"[&&]:hover:!opacity-100 [&&]:active:!opacity-100",
				]
					.filter(Boolean)
					.join(" "),
		className,
		active ? activeClassName : undefined,
		selected ? selectedClassName : undefined,
		disabled ? disabledClassName : undefined,
	]
		.filter(Boolean)
		.join(" ");
}
