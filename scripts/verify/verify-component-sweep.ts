#!/usr/bin/env tsx

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";
import { projectCatalogTarget } from "../../src/lib/component-catalog/contract";
import {
	componentExportSections,
	resolveComponentExportSection,
} from "../../src/lib/component-catalog/exportSections";

const root = process.cwd();
const srcRoot = path.join(root, "src");

function fail(message: string): never {
	throw new Error(`Component Export verification failed: ${message}`);
}

function collect(directory: string, suffix: string): string[] {
	if (!fs.existsSync(directory)) return [];
	return fs
		.readdirSync(directory, { withFileTypes: true })
		.flatMap((entry) => {
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) return collect(entryPath, suffix);
			return entry.name.endsWith(suffix) ? [entryPath] : [];
		})
		.sort();
}

function property(
	object: ts.ObjectLiteralExpression,
	name: string,
): ts.Expression {
	return (
		optionalProperty(object, name) ?? fail(`missing literal property ${name}`)
	);
}

function optionalProperty(
	object: ts.ObjectLiteralExpression,
	name: string,
): ts.Expression | undefined {
	for (const candidate of object.properties) {
		if (!ts.isPropertyAssignment(candidate)) continue;
		const candidateName = candidate.name;
		if (
			(ts.isIdentifier(candidateName) || ts.isStringLiteral(candidateName)) &&
			candidateName.text === name
		) {
			return candidate.initializer;
		}
	}
}

function object(node: ts.Expression, label: string) {
	return ts.isObjectLiteralExpression(node)
		? node
		: fail(`${label} must be an object literal`);
}

function array(node: ts.Expression, label: string) {
	return ts.isArrayLiteralExpression(node)
		? node
		: fail(`${label} must be an array literal`);
}

function string(node: ts.Expression, label: string) {
	return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
		? node.text
		: fail(`${label} must be a string literal`);
}

function scalar(node: ts.Expression, label: string) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
	}
	if (ts.isNumericLiteral(node)) return Number(node.text);
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (node.kind === ts.SyntaxKind.NullKeyword) return null;
	return fail(`${label} must be a JSON scalar literal`);
}

function record(node: ts.Expression, label: string) {
	const result: Record<string, string | number | boolean | null> = {};
	for (const entry of object(node, label).properties) {
		if (!ts.isPropertyAssignment(entry)) {
			fail(`${label} may contain only explicit property assignments`);
		}
		const key =
			ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)
				? entry.name.text
				: fail(`${label} keys must be static`);
		result[key] = scalar(entry.initializer, `${label}.${key}`);
	}
	return result;
}

function unique(values: readonly string[], label: string) {
	if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}

