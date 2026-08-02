#!/usr/bin/env tsx

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";
import { catalogOwnerDocsId } from "../../src/lib/component-catalog/contract";
import { getStorybookBuildFingerprint } from "../storybook-build-provenance";

const root = process.cwd();
const srcDirectory = path.join(root, "src");

function fail(message: string): never {
	throw new Error(`Storybook catalogue verification failed: ${message}`);
}

function collect(directory: string, pattern: RegExp): string[] {
	if (!fs.existsSync(directory)) return [];
	return fs
		.readdirSync(directory, { withFileTypes: true })
		.flatMap((entry) => {
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) return collect(entryPath, pattern);
			return pattern.test(entry.name) ? [entryPath] : [];
		})
		.sort();
}

function property(
	object: ts.ObjectLiteralExpression,
	name: string,
): ts.Expression | undefined {
	for (const candidate of object.properties) {
		if (!ts.isPropertyAssignment(candidate)) continue;
		if (
			(ts.isIdentifier(candidate.name) || ts.isStringLiteral(candidate.name)) &&
			candidate.name.text === name
		) {
			return candidate.initializer;
		}
	}
}

function readContract(catalogPath: string) {
	const source = fs.readFileSync(catalogPath, "utf8");
	const sourceFile = ts.createSourceFile(
		catalogPath,
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
			const candidate = declaration.initializer.arguments[0];
			if (candidate && ts.isObjectLiteralExpression(candidate))
				contract = candidate;
		}
	}
	if (!contract)
		fail(`${path.relative(root, catalogPath)} has no literal contract`);
	const idNode = property(contract, "id");
	const guaranteesNode = property(contract, "guarantees");
	const chooseWhenNode = property(contract, "chooseWhen");
	const chooseInsteadNode = property(contract, "chooseInstead");
	const exclusionsNode = property(contract, "exclusions");
	if (!idNode || !ts.isStringLiteral(idNode)) fail("owner ID must be literal");
	if (!guaranteesNode || !ts.isArrayLiteralExpression(guaranteesNode)) {
		fail(`${idNode.text}.guarantees must be literal`);
	}
	const guarantees = guaranteesNode.elements.map((node) => {
		if (!ts.isObjectLiteralExpression(node))
			fail(`${idNode.text} guarantee is invalid`);
		const storyIdNode = property(node, "storyId");
		if (!storyIdNode || !ts.isStringLiteral(storyIdNode)) {
			fail(`${idNode.text} guarantee story ID must be literal`);
		}
		return storyIdNode.text;
	});
	const readGuidance = (node: ts.Expression | undefined, label: string) => {
		if (!node || !ts.isArrayLiteralExpression(node)) {
			fail(`${idNode.text}.${label} must be a literal array`);
		}
		return node.elements.map((entry) => {
			if (!ts.isStringLiteral(entry)) {
				fail(`${idNode.text}.${label} entries must be literal strings`);
			}
			return entry.text.trim();
		});
	};
	const chooseWhen = readGuidance(chooseWhenNode, "chooseWhen");
	const chooseInstead = readGuidance(chooseInsteadNode, "chooseInstead");
	const exclusions = readGuidance(exclusionsNode, "exclusions");
	if (chooseWhen.length === 0) fail(`${idNode.text}.chooseWhen is empty`);
	if (chooseInstead.length === 0) fail(`${idNode.text}.chooseInstead is empty`);
	if (exclusions.length === 0) fail(`${idNode.text}.exclusions is empty`);
	for (const guidance of chooseWhen) {
		if (/^an? .+ presentation is required\.?$/i.test(guidance)) {
			fail(`${idNode.text}.chooseWhen is tautological: ${guidance}`);
		}
	}
	return { id: idNode.text, guarantees };
}

