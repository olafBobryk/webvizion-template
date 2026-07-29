import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const owners = [
	["src/components/ui/input/text/TextInput.tsx", "TextInput"],
	["src/components/ui/input/numeric/NumberInput.tsx", "NumberInput"],
	["src/components/ui/input/numeric/UnitNumberInput.tsx", "UnitNumberInput"],
	["src/components/ui/input/text/TextAreaInput.tsx", "TextAreaInput"],
	["src/components/ui/input/selection/SelectInput.tsx", "SelectInput"],
	[
		"src/components/ui/input/selection/ComboboxTextInput.tsx",
		"ComboboxTextInput",
	],
	[
		"src/components/ui/input/selection/ComboboxMultiSelectInput.tsx",
		"ComboboxMultiSelectInput",
	],
	[
		"src/components/ui/input/selection/ButtonMultiSelectInput.tsx",
		"ButtonMultiSelectInput",
	],
	["src/components/ui/input/choice/MultiselectInput.tsx", "MultiselectInput"],
	["src/components/ui/input/date/DateInput.tsx", "DateInput"],
	["src/components/ui/input/date/DateRangeInput.tsx", "DateRangeInput"],
	["src/components/ui/input/color/ColorInput.tsx", "ColorInput"],
	["src/components/ui/input/color/ColorSwatchInput.tsx", "ColorSwatchInput"],
	["src/components/ui/input/text/PhoneInput.tsx", "PhoneInput"],
	[
		"src/components/ui/input/files/ProfilePictureInput.tsx",
		"ProfilePictureInput",
	],
	["src/components/ui/input/numeric/SliderInput.tsx", "SliderInput"],
	["src/components/ui/input/SignatureInput.tsx", "SignatureInput"],
	[
		"src/components/ui/input/editable/EditableTextField.tsx",
		"EditableTextField",
	],
	["src/components/ui/input/files/FileInput.tsx", "FileInput"],
	["src/components/ui/input/files/FilePreview.tsx", "FilePreview"],
	["src/components/ui/misc/PaginationControls.tsx", "PaginationControls"],
	["src/components/ui/misc/SocialLinks.tsx", "SocialLinks"],
	["src/components/ui/time/DateAgo.tsx", "DateAgo"],
	["src/components/ui/time/DateIndicator.tsx", "DateIndicator"],
	["src/components/composites/markdown/MarkdownEditor.tsx", "MarkdownEditor"],
	[
		"src/lib/marketing-content/sections/homeHero/HomeHeroSection.tsx",
		"HomeHeroSection",
	],
] as const;

const thinOwners = [
	[
		"template-profiles/thin-start/overrides/src/components/ui/input/choice/ChoiceField.tsx",
		"ChoiceField",
	],
	[
		"template-profiles/thin-start/overrides/src/components/ui/input/choice/RadioInput.tsx",
		"RadioInput",
	],
	[
		"template-profiles/thin-start/overrides/src/components/ui/input/choice/ToggleInput.tsx",
		"ToggleInput",
	],
	[
		"template-profiles/thin-start/overrides/src/components/ui/input/choice/MultiselectInput.tsx",
		"MultiselectInput",
	],
	[
		"template-profiles/thin-start/overrides/src/components/ui/input/text/TextInput.tsx",
		"TextInput",
	],
	[
		"template-profiles/thin-start/overrides/src/components/ui/input/selection/SelectInput.tsx",
		"SelectInput",
	],
	[
		"template-profiles/thin-start/overrides/src/lib/marketing-content/sections/homeHero/HomeHeroSection.tsx",
		"HomeHeroSection",
	],
] as const;

const failures: string[] = [];
for (const [relativePath, owner] of [...owners, ...thinOwners]) {
	const source = fs.readFileSync(path.join(root, relativePath), "utf8");
	if (
		!source.includes(`export const ${owner}`) ||
		!source.includes("Skeleton")
	) {
		failures.push(
			`${owner} does not expose Component.Skeleton in ${relativePath}`,
		);
	}
}

