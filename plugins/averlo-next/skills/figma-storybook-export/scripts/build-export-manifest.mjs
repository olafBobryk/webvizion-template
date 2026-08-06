#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DOCS_ONLY_OWNER_IDS = new Set([
	"ui-foundations-focus",
	"ui-foundations-motion-provider",
	"ui-foundations-motion-timing",
	"ui-foundations-settings",
	"ui-foundations-surface-tint",
	"ui-input-spam-protection-fields",
	"ui-misc-suspense-boundary",
	"ui-motion-auto-cycle",
	"ui-motion-reveal",
	"ui-motion-scroll",
	"ui-overlays-portal",
]);

function sha256(value) {
	return createHash("sha256").update(value).digest("hex");
}

function normalizePath(value) {
	return value.replaceAll("\\", "/");
}

function loadTypeScript(root) {
	const candidates = [];
	try {
		const projectRequire = createRequire(join(root, "package.json"));
		candidates.push(projectRequire.resolve("typescript"));
	} catch {}
	try {
		candidates.push(createRequire(import.meta.url).resolve("typescript"));
	} catch {}
	try {
		candidates.push(
			createRequire(join(process.cwd(), "package.json")).resolve("typescript"),
		);
	} catch {}
	if (
		process.env.FIGMA_STORYBOOK_TYPESCRIPT_ROOT ||
		process.env.AVERLO_TEMPLATE_ROOT
	) {
		try {
			const dependencyRoot =
				process.env.FIGMA_STORYBOOK_TYPESCRIPT_ROOT ??
				process.env.AVERLO_TEMPLATE_ROOT;
			candidates.push(
				createRequire(join(dependencyRoot, "package.json")).resolve(
					"typescript",
				),
			);
		} catch {}
	}
	for (const candidate of candidates) {
		try {
			return createRequire(import.meta.url)(candidate);
		} catch {}
	}
	throw new Error(
		`Unable to load TypeScript from ${root}. Install project dependencies first.`,
	);
}

function walk(directory, result = []) {
	if (!existsSync(directory)) return result;
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolute = join(directory, entry.name);
		if (entry.isDirectory()) walk(absolute, result);
		else if (/\.stories\.(?:ts|tsx)$/u.test(entry.name)) result.push(absolute);
	}
	return result;
}

function propertyName(ts, node) {
	if (!node) return undefined;
	if (
		ts.isIdentifier(node) ||
		ts.isStringLiteralLike(node) ||
		ts.isNumericLiteral(node)
	)
		return node.text;
	return undefined;
}

function unwrap(ts, node) {
	let current = node;
	while (
		current &&
		(ts.isAsExpression(current) ||
			ts.isSatisfiesExpression?.(current) ||
			ts.isParenthesizedExpression(current) ||
			ts.isTypeAssertionExpression(current))
	) {
		current = current.expression;
	}
	return current;
}

function findObjectProperty(ts, objectNode, name) {
	const object = unwrap(ts, objectNode);
	if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
	for (const property of object.properties) {
		if (
			ts.isPropertyAssignment(property) &&
			propertyName(ts, property.name) === name
		)
			return property.initializer;
		if (
			ts.isShorthandPropertyAssignment(property) &&
			property.name.text === name
		)
			return property.name;
	}
	return undefined;
}