function run() {
	const catalogPaths = collect(srcDirectory, /\.catalog\.tsx$/);
	const storyPaths = collect(srcDirectory, /\.stories\.[cm]?[jt]sx?$/);
	if (catalogPaths.length === 0) fail("no owner contracts were found");
	const contracts = catalogPaths.map((catalogPath) => {
		const contract = readContract(catalogPath);
		const storyPath = catalogPath.replace(/\.catalog\.tsx$/, ".stories.tsx");
		if (!fs.existsSync(storyPath)) fail(`${contract.id} has no owner story`);
		const storySource = fs.readFileSync(storyPath, "utf8");
		if (
			!storySource.includes(`from "./${path.basename(catalogPath, ".tsx")}"`)
		) {
			fail(
				`${path.relative(root, storyPath)} does not import its colocated contract`,
			);
		}
		if (!storySource.includes("catalogContract,")) {
			fail(
				`${path.relative(root, storyPath)} does not expose its contract to Docs`,
			);
		}
		if (
			/playground\s*:\s*true|atlasEntry|CatalogAtlas|VisualAtlas/.test(
				storySource,
			)
		) {
			fail(
				`${path.relative(root, storyPath)} retains removed projection metadata`,
			);
		}
		return {
			...contract,
			storyFile: path.relative(root, storyPath).replaceAll(path.sep, "/"),
		};
	});
	const ownerIds = contracts.map((contract) => contract.id);
	if (new Set(ownerIds).size !== ownerIds.length)
		fail("owner IDs must be unique");

	const rules = fs.readFileSync(
		path.join(root, ".storybook/CatalogRules.mdx"),
		"utf8",
	);
	for (const required of [
		"Do not maintain a separate owner index.",
		"The shell-free Component Export surface is the narrow exception",
		"never computes a Cartesian product",
	]) {
		if (!rules.includes(required))
			fail(`Catalog Rules are missing: ${required}`);
	}
	for (const removedPath of [
		".storybook/Playground.stories.tsx",
		".storybook/catalog/StorybookPlayground.tsx",
		".storybook/VisualAtlas.stories.tsx",
		".storybook/catalog/VisualAtlas.tsx",
	]) {
		if (fs.existsSync(path.join(root, removedPath)))
			fail(`${removedPath} remains`);
	}

	const indexPath = path.join(root, "storybook-static/index.json");
	if (!fs.existsSync(indexPath)) fail("storybook-static/index.json is missing");
	const provenancePath = path.join(
		root,
		"storybook-static/averlo-build-provenance.json",
	);
	if (!fs.existsSync(provenancePath)) {
		fail("Storybook build provenance is missing; run npm run build-storybook");
	}
	const builtProvenance = JSON.parse(
		fs.readFileSync(provenancePath, "utf8"),
	) as {
		fileCount?: number;
		fingerprint?: string;
	};
	const currentProvenance = getStorybookBuildFingerprint(root);
	if (
		builtProvenance.fingerprint !== currentProvenance.fingerprint ||
		builtProvenance.fileCount !== currentProvenance.fileCount
	) {
		fail(
			"storybook-static was not built from the current worktree; run npm run build-storybook",
		);
	}
	const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as {
		entries?: Record<
			string,
			{ importPath?: string; title?: string; type?: string }
		>;
	};
	const entries = index.entries ?? {};
	if (!("ui-guides-catalog-rules--docs" in entries)) {
		fail("missing UI/Guides/Catalog Rules docs entry");
	}
	if ("playground-component-library--all-components" in entries) {
		fail("removed Storybook Playground remains in the index");
	}
	for (const storyPath of storyPaths) {
		const storyFile = path.relative(root, storyPath).replaceAll(path.sep, "/");
		if (
			!Object.values(entries).some(
				(entry) =>
					entry.type === "story" && entry.importPath?.endsWith(`/${storyFile}`),
			)
		) {
			fail(`${storyFile} has no indexed Storybook stories`);
		}
	}
	for (const contract of contracts) {
		const docsId = catalogOwnerDocsId(contract as never);
		const docsEntry = entries[docsId];
		if (!docsEntry) fail(`missing owner Docs entry ${docsId}`);
		if (!docsEntry.importPath?.endsWith(`/${contract.storyFile}`)) {
			fail(`${docsId} is not owned by ${contract.storyFile}`);
		}
		for (const guarantee of contract.guarantees) {
			if (!(guarantee in entries)) fail(`missing guarantee ${guarantee}`);
		}
	}

	console.log(
		`Storybook catalogue verification passed (${contracts.length} app-safe owner contracts; Storybook remains their Docs/test consumer).`,
	);
}

run();
