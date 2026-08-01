import type { ComponentType } from "react";

export type CatalogScalar = string | number | boolean | null;

export type CatalogCoordinate = Readonly<Record<string, CatalogScalar>>;

export interface CatalogAxisValue {
	id: string;
	label: string;
	value: CatalogScalar;
}

export interface CatalogAxis {
	id: string;
	label: string;
	values: readonly CatalogAxisValue[];
}

export type CatalogStage = "standard" | "wide" | "overlay";

export type CatalogSweepSpan = "single" | "double" | "full";

export type CatalogPreviewProps = {
	coordinate: CatalogCoordinate;
};

export interface CatalogPreviewTarget {
	id: string;
	name: string;
	baseline: CatalogCoordinate;
	axes: readonly CatalogAxis[];
	stage: CatalogStage;
	Render: ComponentType<CatalogPreviewProps>;
}

export interface CatalogOwnerGuarantee {
	label: string;
	storyId: string;
}

export interface CatalogOwnerContract {
	id: string;
	name: string;
	role: string;
	importStatement: string;
	chooseWhen: readonly string[];
	chooseInstead: readonly string[];
	compounds: readonly string[];
	exclusions: readonly string[];
	guarantees: readonly CatalogOwnerGuarantee[];
	family: string;
	group: string;
	sweepSpan?: CatalogSweepSpan;
	previewTargets: readonly CatalogPreviewTarget[];
}

export function defineCatalogOwnerContract<
	const Contract extends CatalogOwnerContract,
>(contract: Contract) {
	return contract;
}

export function catalogOwnerDocsId(contract: CatalogOwnerContract) {
	return `${contract.id}--docs`;
}

function markdownList(items: readonly string[]) {
	if (items.length === 0) return "- None; this owner is standalone.";
	return items.map((item) => `- ${item}`).join("\n");
}

export function formatCatalogOwnerContract(contract: CatalogOwnerContract) {
	const guarantees = contract.guarantees
		.map(
			(guarantee) =>
				`- [${guarantee.label}](?path=/story/${guarantee.storyId})`,
		)
		.join("\n");

	return [
		"### Role",
		contract.role,
		"### Supported import",
		`\`\`\`tsx\n${contract.importStatement}\n\`\`\``,
		"### Choose when",
		markdownList(contract.chooseWhen),
		"### Choose instead",
		markdownList(contract.chooseInstead),
		"### Supported compounds",
		markdownList(contract.compounds),
		"### Exclusions",
		markdownList(contract.exclusions),
		"### Executable guarantees",
		guarantees,
	].join("\n\n");
}

export type CatalogProjectionRow = {
	axisId: string | null;
	axisLabel: string;
	coordinate: CatalogCoordinate;
	id: string;
	valueId: string;
	valueLabel: string;
};

export function projectCatalogTarget(
	target: CatalogPreviewTarget,
): readonly CatalogProjectionRow[] {
	if (target.axes.length === 0) {
		return [
			{
				axisId: null,
				axisLabel: "Default",
				coordinate: target.baseline,
				id: `${target.id}.default`,
				valueId: "default",
				valueLabel: "Default",
			},
		];
	}

	return target.axes.flatMap((axis) =>
		axis.values.map((value) => ({
			axisId: axis.id,
			axisLabel: axis.label,
			coordinate: { ...target.baseline, [axis.id]: value.value },
			id: `${target.id}.${axis.id}.${value.id}`,
			valueId: value.id,
			valueLabel: value.label,
		})),
	);
}