function evaluate(ts, node, environment, seen = new Set()) {
	const current = unwrap(ts, node);
	if (!current) return undefined;
	if (
		ts.isStringLiteralLike(current) ||
		ts.isNoSubstitutionTemplateLiteral(current)
	)
		return current.text;
	if (ts.isNumericLiteral(current)) return Number(current.text);
	if (current.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (current.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (current.kind === ts.SyntaxKind.NullKeyword) return null;
	if (ts.isPrefixUnaryExpression(current)) {
		const value = evaluate(ts, current.operand, environment, seen);
		if (typeof value !== "number") return undefined;
		return current.operator === ts.SyntaxKind.MinusToken ? -value : value;
	}
	if (ts.isTemplateExpression(current)) {
		let value = current.head.text;
		for (const span of current.templateSpans) {
			const expression = evaluate(ts, span.expression, environment, seen);
			if (expression === undefined || typeof expression === "object")
				return undefined;
			value += `${expression}${span.literal.text}`;
		}
		return value;
	}
	if (ts.isArrayLiteralExpression(current)) {
		return current.elements.map((element) =>
			evaluate(ts, element, environment, seen),
		);
	}
	if (ts.isObjectLiteralExpression(current)) {
		const value = {};
		for (const property of current.properties) {
			if (ts.isPropertyAssignment(property)) {
				const name = propertyName(ts, property.name);
				if (name !== undefined)
					value[name] = evaluate(ts, property.initializer, environment, seen);
			} else if (ts.isShorthandPropertyAssignment(property)) {
				value[property.name.text] = evaluate(
					ts,
					property.name,
					environment,
					seen,
				);
			} else if (ts.isSpreadAssignment(property)) {
				const spread = evaluate(ts, property.expression, environment, seen);
				if (spread && typeof spread === "object" && !Array.isArray(spread))
					Object.assign(value, spread);
			}
		}
		return value;
	}
	if (ts.isIdentifier(current)) {
		if (!environment.has(current.text) || seen.has(current.text))
			return current.text;
		const nextSeen = new Set(seen).add(current.text);
		return evaluate(ts, environment.get(current.text), environment, nextSeen);
	}
	if (ts.isCallExpression(current)) {
		const called = current.expression.getText();
		if (called === "defineCatalogOwnerContract" && current.arguments[0]) {
			return evaluate(ts, current.arguments[0], environment, seen);
		}
		return undefined;
	}
	return undefined;
}

function hasExportModifier(ts, node) {
	return Boolean(
		node.modifiers?.some(
			(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
		),
	);
}

function collectEnvironment(ts, sourceFile) {
	const environment = new Map();
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (ts.isIdentifier(declaration.name) && declaration.initializer) {
				environment.set(declaration.name.text, declaration.initializer);
			}
		}
	}
	return environment;
}

function findImportedBinding(ts, sourceFile, localName) {
	for (const statement of sourceFile.statements) {
		if (
			!ts.isImportDeclaration(statement) ||
			!ts.isStringLiteralLike(statement.moduleSpecifier)
		)
			continue;
		const bindings = statement.importClause?.namedBindings;
		if (!bindings || !ts.isNamedImports(bindings)) continue;
		for (const element of bindings.elements) {
			if (element.name.text !== localName) continue;
			return {
				importedName: element.propertyName?.text ?? element.name.text,
				specifier: statement.moduleSpecifier.text,
			};
		}
	}
	return null;
}

function findExportedVariable(ts, sourceFile, name) {
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement) || !hasExportModifier(ts, statement))
			continue;
		for (const declaration of statement.declarationList.declarations) {
			if (ts.isIdentifier(declaration.name) && declaration.name.text === name)
				return declaration.initializer;
		}
	}
	return undefined;
}

