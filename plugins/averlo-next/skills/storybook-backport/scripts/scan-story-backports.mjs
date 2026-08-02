#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const BACKPORT_STATUSES = new Set([
	"backport-candidate",
	"backport-approved",
	"backport-ported",
	"backport-rejected",
	"backport-canonical",
]);

const STORY_PATTERN = /\.stories\.[cm]?[jt]sx?$/;
const IGNORED_DIRECTORIES = new Set([
	".git",
	".next",
	".turbo",
	".vercel",
	"coverage",
	"dist",
	"node_modules",
	"storybook-static",
]);

function parseArgs(argv) {
	const [possibleCommand, ...rest] = argv;
	const command =
		possibleCommand && !possibleCommand.startsWith("--")
			? possibleCommand
			: "scan";
	const args =
		command === "scan" && possibleCommand?.startsWith("--") ? argv : rest;
	const options = { command, includeTemplate: false, json: false };
	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === "--json") options.json = true;
		else if (arg === "--include-template") options.includeTemplate = true;
		else if (
			["--workspace", "--template", "--story", "--export"].includes(arg)
		) {
			const value = args[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error(`${arg} requires a value.`);
			}
			options[arg.slice(2)] = value;
			index += 1;
		} else throw new Error(`Unknown argument: ${arg}`);
	}
	return options;
}

async function pathExists(filePath) {
	return fs
		.access(filePath)
		.then(() => true)
		.catch(() => false);
}

async function resolveDirectory(input, label) {
	if (!input) throw new Error(`${label} is required.`);
	const resolved = await fs.realpath(path.resolve(input));
	const stat = await fs.stat(resolved);
	if (!stat.isDirectory()) throw new Error(`${label} must be a directory.`);
	return resolved;
}

export function assertBoundedWorkspace(workspace) {
	const root = path.parse(workspace).root;
	if (workspace === root) {
		throw new Error("Refusing to scan a filesystem root.");
	}
	if (workspace === path.resolve(os.homedir())) {
		throw new Error(
			"Refusing to scan the home directory. Choose a bounded workspace root.",
		);
	}
}

function loadTypeScript(templateRoot) {
	const requireFromTemplate = createRequire(
		path.join(templateRoot, "package.json"),
	);
	try {
		return requireFromTemplate("typescript");
	} catch (error) {
		throw new Error(
			`Unable to load TypeScript from ${templateRoot}. Run npm install there first. ${error instanceof Error ? error.message : error}`,
		);
	}
}

function propertyName(ts, property) {
	if (!property.name || property.name.questionToken) return null;
	if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) {
		return property.name.text;
	}
	return null;
}

function findProperty(ts, object, name) {
	return object.properties.find(
		(property) => propertyName(ts, property) === name,
	);
}

function parseLiteral(ts, node, context) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
	}
	if (ts.isNumericLiteral(node)) return Number(node.text);
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (node.kind === ts.SyntaxKind.NullKeyword) return null;
	if (ts.isArrayLiteralExpression(node)) {
		return node.elements.map((element, index) => {
			if (ts.isSpreadElement(element)) {
				throw new Error(`${context}[${index}] cannot use a spread.`);
			}
			return parseLiteral(ts, element, `${context}[${index}]`);
		});
	}
	if (ts.isObjectLiteralExpression(node)) {
		const value = {};
		for (const property of node.properties) {
			if (!ts.isPropertyAssignment(property)) {
				throw new Error(
					`${context} must contain literal property assignments only.`,
				);
			}
			const name = propertyName(ts, property);
			if (!name) throw new Error(`${context} cannot use a computed property.`);
			value[name] = parseLiteral(
				ts,
				property.initializer,
				`${context}.${name}`,
			);
		}
		return value;
	}
	throw new Error(`${context} must be a literal value.`);
}

function getExportedStoryObjects(ts, sourceFile) {
	const stories = [];
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		const exported = statement.modifiers?.some(
			(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
		);
		if (!exported) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (
				ts.isIdentifier(declaration.name) &&
				declaration.initializer &&
				ts.isObjectLiteralExpression(declaration.initializer)
			) {
				stories.push({
					exportName: declaration.name.text,
					object: declaration.initializer,
				});
			}
		}
	}
	return stories;
}

