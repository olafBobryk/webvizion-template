import type { CatalogOwnerContract } from "./contract";

export const componentExportSections = [
	{
		id: "overview",
		label: "Overview",
		description:
			"A compact index of the shell-free Storybook export sections prepared for Figma capture.",
	},
	{
		id: "foundations",
		label: "Foundations",
		description:
			"System-level appearance, motion, focus, timing, and surface foundations.",
	},
	{
		id: "icons",
		label: "Icons",
		description: "The shared icon registry and its supported visual states.",
	},
	{
		id: "helpers",
		label: "Helpers",
		description:
			"Small reusable helpers that coordinate common component behavior.",
	},
	{
		id: "primitives",
		label: "Primitives",
		description:
			"Low-level controls, typography, fields, lists, and surface primitives.",
	},
	{
		id: "input",
		label: "Input",
		description:
			"Form controls and authored states for choice, text, files, dates, selection, and numeric input.",
	},
	{
		id: "time",
		label: "Time",
		description: "Compact date and relative-time presentation primitives.",
	},
	{
		id: "misc",
		label: "Misc",
		description:
			"Shared status, navigation, media, loading, and disclosure components.",
	},
	{
		id: "overlays",
		label: "Overlays",
		description:
			"Portaled modal, confirmation, inspection, and transient-feedback surfaces.",
	},
	{
		id: "assistant",
		label: "Assistant",
		description:
			"Higher-level conversation messages and pending assistant states.",
	},
	{
		id: "utilities",
		label: "Utilities",
		description:
			"Motion and reveal utilities retained as the final implementation appendix.",
	},
] as const;

export type ComponentExportSection = (typeof componentExportSections)[number];
export type ComponentExportSectionId = ComponentExportSection["id"];

export const componentExportContentSections = componentExportSections.filter(
	(section) => section.id !== "overview",
);

const uiGroupSections = {
	Foundations: "foundations",
	Icons: "icons",
	Helpers: "helpers",
	Primitives: "primitives",
	Input: "input",
	Time: "time",
	Misc: "misc",
	Overlays: "overlays",
	Motion: "utilities",
} as const satisfies Record<string, ComponentExportSectionId>;

export function isComponentExportSectionId(
	value: string,
): value is ComponentExportSectionId {
	return componentExportSections.some((section) => section.id === value);
}

export function getComponentExportSection(id: ComponentExportSectionId) {
	const section = componentExportSections.find(
		(candidate) => candidate.id === id,
	);
	if (!section) throw new Error(`Unknown component export section: ${id}`);
	return section;
}

export function resolveComponentExportSection(
	owner: Pick<CatalogOwnerContract, "family" | "group">,
): ComponentExportSectionId | null {
	if (owner.family === "Domain" && owner.group === "Assistant") {
		return "assistant";
	}
	if (owner.family !== "UI") return null;
	const rootGroup = owner.group.split(" / ")[0] ?? owner.group;
	return uiGroupSections[rootGroup as keyof typeof uiGroupSections] ?? null;
}