function evaluateImportedBinding(ts, root, storyPath, sourceFile, localName) {
	const binding = findImportedBinding(ts, sourceFile, localName);
	if (!binding) return undefined;
	const importedPath = resolveModulePath(root, storyPath, binding.specifier);
	if (!importedPath) return undefined;
	const importedSource = readFileSync(importedPath, "utf8");
	const importedFile = ts.createSourceFile(
		importedPath,
		importedSource,
		ts.ScriptTarget.Latest,
		true,
		extname(importedPath) === ".tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const importedEnvironment = collectEnvironment(ts, importedFile);
	const exportedNode = findExportedVariable(
		ts,
		importedFile,
		binding.importedName,
	);
	return evaluate(ts, exportedNode, importedEnvironment);
}

function findMetaNode(ts, sourceFile, environment) {
	for (const statement of sourceFile.statements) {
		if (!ts.isExportAssignment(statement) || statement.isExportEquals) continue;
		const expression = unwrap(ts, statement.expression);
		if (expression && ts.isIdentifier(expression))
			return environment.get(expression.text);
		return expression;
	}
	return undefined;
}

function moduleCandidates(base) {
	return [
		base,
		...[".ts", ".tsx", ".js", ".jsx"].map((extension) => `${base}${extension}`),
		...["index.ts", "index.tsx", "index.js", "index.jsx"].map((file) =>
			join(base, file),
		),
	];
}

function resolveModulePath(root, storyPath, specifier) {
	let base;
	if (specifier.startsWith("@/")) base = join(root, "src", specifier.slice(2));
	else if (specifier.startsWith("."))
		base = resolve(dirname(storyPath), specifier);
	else return null;
	for (const candidate of moduleCandidates(base)) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return null;
}

function contractImportSpecifier(contract) {
	if (
		!contract?.importStatement ||
		typeof contract.importStatement !== "string"
	)
		return null;
	const match = contract.importStatement.match(/\bfrom\s+["']([^"']+)["']/u);
	return match?.[1] ?? null;
}

function resolveComponentSource(
	ts,
	root,
	storyPath,
	sourceFile,
	componentNode,
	contract,
) {
	const supportedImport = contractImportSpecifier(contract);
	if (supportedImport) {
		const resolved = resolveModulePath(root, storyPath, supportedImport);
		if (resolved) return resolved;
	}

	const component = unwrap(ts, componentNode);
	const localName =
		component && ts.isPropertyAccessExpression(component)
			? component.expression.getText()
			: component?.getText();
	if (!localName) return null;

	for (const statement of sourceFile.statements) {
		if (
			!ts.isImportDeclaration(statement) ||
			!ts.isStringLiteralLike(statement.moduleSpecifier)
		)
			continue;
		const clause = statement.importClause;
		if (!clause) continue;
		let matches = clause.name?.text === localName;
		if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
			matches ||= clause.namedBindings.name.text === localName;
		} else if (
			clause.namedBindings &&
			ts.isNamedImports(clause.namedBindings)
		) {
			matches ||= clause.namedBindings.elements.some(
				(element) => element.name.text === localName,
			);
		}
		if (matches)
			return resolveModulePath(root, storyPath, statement.moduleSpecifier.text);
	}
	return null;
}

function readGit(root, args) {
	function git(...command) {
		try {
			return execFileSync("git", command, {
				cwd: root,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
			}).trim();
		} catch {
			return null;
		}
	}
	return {
		branch: git("branch", "--show-current"),
		head: git("rev-parse", "HEAD"),
		dirty: Boolean(git("status", "--porcelain")),
		workingTreeAuthoritative: true,
		invocation: args,
	};
}

function classify(id) {
	if (DOCS_ONLY_OWNER_IDS.has(id)) return "documentation-only";
	if (id === "ui-misc-skeleton") return "standalone-skeleton";
	return "native-component";
}