function fingerprintObject(ts, sourceFile, exportName, object) {
	const properties = object.properties
		.filter((property) => propertyName(ts, property) !== "tags")
		.map((property) => {
			if (
				propertyName(ts, property) !== "parameters" ||
				!ts.isPropertyAssignment(property) ||
				!ts.isObjectLiteralExpression(property.initializer)
			) {
				return property;
			}
			const parameters = ts.factory.updateObjectLiteralExpression(
				property.initializer,
				property.initializer.properties.filter(
					(parameter) => propertyName(ts, parameter) !== "backport",
				),
			);
			return ts.factory.updatePropertyAssignment(
				property,
				property.name,
				parameters,
			);
		});
	const normalized = ts.factory.updateObjectLiteralExpression(
		object,
		properties,
	);
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	const printed = printer.printNode(
		ts.EmitHint.Expression,
		normalized,
		sourceFile,
	);
	return `sha256:${createHash("sha256")
		.update(`${exportName}\n${printed}`)
		.digest("hex")}`;
}

function validateMetadata(entry) {
	const { metadata, status, fingerprint } = entry;
	const context = `${entry.storyPath}#${entry.exportName}`;
	if (metadata.schemaVersion !== 1) {
		throw new Error(`${context} requires backport schemaVersion 1.`);
	}
	if (metadata.target !== "averlo-next-template") {
		throw new Error(`${context} has unsupported backport target.`);
	}
	if (
		typeof metadata.canonicalStoryId !== "string" ||
		!/^[a-z0-9]+(?:-[a-z0-9]+)*--[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
			metadata.canonicalStoryId,
		)
	) {
		throw new Error(`${context} has an invalid canonicalStoryId.`);
	}
	if (!new Set(["copy", "adapt"]).has(metadata.strategy)) {
		throw new Error(`${context} strategy must be copy or adapt.`);
	}
	if (typeof metadata.rationale !== "string" || !metadata.rationale.trim()) {
		throw new Error(`${context} requires a non-empty rationale.`);
	}
	if (["backport-approved", "backport-ported"].includes(status)) {
		if (metadata.fingerprint !== fingerprint) {
			throw new Error(
				`${context} fingerprint does not match its executable story.`,
			);
		}
	} else if (
		metadata.fingerprint !== undefined &&
		metadata.fingerprint !== fingerprint
	) {
		throw new Error(`${context} contains a stale fingerprint.`);
	}
	if (status === "backport-canonical") {
		if (
			!metadata.source ||
			typeof metadata.source !== "object" ||
			typeof metadata.source.repository !== "string" ||
			!metadata.source.repository.trim() ||
			typeof metadata.source.storyId !== "string" ||
			!metadata.source.storyId.trim() ||
			metadata.source.fingerprint !== fingerprint
		) {
			throw new Error(
				`${context} requires matching canonical source provenance.`,
			);
		}
	}
}

