import type { ReactNode, RefObject } from "react";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import type { ListboxOption } from "@/components/ui/primitives/Listbox";
import type {
	MarkdownEditorMentionOption,
	MarkdownToolbarInsertOption,
} from "./types";

export function markdownToolbarIcon(name: IconName) {
	return <Icon aria-hidden name={name} size="sm" />;
}

export function MarkdownToolbarButton({
	active = false,
	disabled,
	icon,
	onClick,
	title,
}: {
	active?: boolean;
	disabled?: boolean;
	icon: IconName;
	onClick: () => void;
	title: string;
}) {
	return (
		<Button
			aria-label={title}
			aria-pressed={active || undefined}
			className={active ? "!bg-foreground/10 !text-foreground" : undefined}
			disabled={disabled}
			onClick={onClick}
			size="icon-sm"
			title={title}
			type="button"
			variant="ghost"
		>
			{markdownToolbarIcon(icon)}
		</Button>
	);
}

export function MarkdownToolbarSection({
	ariaLabel,
	children,
	collapsed,
	disabled,
	merged,
	options,
	triggerIcon,
}: {
	ariaLabel: string;
	children: ReactNode;
	collapsed: boolean;
	disabled: boolean;
	merged: boolean;
	options: DropdownMenuOption[];
	triggerIcon: IconName;
}) {
	if (merged) return null;

	return (
		<div
			className={
				collapsed
					? "flex shrink-0 items-center"
					: "flex shrink-0 items-center gap-1 border-border/70 border-r pr-1.5 last:border-r-0"
			}
		>
			{collapsed ? (
				<Dropdown.Menu
					ariaLabel={ariaLabel}
					disabled={disabled}
					menuClassName="w-56 p-0"
					openOnHover={false}
					options={options}
					positionStrategy="fixed"
					triggerButtonProps={{
						size: "icon-sm",
						title: ariaLabel,
						type: "button",
						variant: "ghost",
					}}
					triggerContent={markdownToolbarIcon(triggerIcon)}
				/>
			) : (
				children
			)}
		</div>
	);
}

export function MarkdownToolbarTrailingActions({
	commandsDisabled,
	disabled,
	editorOptions,
	insertOptions,
	mentionOptions,
	onInsert,
	onMention,
	trailingActionsRef,
}: {
	commandsDisabled: boolean;
	disabled: boolean;
	editorOptions: DropdownMenuOption[];
	insertOptions: ListboxOption<MarkdownToolbarInsertOption>[];
	mentionOptions: ListboxOption<MarkdownEditorMentionOption>[];
	onInsert: (option: MarkdownToolbarInsertOption) => void;
	onMention: (member: MarkdownEditorMentionOption) => void;
	trailingActionsRef: RefObject<HTMLDivElement | null>;
}) {
	return (
		<div
			className="ml-auto flex shrink-0 items-center gap-1 pl-1.5"
			ref={trailingActionsRef}
		>
			<Dropdown.Listbox
				align="end"
				ariaLabel="Insert"
				disabled={commandsDisabled}
				menuClassName="w-48 p-0"
				onSelect={onInsert}
				options={insertOptions}
				positionStrategy="fixed"
				triggerButtonProps={{
					size: "icon-sm",
					title: "Insert",
					type: "button",
					variant: "ghost",
				}}
				triggerContent={markdownToolbarIcon("plus")}
			/>
			{mentionOptions.length > 0 ? (
				<Dropdown.Listbox
					align="end"
					ariaLabel="Mention a member"
					disabled={commandsDisabled}
					menuClassName="w-56 p-0"
					onSelect={onMention}
					options={mentionOptions}
					positionStrategy="fixed"
					triggerButtonProps={{
						size: "icon-sm",
						title: "Mention a member",
						type: "button",
						variant: "ghost",
					}}
					triggerContent={markdownToolbarIcon("at")}
				/>
			) : null}
			<span aria-hidden className="mx-0.5 h-5 border-border/70 border-l" />
			<Dropdown.Menu
				align="end"
				ariaLabel="Editor options"
				disabled={disabled}
				menuClassName="w-56 p-0"
				openOnHover={false}
				options={editorOptions}
				positionStrategy="fixed"
				triggerButtonProps={{
					size: "icon-sm",
					title: "Editor options",
					type: "button",
					variant: "ghost",
				}}
				triggerContent={markdownToolbarIcon("ellipsis")}
			/>
		</div>
	);
}