function readContract(filePath: string) {
	const source = fs.readFileSync(filePath, "utf8");
	const relativePath = path.relative(root, filePath);
	if (/@storybook|\.storybook/.test(source)) {
		fail(`${relativePath} imports Storybook`);
	}
	const sourceFile = ts.createSourceFile(
		filePath,
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	let contract: ts.ObjectLiteralExpression | undefined;
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (
				!ts.isIdentifier(declaration.name) ||
				declaration.name.text !== "catalogContract" ||
				!declaration.initializer ||
				!ts.isCallExpression(declaration.initializer)
			) {
				continue;
			}
			const argument = declaration.initializer.arguments[0];
			if (argument && ts.isObjectLiteralExpression(argument))
				contract = argument;
		}
	}
	if (!contract) fail(`${relativePath} must export a literal catalogContract`);

	const ownerId = string(property(contract, "id"), `${relativePath}.id`);
	const family = string(property(contract, "family"), `${relativePath}.family`);
	const group = string(property(contract, "group"), `${relativePath}.group`);
	const sweepSpanNode = optionalProperty(contract, "sweepSpan");
	if (sweepSpanNode) {
		const sweepSpan = string(sweepSpanNode, `${relativePath}.sweepSpan`);
		if (!new Set(["single", "double", "full"]).has(sweepSpan)) {
			fail(`${relativePath} has unknown sweep span ${sweepSpan}`);
		}
	}
	const targets = array(
		property(contract, "previewTargets"),
		`${ownerId}.previewTargets`,
	);
	if (targets.elements.length === 0) fail(`${ownerId} has no preview targets`);
	const targetIds: string[] = [];
	let projections = 0;

	for (const targetNode of targets.elements) {
		const target = object(targetNode as ts.Expression, `${ownerId}.target`);
		const targetId = string(property(target, "id"), `${ownerId}.target.id`);
		targetIds.push(targetId);
		const stage = string(
			property(target, "stage"),
			`${ownerId}.${targetId}.stage`,
		);
		if (!new Set(["standard", "wide", "overlay"]).has(stage)) {
			fail(`${ownerId}.${targetId} has unknown stage ${stage}`);
		}
		property(target, "Render");
		const baseline = record(
			property(target, "baseline"),
			`${ownerId}.${targetId}.baseline`,
		);
		const axes = array(property(target, "axes"), `${ownerId}.${targetId}.axes`);
		const axisIds: string[] = [];
		for (const axisNode of axes.elements) {
			const axis = object(
				axisNode as ts.Expression,
				`${ownerId}.${targetId}.axis`,
			);
			const axisId = string(
				property(axis, "id"),
				`${ownerId}.${targetId}.axis.id`,
			);
			axisIds.push(axisId);
			if (!(axisId in baseline)) {
				fail(`${ownerId}.${targetId} baseline is missing ${axisId}`);
			}
			const values = array(
				property(axis, "values"),
				`${ownerId}.${targetId}.${axisId}.values`,
			);
			if (values.elements.length === 0) {
				fail(`${ownerId}.${targetId}.${axisId} has no values`);
			}
			const valueIds: string[] = [];
			const scalarValues = values.elements.map((valueNode) => {
				const value = object(
					valueNode as ts.Expression,
					`${ownerId}.${targetId}.${axisId}.value`,
				);
				valueIds.push(
					string(
						property(value, "id"),
						`${ownerId}.${targetId}.${axisId}.value.id`,
					),
				);
				return scalar(
					property(value, "value"),
					`${ownerId}.${targetId}.${axisId}.value`,
				);
			});
			unique(valueIds, `${ownerId}.${targetId}.${axisId} value IDs`);
			if (!scalarValues.some((value) => Object.is(value, baseline[axisId]))) {
				fail(`${ownerId}.${targetId}.${axisId} baseline is outside its axis`);
			}
		}
		unique(axisIds, `${ownerId}.${targetId} axis IDs`);
		projections += axes.elements.length
			? axes.elements.reduce((total, axisNode) => {
					const axis = object(axisNode as ts.Expression, "axis");
					return (
						total +
						array(property(axis, "values"), "axis.values").elements.length
					);
				}, 0)
			: 1;
	}
	unique(targetIds, `${ownerId} target IDs`);
	return { family, group, ownerId, projections };
}

function verifyProjectionHelper() {
	const Render = () => null;
	const target = {
		id: "fixture",
		name: "Fixture",
		baseline: { size: "md", tone: "default", fixed: true },
		axes: [
			{
				id: "size",
				label: "Size",
				values: [
					{ id: "sm", label: "Small", value: "sm" },
					{ id: "md", label: "Medium", value: "md" },
				],
			},
			{
				id: "tone",
				label: "Tone",
				values: [
					{ id: "default", label: "Default", value: "default" },
					{ id: "danger", label: "Danger", value: "danger" },
				],
			},
		],
		stage: "standard" as const,
		Render,
	};
	const rows = projectCatalogTarget(target);
	if (rows.length !== 4)
		fail("projection helper must not form a Cartesian product");
	const baseline: Readonly<Record<string, unknown>> = target.baseline;
	for (const row of rows) {
		const changedAxes = target.axes.filter(
			(axis) => row.coordinate[axis.id] !== baseline[axis.id],
		);
		if (changedAxes.length > 1) fail("a projection changed more than one axis");
		if (row.coordinate.fixed !== true) fail("projection changed a constant");
	}
	const zeroAxis = projectCatalogTarget({ ...target, id: "zero", axes: [] });
	if (zeroAxis.length !== 1 || zeroAxis[0]?.axisId !== null) {
		fail("a zero-axis target must render its baseline once");
	}
}

