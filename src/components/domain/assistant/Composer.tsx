"use client";

import * as React from "react";
import { IconSwap } from "@/components/ui/helpers/IconSwap";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { FileInput, type FileInputItem } from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { InputFrame } from "@/components/ui/primitives/InputFrame";
import type {
	AssistantFixtureScenario,
	AssistantStagedAttachment,
	AssistantToolMode,
} from "@/lib/assistant/contracts";

const fixtureScenarioPresentation: Array<{
	icon: IconName;
	label: string;
	scenario: AssistantFixtureScenario;
}> = [
	{
		icon: "sparkle",
		label: "Random lifecycle turn",
		scenario: "random_turn",
	},
	{
		icon: "pencil",
		label: "Tool call + approval",
		scenario: "tool_approval",
	},
	{
		icon: "chat",
		label: "Plain response",
		scenario: "plain_response",
	},
	{
		icon: "code",
		label: "Markdown stress test",
		scenario: "markdown_stress",
	},
	{ icon: "database", label: "Record list report", scenario: "records_list" },
	{ icon: "eye", label: "Record detail report", scenario: "record_get" },
	{ icon: "warning", label: "Record error", scenario: "record_error" },
	{ icon: "plus", label: "Create Record approval", scenario: "record_create" },
	{
		icon: "pencil",
		label: "Update Record comparison",
		scenario: "record_update",
	},
	{
		icon: "archive",
		label: "Archive Record comparison",
		scenario: "record_archive",
	},
	{
		icon: "trash",
		label: "Delete Record comparison",
		scenario: "record_delete",
	},
];

const toolModePresentation: Record<
	AssistantToolMode,
	{ icon: IconName; label: string }
> = {
	off: {
		icon: "close",
		label: "No tools",
	},
	read_only: {
		icon: "eye",
		label: "Read only",
	},
	read_write: {
		icon: "pencil",
		label: "Read & edit",
	},
};

function ComposerAddMenu({
	disabled,
	onAttachFiles,
	onRunFixture,
}: {
	disabled?: boolean;
	onAttachFiles: () => void;
	onRunFixture?: (scenario: AssistantFixtureScenario, label: string) => void;
}) {
	return (
		<Dropdown.Menu
			ariaLabel="Add context"
			disabled={disabled}
			openOnHover={false}
			options={[
				{
					id: "attach-files",
					label: "Attach files",
					leadingIcon: <Icon name="paperclip" size="sm" />,
					onSelect: onAttachFiles,
				},
				...(onRunFixture
					? fixtureScenarioPresentation.map((fixture, index) => ({
							dividerBefore: index === 0,
							id: `assistant-fixture-${fixture.scenario}`,
							label: `Fixture: ${fixture.label}`,
							leadingIcon: <Icon name={fixture.icon} size="sm" />,
							onSelect: () => onRunFixture(fixture.scenario, fixture.label),
						}))
					: []),
			]}
			positionStrategy="fixed"
			triggerContent={<Icon name="plus" />}
		/>
	);
}

function ToolModeMenu({
	disabled,
	modes,
	onChange,
	value,
}: {
	disabled: boolean;
	modes: AssistantToolMode[];
	onChange: (mode: AssistantToolMode) => void;
	value: AssistantToolMode;
}) {
	const current = toolModePresentation[value];

	return (
		<Dropdown.Listbox
			ariaLabel={`Tool permissions: ${current.label}`}
			disabled={disabled}
			openOnHover={false}
			onSelect={(mode) => onChange(mode)}
			options={modes.map((mode) => {
				const option = toolModePresentation[mode];
				return {
					content: (
						<span className="flex items-center gap-2">
							<Icon name={option.icon} size="sm" />
							<span>{option.label}</span>
						</span>
					),
					key: `assistant-tool-mode-${mode}`,
					selected: mode === value,
					tone: mode === "read_write" ? "warning" : undefined,
					value: mode,
				};
			})}
			positionStrategy="fixed"
			triggerButtonProps={{
				className: value === "read_write" ? "!text-warning" : undefined,
				variant: "ghost",
			}}
			triggerContent={<Icon name={current.icon} />}
		/>
	);
}