export function inspectStorySource({ ts, source, storyPath }) {
	const sourceFile = ts.createSourceFile(
		storyPath,
		source,
		ts.ScriptTarget.Latest,
		true,
		storyPath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const entries = [];
	const errors = [];
	for (const story of getExportedStoryObjects(ts, sourceFile)) {
		try {
			const tagsProperty = findProperty(ts, story.object, "tags");
			const parametersProperty = findProperty(ts, story.object, "parameters");
			let backportProperty = null;
			if (parametersProperty) {
				if (
					ts.isPropertyAssignment(parametersProperty) &&
					ts.isObjectLiteralExpression(parametersProperty.initializer)
				) {
					backportProperty = findProperty(
						ts,
						parametersProperty.initializer,
						"backport",
					);
				}
			}
			if (
				!backportProperty &&
				tagsProperty &&
				(!ts.isPropertyAssignment(tagsProperty) ||
					!ts.isArrayLiteralExpression(tagsProperty.initializer))
			)
				continue;
			let tags = [];
			if (tagsProperty) {
				if (!ts.isPropertyAssignment(tagsProperty)) {
					throw new Error(`${story.exportName}.tags must be an inline array.`);
				}
				tags = parseLiteral(
					ts,
					tagsProperty.initializer,
					`${story.exportName}.tags`,
				);
				if (
					!Array.isArray(tags) ||
					tags.some((tag) => typeof tag !== "string")
				) {
					throw new Error(
						`${story.exportName}.tags must contain strings only.`,
					);
				}
			}
			const statusTags = tags.filter((tag) => BACKPORT_STATUSES.has(tag));
			if (statusTags.length === 0 && !backportProperty) continue;
			if (statusTags.length !== 1) {
				throw new Error(
					`${story.exportName} must contain exactly one backport status tag.`,
				);
			}
			if (!backportProperty || !ts.isPropertyAssignment(backportProperty)) {
				throw new Error(`${story.exportName} requires parameters.backport.`);
			}
			const metadata = parseLiteral(
				ts,
				backportProperty.initializer,
				`${story.exportName}.parameters.backport`,
			);
			const entry = {
				exportName: story.exportName,
				fingerprint: fingerprintObject(
					ts,
					sourceFile,
					story.exportName,
					story.object,
				),
				metadata,
				status: statusTags[0],
				storyPath,
			};
			validateMetadata(entry);
			entries.push(entry);
		} catch (error) {
			errors.push({
				exportName: story.exportName,
				message: error instanceof Error ? error.message : String(error),
				storyPath,
			});
		}
	}
	return { entries, errors };
}

async function walkStoryFiles(root) {
	const files = [];
	async function walk(current) {
		let entries;
		try {
			entries = await fs.readdir(current, { withFileTypes: true });
		} catch (error) {
			if (["EACCES", "EPERM"].includes(error?.code)) return;
			throw error;
		}
		entries.sort((left, right) => left.name.localeCompare(right.name));
		for (const entry of entries) {
			const absolutePath = path.join(current, entry.name);
			if (entry.isSymbolicLink()) continue;
			if (entry.isDirectory()) {
				if (
					IGNORED_DIRECTORIES.has(entry.name) ||
					entry.name.startsWith(".next-")
				)
					continue;
				await walk(absolutePath);
			} else if (STORY_PATTERN.test(entry.name)) files.push(absolutePath);
		}
	}
	await walk(root);
	return files;
}

async function findRepositoryRoot(storyPath, workspace) {
	let current = path.dirname(storyPath);
	let packageCandidate = null;
	while (
		current === workspace ||
		current.startsWith(`${workspace}${path.sep}`)
	) {
		if (await pathExists(path.join(current, ".git"))) return current;
		if (await pathExists(path.join(current, ".template-profile.json")))
			return current;
		if (
			!packageCandidate &&
			(await pathExists(path.join(current, "package.json")))
		) {
			packageCandidate = current;
		}
		if (current === workspace) break;
		current = path.dirname(current);
	}
	return packageCandidate ?? workspace;
}

async function readLineage(repositoryRoot) {
	const receiptPath = path.join(repositoryRoot, ".template-profile.json");
	if (!(await pathExists(receiptPath))) {
		return { kind: "legacy-unverified", receiptPath: null, sourceCommit: null };
	}
	try {
		const receipt = JSON.parse(await fs.readFile(receiptPath, "utf8"));
		if (
			receipt.schemaVersion === 2 &&
			typeof receipt.sourceCommit === "string"
		) {
			return {
				kind: "receipt-v2",
				receiptPath,
				sourceCommit: receipt.sourceCommit,
			};
		}
		return { kind: "legacy-unverified", receiptPath, sourceCommit: null };
	} catch {
		return { kind: "invalid-receipt", receiptPath, sourceCommit: null };
	}
}

export async function scanWorkspace({
	workspace,
	template,
	includeTemplate = false,
}) {
	const workspaceRoot = await resolveDirectory(workspace, "--workspace");
	const templateRoot = await resolveDirectory(template, "--template");
	assertBoundedWorkspace(workspaceRoot);
	const ts = loadTypeScript(templateRoot);
	const storyFiles = await walkStoryFiles(workspaceRoot);
	const entries = [];
	const errors = [];
	for (const storyPath of storyFiles) {
		const repositoryRoot = await findRepositoryRoot(storyPath, workspaceRoot);
		if (!includeTemplate && repositoryRoot === templateRoot) continue;
		const inspected = inspectStorySource({
			source: await fs.readFile(storyPath, "utf8"),
			storyPath,
			ts,
		});
		const lineage = await readLineage(repositoryRoot);
		if (lineage.kind === "invalid-receipt") {
			errors.push({
				exportName: null,
				message: `Invalid template receipt: ${lineage.receiptPath}`,
				storyPath,
			});
		}
		for (const entry of inspected.entries) {
			entries.push({
				...entry,
				lineage,
				repositoryRoot,
			});
		}
		errors.push(...inspected.errors);
	}
	entries.sort(
		(left, right) =>
			left.metadata.canonicalStoryId.localeCompare(
				right.metadata.canonicalStoryId,
			) ||
			left.storyPath.localeCompare(right.storyPath) ||
			left.exportName.localeCompare(right.exportName),
	);
	const approvedGroups = new Map();
	for (const entry of entries.filter(
		(entry) => entry.status === "backport-approved",
	)) {
		const key = entry.metadata.canonicalStoryId;
		approvedGroups.set(key, [...(approvedGroups.get(key) ?? []), entry]);
	}
	const conflicts = [...approvedGroups.entries()]
		.filter(([, candidates]) => candidates.length > 1)
		.map(([canonicalStoryId, candidates]) => ({
			canonicalStoryId,
			candidates: candidates.map((entry) => ({
				exportName: entry.exportName,
				repositoryRoot: entry.repositoryRoot,
				storyPath: entry.storyPath,
			})),
		}));
	return {
		schemaVersion: 1,
		workspace: workspaceRoot,
		template: templateRoot,
		entries,
		conflicts,
		errors,
	};
}

export function formatHumanReport(report) {
	const approved = report.entries.filter(
		(entry) => entry.status === "backport-approved",
	);
	const lines = [
		"Story backport scan",
		`Workspace: ${report.workspace}`,
		`Template: ${report.template}`,
		`Marked stories: ${report.entries.length}`,
		`Approved queue: ${approved.length}`,
		`Conflicts: ${report.conflicts.length}`,
		`Validation errors: ${report.errors.length}`,
		"",
		"Approved stories",
	];
	if (approved.length === 0) lines.push("  None");
	for (const entry of approved) {
		lines.push(
			`  ${entry.metadata.canonicalStoryId}`,
			`    Source: ${entry.storyPath}#${entry.exportName}`,
			`    Strategy: ${entry.metadata.strategy}`,
			`    Lineage: ${entry.lineage.kind}`,
			`    Fingerprint: ${entry.fingerprint}`,
		);
	}
	lines.push("", "Other marked stories");
	const other = report.entries.filter(
		(entry) => entry.status !== "backport-approved",
	);
	if (other.length === 0) lines.push("  None");
	for (const entry of other) {
		lines.push(
			`  ${entry.status}: ${entry.storyPath}#${entry.exportName} -> ${entry.metadata.canonicalStoryId}`,
		);
	}
	if (report.conflicts.length > 0) {
		lines.push("", "Blocking conflicts");
		for (const conflict of report.conflicts) {
			lines.push(`  ${conflict.canonicalStoryId}`);
			for (const candidate of conflict.candidates) {
				lines.push(`    ${candidate.storyPath}#${candidate.exportName}`);
			}
		}
	}
	if (report.errors.length > 0) {
		lines.push("", "Validation errors");
		for (const error of report.errors) {
			lines.push(
				`  ${error.storyPath}${error.exportName ? `#${error.exportName}` : ""}: ${error.message}`,
			);
		}
	}
	return `${lines.join("\n")}\n`;
}

export async function fingerprintStory({ template, story, exportName }) {
	const templateRoot = await resolveDirectory(template, "--template");
	if (!story) throw new Error("--story is required.");
	if (!exportName) throw new Error("--export is required.");
	const storyPath = await fs.realpath(path.resolve(story));
	const ts = loadTypeScript(templateRoot);
	const source = await fs.readFile(storyPath, "utf8");
	const sourceFile = ts.createSourceFile(
		storyPath,
		source,
		ts.ScriptTarget.Latest,
		true,
		storyPath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const storyObject = getExportedStoryObjects(ts, sourceFile).find(
		(entry) => entry.exportName === exportName,
	);
	if (!storyObject) throw new Error(`Story export not found: ${exportName}`);
	return fingerprintObject(ts, sourceFile, exportName, storyObject.object);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.command === "fingerprint") {
		console.log(
			await fingerprintStory({
				exportName: options.export,
				story: options.story,
				template: options.template,
			}),
		);
		return;
	}
	if (options.command !== "scan") {
		throw new Error(`Unknown command: ${options.command}`);
	}
	const report = await scanWorkspace({
		includeTemplate: options.includeTemplate,
		template: options.template,
		workspace: options.workspace,
	});
	process.stdout.write(
		options.json
			? `${JSON.stringify(report, null, 2)}\n`
			: formatHumanReport(report),
	);
	if (report.errors.length > 0) process.exitCode = 1;
	else if (report.conflicts.length > 0) process.exitCode = 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}