const buttonMultiSelectPath =
	"src/components/ui/input/selection/ButtonMultiSelectInput.tsx";
const buttonMultiSelectSource = fs.readFileSync(
	path.join(root, buttonMultiSelectPath),
	"utf8",
);
const loadedButtonProps = buttonMultiSelectSource.match(
	/<Button\s+([\s\S]*?)>\s*\{option\.label\}/,
)?.[1];
const skeletonButtonProps = buttonMultiSelectSource.match(
	/<Button\.Skeleton\s+([\s\S]*?)>\s*\{option\.label\}/,
)?.[1];

if (
	!loadedButtonProps?.includes('variant={selected ? "primary" : "secondary"}')
) {
	failures.push(
		`ButtonMultiSelectInput must map selected state directly to primary/secondary Button variants in ${buttonMultiSelectPath}`,
	);
}
for (const forbiddenProp of ["className=", "leadingIcon=", "size="]) {
	if (loadedButtonProps?.includes(forbiddenProp)) {
		failures.push(
			`ButtonMultiSelectInput loaded options must not set ${forbiddenProp} on Button in ${buttonMultiSelectPath}`,
		);
	}
}
if (!skeletonButtonProps?.includes('variant="secondary"')) {
	failures.push(
		`ButtonMultiSelectInput skeleton options must use neutral secondary Button.Skeleton variants in ${buttonMultiSelectPath}`,
	);
}
for (const forbiddenProp of ["className=", "leadingIcon=", "size="]) {
	if (skeletonButtonProps?.includes(forbiddenProp)) {
		failures.push(
			`ButtonMultiSelectInput skeleton options must not set ${forbiddenProp} in ${buttonMultiSelectPath}`,
		);
	}
}

const comboboxMultiSelectPath =
	"src/components/ui/input/selection/ComboboxMultiSelectInput.tsx";
const comboboxMultiSelectSource = fs.readFileSync(
	path.join(root, comboboxMultiSelectPath),
	"utf8",
);
if (!comboboxMultiSelectSource.includes('size = "sm"')) {
	failures.push(
		`ComboboxMultiSelectInput must follow the normal sm input default in ${comboboxMultiSelectPath}`,
	);
}
if (
	(comboboxMultiSelectSource.match(/min-w-\[4ch\]/g)?.length ?? 0) !== 2 ||
	comboboxMultiSelectSource.includes("min-w-[120px]")
) {
	failures.push(
		`ComboboxMultiSelectInput query branches must use the text-relative 4ch minimum in ${comboboxMultiSelectPath}`,
	);
}

const signatureInputPath = "src/components/ui/input/SignatureInput.tsx";
const signatureInputSource = fs.readFileSync(
	path.join(root, signatureInputPath),
	"utf8",
);
const signatureContracts = [
	{
		label: "caption Clear action",
		present: signatureInputSource.includes('textVariant="caption"'),
	},
	{
		label: "height-owned shell",
		present: /height:\s*`\$\{height\}px`/.test(signatureInputSource),
	},
	{
		label: "canvas filling the shell",
		present: signatureInputSource.includes(
			'"block h-full w-full bg-transparent text-foreground outline-none"',
		),
	},
];
for (const contract of signatureContracts) {
	if (!contract.present) {
		failures.push(
			`SignatureInput is missing its ${contract.label} contract in ${signatureInputPath}`,
		);
	}
}

const chipPath = "src/components/ui/misc/Chip.tsx";
const chipSource = fs.readFileSync(path.join(root, chipPath), "utf8");
if (!chipSource.includes("iconSize = 12")) {
	failures.push(
		`Chip.Skeleton must default to the live Chip's 12px small-icon geometry in ${chipPath}`,
	);
}

const markdownEditorPath =
	"src/components/composites/markdown/MarkdownEditor.tsx";
const markdownEditorSource = fs.readFileSync(
	path.join(root, markdownEditorPath),
	"utf8",
);
const markdownIndexPath = "src/components/composites/markdown/index.ts";
const markdownIndexSource = fs.readFileSync(
	path.join(root, markdownIndexPath),
	"utf8",
);
const thinMarkdownIndexPath =
	"template-profiles/thin-start/overrides/src/components/composites/markdown/index.ts";