export function Composer({
	attachments,
	busy,
	canWrite,
	disabled,
	fixtureEnabled = false,
	onAddFiles,
	onRemoveAttachment,
	onStop,
	onSubmit,
	onToolModeChange,
	toolMode,
}: {
	attachments: AssistantStagedAttachment[];
	busy: boolean;
	canWrite: boolean;
	disabled?: boolean;
	fixtureEnabled?: boolean;
	onAddFiles: (files: File[]) => void;
	onRemoveAttachment: (attachment: AssistantStagedAttachment) => void;
	onStop: () => void;
	onSubmit: (text: string, fixtureScenario?: AssistantFixtureScenario) => void;
	onToolModeChange: (mode: AssistantToolMode) => void;
	toolMode: AssistantToolMode;
}) {
	const [text, setText] = React.useState("");
	const fileRef = React.useRef<HTMLInputElement>(null);
	const submit = () => {
		if ((!text.trim() && attachments.length === 0) || busy || disabled) return;
		onSubmit(text);
		setText("");
	};
	const modes: AssistantToolMode[] = canWrite
		? ["read_write", "read_only", "off"]
		: ["read_only", "off"];
	const fileItems: FileInputItem[] = attachments.map((attachment) => ({
		key: attachment.id,
		name: attachment.filename,
		status: "uploaded",
		type: attachment.contentType,
		unoptimized: true,
		url: attachment.accessUrl,
	}));
	return (
		<div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
			<InputFrame
				className="h-auto"
				contentClassName="grid w-full min-w-0 gap-2 p-2"
				fullWidth
				presentation="composer"
			>
				{attachments.length > 0 ? (
					<FileInput
						className="px-1 pt-1"
						items={fileItems}
						label={null}
						onItemsChange={(nextItems) => {
							const retainedIds = new Set(
								nextItems.flatMap((item) =>
									item.status === "uploaded" && item.key ? [item.key] : [],
								),
							);
							for (const attachment of attachments) {
								if (!retainedIds.has(attachment.id)) {
									onRemoveAttachment(attachment);
								}
							}
						}}
						showAddControl={false}
					/>
				) : null}
				<textarea
					aria-label="Message Assistant"
					className="max-h-40 min-h-12 w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
					disabled={disabled}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							submit();
						}
					}}
					placeholder="Ask about your records…"
					rows={2}
					value={text}
				/>
				<div className="flex items-center gap-1">
					<input
						accept="application/pdf,image/jpeg,image/png,image/webp"
						className="sr-only"
						multiple
						onChange={(event) => {
							onAddFiles(Array.from(event.target.files ?? []));
							event.target.value = "";
						}}
						ref={fileRef}
						type="file"
					/>
					<ComposerAddMenu
						disabled={disabled}
						onAttachFiles={() => fileRef.current?.click()}
						onRunFixture={
							fixtureEnabled
								? (scenario, label) => onSubmit(`Fixture: ${label}`, scenario)
								: undefined
						}
					/>
					<ToolModeMenu
						disabled={busy}
						modes={modes}
						onChange={onToolModeChange}
						value={toolMode}
					/>
					<div className="ml-auto">
						<Button
							aria-label={busy ? "Stop" : "Send message"}
							onClick={busy ? onStop : submit}
							size="icon-sm"
							variant="primary"
						>
							<IconSwap
								activeIndex={busy ? 1 : 0}
								items={[
									{ icon: <Icon name="arrow-up" size="sm" />, key: "send" },
									{
										icon: <Icon name="stop" size="sm" weight="fill" />,
										key: "stop",
									},
								]}
								size="sm"
							/>
						</Button>
					</div>
				</div>
			</InputFrame>
			<p className="mt-2 text-center text-muted-foreground text-xs">
				Assistant can make mistakes. Record changes always require approval.
			</p>
		</div>
	);
}