function parseStoryFile(ts, root, storyPath) {
	const storySource = readFileSync(storyPath, "utf8");
	const sourceFile = ts.createSourceFile(
		storyPath,
		storySource,
		ts.ScriptTarget.Latest,
		true,
		extname(storyPath) === ".tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const environment = collectEnvironment(ts, sourceFile);
	const metaNode = findMetaNode(ts, sourceFile, environment);
	if (!metaNode)
		throw new Error(`No default Storybook meta export in ${storyPath}`);

	const meta = evaluate(ts, metaNode, environment) ?? {};
	const idNode = findObjectProperty(ts, metaNode, "id");
	const id = evaluate(ts, idNode, environment);
	if (typeof id !== "string" || id.length === 0) {
		throw new Error(
			`Storybook meta in ${storyPath} must declare an explicit string id`,
		);
	}
	const componentNode = findObjectProperty(ts, metaNode, "component");
	const localContract = evaluate(
		ts,
		environment.get("catalogContract"),
		environment,
	);
	const contract =
		localContract ??
		evaluateImportedBinding(ts, root, storyPath, sourceFile, "catalogContract");
	if (contract && contract.id !== id) {
		throw new Error(
			`Owner contract id ${contract.id} does not match meta id ${id} in ${storyPath}`,
		);
	}
	const sourcePath = resolveComponentSource(
		ts,
		root,
		storyPath,
		sourceFile,
		componentNode,
		contract,
	);
	const componentSource = sourcePath ? readFileSync(sourcePath, "utf8") : "";
	const title = typeof meta.title === "string" ? meta.title : null;
	const description =
		typeof contract?.role === "string"
			? contract.role
			: typeof meta.parameters?.docs?.description?.component === "string"
				? meta.parameters.docs.description.component
				: null;
	const stories = [];
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement) || !hasExportModifier(ts, statement))
			continue;
		for (const declaration of statement.declarationList.declarations) {
			if (
				!ts.isIdentifier(declaration.name) ||
				declaration.name.text === "catalogContract" ||
				!declaration.initializer
			)
				continue;
			const value = evaluate(ts, declaration.initializer, environment) ?? {};
			stories.push({
				exportName: declaration.name.text,
				explicitAppearance:
					typeof value.globals?.appearance === "string"
						? value.globals.appearance
						: null,
				description:
					typeof value.parameters?.docs?.description?.story === "string"
						? value.parameters.docs.description.story
						: null,
				hasArgs: Boolean(
					findObjectProperty(ts, declaration.initializer, "args"),
				),
			});
		}
	}
	const classification = classify(id);
	const ownerCore = {
		id,
		title,
		name:
			typeof contract?.name === "string"
				? contract.name
				: (title?.split("/").at(-1) ?? id),
		description,
		kind: contract ? "ui-owner-contract" : "domain-story",
		classification,
		visual: classification !== "documentation-only",
		component: componentNode?.getText(sourceFile) ?? null,
		storyPath: normalizePath(relative(root, storyPath)),
		sourcePath: sourcePath ? normalizePath(relative(root, sourcePath)) : null,
		defaultAppearance:
			typeof meta.globals?.appearance === "string"
				? meta.globals.appearance
				: "light",
		pinnedAppearances: Object.fromEntries(
			stories
				.filter((story) => story.explicitAppearance)
				.map((story) => [story.exportName, story.explicitAppearance]),
		),
		contract: contract
			? {
					id: contract.id,
					name: contract.name,
					role: contract.role,
					importStatement: contract.importStatement,
					chooseWhen: contract.chooseWhen ?? [],
					chooseInstead: contract.chooseInstead ?? [],
					compounds: contract.compounds ?? [],
					exclusions: contract.exclusions ?? [],
					guarantees: contract.guarantees ?? [],
				}
			: null,
		stories,
	};
	return {
		...ownerCore,
		fingerprint: sha256(
			JSON.stringify(ownerCore) + storySource + componentSource,
		),
	};
}

export function buildManifest({ root = process.cwd(), invocation = [] } = {}) {
	const absoluteRoot = resolve(root);
	const ts = loadTypeScript(absoluteRoot);
	const storyFiles = walk(join(absoluteRoot, "src", "components")).sort();
	const owners = storyFiles
		.map((storyPath) => parseStoryFile(ts, absoluteRoot, storyPath))
		.filter(
			(owner) =>
				owner.title?.startsWith("UI/") ||
				owner.title?.startsWith("Domain/Assistant/"),
		);
	const ownerContracts = owners.filter(
		(owner) => owner.kind === "ui-owner-contract",
	).length;
	const domainStories = owners.length - ownerContracts;
	const visualOwners = owners.filter((owner) => owner.visual).length;
	const manifestFingerprint = sha256(
		JSON.stringify(owners.map(({ id, fingerprint }) => [id, fingerprint])),
	);
	return {
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		root: absoluteRoot,
		source: readGit(absoluteRoot, invocation),
		appearance: { default: "light", storyPinsOnly: true },
		summary: {
			storyFiles: owners.length,
			ownerContracts,
			domainStories,
			visualOwners,
			documentationOnlyOwners: owners.length - visualOwners,
		},
		manifestFingerprint,
		owners,
	};
}

function parseArgs(argv) {
	const options = { root: process.cwd(), out: null };
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--root") options.root = argv[++index];
		else if (argv[index] === "--out") options.out = argv[++index];
		else if (argv[index] === "--help") options.help = true;
		else throw new Error(`Unknown argument: ${argv[index]}`);
	}
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: build-export-manifest.mjs [--root <repo>] [--out <manifest.json>]",
		);
		return;
	}
	const root = resolve(options.root);
	const out = resolve(
		options.out ??
			join(root, ".codex", "tmp", "figma-storybook-export", "manifest.json"),
	);
	const manifest = buildManifest({ root, invocation: process.argv.slice(2) });
	mkdirSync(dirname(out), { recursive: true });
	writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
	console.log(
		JSON.stringify(
			{
				out,
				summary: manifest.summary,
				manifestFingerprint: manifest.manifestFingerprint,
			},
			null,
			2,
		),
	);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
