import {
	type DirectiveEditorProps,
	useMdastNodeUpdater,
} from "@mdxeditor/editor";
import * as React from "react";
import {
	SelectInput,
	type SelectOption,
	TextInput,
} from "@/components/ui/input";
import { Button, type ButtonProps } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";

type DirectiveButtonVariant = NonNullable<ButtonProps["variant"]>;
type DirectiveButtonTone = NonNullable<ButtonProps["tone"]>;
type DirectiveButtonSize = Extract<
	NonNullable<ButtonProps["size"]>,
	"lg" | "md" | "sm" | "xl"
>;

const directiveVariantOptions: SelectOption<DirectiveButtonVariant>[] = [
	{ label: "Primary", value: "primary" },
	{ label: "Secondary", value: "secondary" },
	{ label: "Ghost", value: "ghost" },
	{ label: "Inverse", value: "inverse" },
];

const directiveToneOptions: SelectOption<DirectiveButtonTone>[] = [
	{ label: "Default", value: "default" },
	{ label: "Danger", value: "danger" },
];

const directiveSizeOptions: SelectOption<DirectiveButtonSize>[] = [
	{ label: "Small", value: "sm" },
	{ label: "Medium", value: "md" },
	{ label: "Large", value: "lg" },
	{ label: "Extra large", value: "xl" },
];

function isDirectiveVariant(value: string): value is DirectiveButtonVariant {
	return directiveVariantOptions.some((option) => option.value === value);
}

function isDirectiveTone(value: string): value is DirectiveButtonTone {
	return directiveToneOptions.some((option) => option.value === value);
}

function isDirectiveSize(value: string): value is DirectiveButtonSize {
	return directiveSizeOptions.some((option) => option.value === value);
}

function MarkdownButtonDirectiveEditor({ mdastNode }: DirectiveEditorProps) {
	const updateNode = useMdastNodeUpdater<never>();
	const [isEditing, setIsEditing] = React.useState(false);
	const attributes = mdastNode.attributes ?? {};
	const label =
		mdastNode.children
			?.map((child) =>
				"value" in child && typeof child.value === "string" ? child.value : "",
			)
			.join("")
			.trim() || "Button";
	const href = typeof attributes.href === "string" ? attributes.href : "/";
	const rawVariant =
		typeof attributes.variant === "string" ? attributes.variant : "";
	const rawTone = typeof attributes.tone === "string" ? attributes.tone : "";
	const rawSize = typeof attributes.size === "string" ? attributes.size : "";
	const variant = isDirectiveVariant(rawVariant) ? rawVariant : "primary";
	const tone = isDirectiveTone(rawTone) ? rawTone : "default";
	const size = isDirectiveSize(rawSize) ? rawSize : "md";

	function updateButton(next: {
		href?: string;
		label?: string;
		size?: DirectiveButtonSize;
		tone?: DirectiveButtonTone;
		variant?: DirectiveButtonVariant;
	}) {
		updateNode({
			attributes: {
				href: next.href ?? href,
				size: next.size ?? size,
				tone: next.tone ?? tone,
				variant: next.variant ?? variant,
			},
			children: [{ type: "text", value: next.label ?? label }],
		} as never);
	}

	return (
		<div className="not-prose my-3 grid gap-2" contentEditable={false}>
			<Button
				onClick={(event) => {
					event.preventDefault();
					setIsEditing(true);
				}}
				size={size}
				tone={tone}
				type="button"
				variant={variant}
			>
				{label}
			</Button>
			{isEditing ? (
				<Panel
					background="muted"
					border="subtle"
					className="grid max-w-xl gap-3"
					padding="sm"
				>
					<TextInput
						label="Label"
						onChange={(value) => updateButton({ label: value })}
						value={label}
					/>
					<TextInput
						inputMode="url"
						label="URL"
						onChange={(value) => updateButton({ href: value })}
						value={href}
					/>
					<div className="grid gap-3 sm:grid-cols-3">
						<SelectInput
							label="Variant"
							onChange={(value) => updateButton({ variant: value })}
							options={directiveVariantOptions}
							value={variant}
						/>
						<SelectInput
							label="Tone"
							onChange={(value) => updateButton({ tone: value })}
							options={directiveToneOptions}
							value={tone}
						/>
						<SelectInput
							label="Size"
							onChange={(value) => updateButton({ size: value })}
							options={directiveSizeOptions}
							value={size}
						/>
					</div>
					<div className="flex justify-end">
						<Button
							onClick={() => setIsEditing(false)}
							size="chip"
							type="button"
							variant="ghost"
						>
							Done
						</Button>
					</div>
				</Panel>
			) : null}
		</div>
	);
}

export const buttonDirectiveDescriptor = {
	Editor: MarkdownButtonDirectiveEditor,
	attributes: ["href", "size", "tone", "variant"],
	hasChildren: true,
	name: "button",
	testNode: (node: { name?: string; type?: string }) =>
		node.name === "button" && node.type === "leafDirective",
	type: "leafDirective" as const,
};