const thinMarkdownIndexSource = fs.readFileSync(
	path.join(root, thinMarkdownIndexPath),
	"utf8",
);
const markdownPublicContracts = [
	"MarkdownEditor as Editor",
	"MarkdownEditorModalForm as EditorModalForm",
	"MarkdownRenderer as Render",
	"MarkdownContentDensity as ContentDensity",
];
for (const contract of markdownPublicContracts) {
	if (!markdownIndexSource.includes(contract)) {
		failures.push(
			`Markdown namespace is missing ${contract} in ${markdownIndexPath}`,
		);
	}
}
for (const contract of [
	"MarkdownRenderer as Render",
	"MarkdownContentDensity as ContentDensity",
]) {
	if (!thinMarkdownIndexSource.includes(contract)) {
		failures.push(
			`Thin Markdown namespace is missing ${contract} in ${thinMarkdownIndexPath}`,
		);
	}
}
if (/MarkdownEditor|EditorModalForm/.test(thinMarkdownIndexSource)) {
	failures.push(
		`Thin Markdown namespace must not expose editor capabilities in ${thinMarkdownIndexPath}`,
	);
}
const markdownEditorSkeletonContracts = [
	{
		label: "density-owned toolbar shell",
		token: 'isCompact ? "h-9 px-1" : "h-10"',
	},
	{
		label: "density-owned toolbar gap",
		token: 'isCompact ? "mt-1.5" : "mt-2"',
	},
	{
		label: "minimum editor canvas",
		token: 'isCompact ? "h-[98px]" : "h-[194px]"',
	},
	{ label: "editor density marker", token: "data-density={density}" },
	{
		label: "shared responsive toolbar collapse",
		token: "useMarkdownToolbarCollapse()",
	},
	{
		label: "whole-body skeleton",
		token: 'data-slot="markdown-editor-body-skeleton"',
	},
	{
		label: "ghost toolbar placeholders",
		token: 'className="opacity-0"',
	},
	{
		label: "visible secondary more-menu placeholder",
		token: '<Button.Skeleton size="icon-sm" variant="secondary" />',
	},
];
for (const contract of markdownEditorSkeletonContracts) {
	if (!markdownEditorSource.includes(contract.token)) {
		failures.push(
			`Markdown.Editor.Skeleton is missing its ${contract.label} contract in ${markdownEditorPath}`,
		);
	}
}
for (const staleToken of ["h-24", "h-32", "h-48", "h-56", "min-h-11"]) {
	if (markdownEditorSource.includes(staleToken)) {
		failures.push(
			`Markdown.Editor.Skeleton retains stale geometry token ${staleToken} in ${markdownEditorPath}`,
		);
	}
}

const forbiddenGraphTokens = [
	"GraphMap",
	"react-force-graph-2d",
	"react-force-graph-3d",
	"three-spritetext",
	"/internal/intelligence/graph",
];
const searchableFiles = ["src", "scripts", "template-profiles", "package.json"];
for (const token of forbiddenGraphTokens) {
	for (const relativePath of searchableFiles) {
		const absolutePath = path.join(root, relativePath);
		const files = fs.statSync(absolutePath).isDirectory()
			? walk(absolutePath)
			: [absolutePath];
		for (const file of files) {
			if (file.endsWith("verify-component-skeletons.ts")) continue;
			if (!/\.(?:tsx?|mjs|json)$/.test(file)) continue;
			if (fs.readFileSync(file, "utf8").includes(token)) {
				failures.push(
					`Removed graph token ${token} remains in ${path.relative(root, file)}`,
				);
			}
		}
	}
}

if (failures.length > 0) {
	throw new Error(failures.join("\n"));
}

console.log(
	`Verified ${owners.length + thinOwners.length} component skeleton contracts and GraphMap removal.`,
);

function walk(directory: string): string[] {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(entryPath) : [entryPath];
	});
}