function run() {
	execFileSync("node", ["scripts/generate-component-catalog.mjs", "--check"], {
		cwd: root,
		stdio: "inherit",
	});
	const catalogFiles = collect(srcRoot, ".catalog.tsx");
	if (catalogFiles.length === 0) fail("no catalogue contracts were found");
	const contracts = catalogFiles.map(readContract);
	unique(
		contracts.map((contract) => contract.ownerId),
		"owner IDs",
	);

	for (const catalogFile of catalogFiles) {
		const storyFile = catalogFile.replace(/\.catalog\.tsx$/, ".stories.tsx");
		if (!fs.existsSync(storyFile)) {
			fail(`${path.relative(root, catalogFile)} has no colocated owner story`);
		}
		const storySource = fs.readFileSync(storyFile, "utf8");
		if (!storySource.includes("catalogContract")) {
			fail(`${path.relative(root, storyFile)} does not consume its contract`);
		}
	}

	const canonical = fs.existsSync(path.join(root, ".storybook"));
	const surfacePath = path.join(
		root,
		"src/lib/component-catalog/ComponentExportSurface.tsx",
	);
	if (fs.existsSync(surfacePath)) {
		const surfaceSource = fs.readFileSync(surfacePath, "utf8");
		for (const required of [
			"componentCatalog.generated",
			"projectCatalogTarget",
			"PortalScope",
			"CatalogPreviewIdScope",
			"data-component-export-section",
			"data-component-export-group",
			"data-component-export-owner",
			"data-component-export-stage",
			"max-w-[1440px]",
			"max-w-[640px]",
			"max-w-[1248px]",
			"px-24",
		]) {
			if (!surfaceSource.includes(required)) {
				fail(`export surface is missing ${required}`);
			}
		}
		if (/\b(?:Card|Divider|Panel)\b/.test(surfaceSource)) {
			fail("export surface contains decorative catalogue chrome");
		}
		if (/@storybook|\.stories\./.test(surfaceSource)) {
			fail("export surface imports Storybook or a story module");
		}
	} else {
		fail("shared export surface is missing");
	}

	const appExportRoot = path.join(
		root,
		"src/app/(component-export)/internal/demo",
	);
	for (const requiredPath of ["layout.tsx", "page.tsx", "[section]/page.tsx"]) {
		const filePath = path.join(appExportRoot, requiredPath);
		if (!fs.existsSync(filePath)) fail(`route is missing ${requiredPath}`);
		const source = fs.readFileSync(filePath, "utf8");
		if (/@storybook|\.stories\./.test(source)) {
			fail(`${requiredPath} imports Storybook or a story module`);
		}
	}
	if (
		fs.existsSync(
			path.join(root, "src/app/(site)/(dev)/internal/demo/page.tsx"),
		)
	) {
		fail("the obsolete site-shell demo route remains");
	}

	const storyPath = path.join(
		root,
		"src/lib/component-catalog/ComponentExportSurface.stories.tsx",
	);
	if (canonical) {
		if (!fs.existsSync(storyPath))
			fail("Storybook export organizer is missing");
		const storySource = fs.readFileSync(storyPath, "utf8");
		for (const section of componentExportSections) {
			if (!storySource.includes(`sectionId=${JSON.stringify(section.id)}`)) {
				fail(`Storybook export organizer is missing ${section.id}`);
			}
		}
	}
	const portalSource = fs.readFileSync(
		path.join(root, "src/components/ui/overlays/Portal.tsx"),
		"utf8",
	);
	const modalHostSource = fs.readFileSync(
		path.join(root, "src/components/ui/overlays/modal/ModalHost.tsx"),
		"utf8",
	);
	if (!portalSource.includes("usePortalScopeId")) {
		fail("PortalScope does not expose its implementation-only event scope");
	}
	if (!modalHostSource.includes("eventScopeId ?? null) !== scopeId")) {
		fail("ModalHost does not isolate scoped preview events");
	}
	for (const removedPath of [
		".storybook/Playground.stories.tsx",
		".storybook/catalog/StorybookPlayground.tsx",
		".storybook/VisualAtlas.stories.tsx",
		".storybook/catalog/VisualAtlas.tsx",
		"src/config/componentExport.ts",
	]) {
		if (fs.existsSync(path.join(root, removedPath)))
			fail(`${removedPath} remains`);
	}
	verifyProjectionHelper();
	const exportContracts = contracts.filter(
		(contract) => resolveComponentExportSection(contract) !== null,
	);
	if (canonical) {
		const expectedSectionCounts = new Map([
			["foundations", 5],
			["icons", 1],
			["helpers", 3],
			["primitives", 10],
			["input", 26],
			["time", 2],
			["misc", 18],
			["overlays", 6],
			["assistant", 2],
			["utilities", 4],
		]);
		if (exportContracts.length !== 77) {
			fail(
				`canonical export must contain 77 owners, found ${exportContracts.length}`,
			);
		}
		for (const [sectionId, expectedCount] of expectedSectionCounts) {
			const actualCount = exportContracts.filter(
				(contract) => resolveComponentExportSection(contract) === sectionId,
			).length;
			if (actualCount !== expectedCount) {
				fail(
					`${sectionId} expected ${expectedCount} owners, found ${actualCount}`,
				);
			}
		}
	}
	const projectionCount = contracts.reduce(
		(total, contract) => total + contract.projections,
		0,
	);
	console.log(
		`Component Export verification passed (${exportContracts.length} exported owners from ${contracts.length} catalogue owners, ${projectionCount} one-axis previews).`,
	);
}

run();
