import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const RASTER_EXTENSION = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/iu;
const SVG_EXTENSION = /\.svg(?:[?#].*)?$/iu;
const SOURCE_EXTENSIONS = /\.(?:[cm]?[jt]sx?|css)$/u;
const EXCEPTION_MARKER = "averlo-media-exception-next-line";

export const exemptableMarketingMediaRules = new Set([
	"missing-intrinsic-dimensions",
	"missing-raster-blur",
	"missing-responsive-sizes",
	"public-raster-string",
	"raw-raster-element",
	"unresolved-remote-media",
]);

const nonExemptableMarketingMediaRules = new Set([
	"invalid-media-exception",
	"missing-alt-contract",
	"reference-capture",
	"stale-media-exception",
	"temporary-media-url",
]);

export const marketingMediaRules = new Set([
	...exemptableMarketingMediaRules,
	...nonExemptableMarketingMediaRules,
]);

const marketingRoots = [
	"src/app/(site)/(marketing)",
	"src/app/(site)/_components/layout",
	"src/components/domain/marketing",
	"src/lib/marketing-content",
];

function normalizePath(value) {
	return value.replaceAll("\\", "/");
}

function collectFiles(root, directory) {
	if (!existsSync(directory)) return [];
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolutePath = resolve(directory, entry.name);
		if (entry.isDirectory()) files.push(...collectFiles(root, absolutePath));
		else if (SOURCE_EXTENSIONS.test(entry.name)) {
			files.push({
				path: normalizePath(relative(root, absolutePath)),
				source: readFileSync(absolutePath, "utf8"),
			});
		}
	}
	return files;
}

export function collectMarketingMediaSources(root) {
	return marketingRoots.flatMap((directory) =>
		collectFiles(root, resolve(root, directory)),
	);
}

function lineForPosition(sourceFile, position) {
	return sourceFile.getLineAndCharacterOfPosition(position).line + 1;
}

function diagnosticLine(sourceFile, node) {
	let current = node;
	while (current) {
		if (
			ts.isJsxOpeningElement(current) ||
			ts.isJsxSelfClosingElement(current)
		) {
			return lineForPosition(sourceFile, current.getStart(sourceFile));
		}
		if (ts.isPropertyAssignment(current)) {
			return lineForPosition(sourceFile, current.getStart(sourceFile));
		}
		current = current.parent;
	}
	return lineForPosition(sourceFile, node.getStart(sourceFile));
}

function attribute(opening, name) {
	return opening.attributes.properties.find(
		(property) =>
			ts.isJsxAttribute(property) && property.name.getText() === name,
	);
}

function attributeText(sourceFile, opening, name) {
	const value = attribute(opening, name);
	return value?.getText(sourceFile) ?? "";
}

function sourceKind(opening, rasterImports, svgImports) {
	const sourceAttribute = attribute(opening, "src");
	if (!sourceAttribute?.initializer) return "unknown";
	const initializer = sourceAttribute.initializer;
	if (ts.isStringLiteral(initializer)) {
		if (SVG_EXTENSION.test(initializer.text)) return "svg";
		if (RASTER_EXTENSION.test(initializer.text)) return "raster";
		return "unknown";
	}
	if (!ts.isJsxExpression(initializer) || !initializer.expression) {
		return "unknown";
	}
	const expression = initializer.expression;
	if (ts.isIdentifier(expression)) {
		if (rasterImports.has(expression.text)) return "raster";
		if (svgImports.has(expression.text)) return "svg";
	}
	return "unknown";
}

function hasStringType(node) {
	if (!node) return false;
	if (node.kind === ts.SyntaxKind.StringKeyword) return true;
	if (ts.isUnionTypeNode(node)) return node.types.some(hasStringType);
	return false;
}

function propertyName(node) {
	if (!node.name) return null;
	if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
		return node.name.text;
	}
	return null;
}

function completeRequiredProperty(properties, name, typeKind) {
	const property = properties.find(
		(candidate) =>
			ts.isPropertySignature(candidate) && propertyName(candidate) === name,
	);
	return Boolean(
		property && !property.questionToken && property.type?.kind === typeKind,
	);
}

function completeObjectProperty(properties, name) {
	return properties.some(
		(property) =>
			ts.isPropertyAssignment(property) && propertyName(property) === name,
	);
}

function parseExceptions(path, source) {
	const annotations = [];
	const diagnostics = [];
	const lines = source.split(/\r?\n/u);
	for (const [index, line] of lines.entries()) {
		if (!line.includes(EXCEPTION_MARKER)) continue;
		const normalized = line
			.replace(/^\s*\/\/\s*/u, "")
			.replace(/^\s*\{\/\*\s*/u, "")
			.replace(/\s*\*\/\}\s*$/u, "")
			.replace(/^\s*\/\*\s*/u, "")
			.replace(/\s*\*\/\s*$/u, "")
			.trim();
		const match = normalized.match(
			/^averlo-media-exception-next-line\s+([a-z0-9-]+)\s+--\s+(.+)$/u,
		);
		if (!match) {
			diagnostics.push({
				exemptable: false,
				line: index + 1,
				message:
					"Media exceptions require a rule and non-empty rationale: averlo-media-exception-next-line <rule> -- <rationale>.",
				path,
				rule: "invalid-media-exception",
			});
			continue;
		}
		const [, rule, rationale] = match;
		if (!exemptableMarketingMediaRules.has(rule)) {
			diagnostics.push({
				exemptable: false,
				line: index + 1,
				message: marketingMediaRules.has(rule)
					? `${rule} is not exemptable.`
					: `Unknown marketing media exception rule: ${rule}.`,
				path,
				rule: "invalid-media-exception",
			});
			continue;
		}
		let targetLine = index + 2;
		while (targetLine <= lines.length) {
			const candidate = lines[targetLine - 1].trim();
			if (
				candidate &&
				!candidate.startsWith("//") &&
				!candidate.startsWith("{/*") &&
				!candidate.startsWith("/*")
			) {
				break;
			}
			targetLine += 1;
		}
		annotations.push({
			line: index + 1,
			path,
			rationale: rationale.trim(),
			rule,
			targetLine,
		});
	}
	return { annotations, diagnostics };
}

function analyzeSource({ path, source }) {
	const parsedExceptions = parseExceptions(path, source);
	const diagnostics = [...parsedExceptions.diagnostics];
	const scriptKind = path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
	const sourceFile = ts.createSourceFile(
		path,
		source,
		ts.ScriptTarget.Latest,
		true,
		scriptKind,
	);
	const rasterImports = new Set();
	const svgImports = new Set();
	const nextImageIdentifiers = new Set();

	function addDiagnostic(rule, node, message) {
		diagnostics.push({
			exemptable: exemptableMarketingMediaRules.has(rule),
			line: diagnosticLine(sourceFile, node),
			message,
			path,
			rule,
		});
	}

	function addLineDiagnostic(rule, line, message) {
		diagnostics.push({
			exemptable: exemptableMarketingMediaRules.has(rule),
			line,
			message,
			path,
			rule,
		});
	}

	if (path.endsWith(".css")) {
		for (const [index, line] of source.split(/\r?\n/u).entries()) {
			if (
				/figma\.com\/api\/mcp\/asset|localhost[^\s"']*\.(?:avif|gif|jpe?g|png|webp)/iu.test(
					line,
				)
			) {
				addLineDiagnostic(
					"temporary-media-url",
					index + 1,
					"Expiring Figma/MCP and localhost media URLs cannot ship in marketing product source.",
				);
			}
			if (
				/\.codex\/visual-parity|(?:^|\/)assessment\/(?:source|target|overlay|heatmap|side-by-side)|(?:^|\/)reference\/(?:full-page|side-by-side)/iu.test(
					line,
				)
			) {
				addLineDiagnostic(
					"reference-capture",
					index + 1,
					"Visual-parity references and flattened captures cannot become marketing product media.",
				);
			}
			if (
				/url\(\s*["']?\/[^)"']+\.(?:avif|gif|jpe?g|png|webp)(?:[?#][^)"']*)?["']?\s*\)/iu.test(
					line,
				)
			) {
				addLineDiagnostic(
					"public-raster-string",
					index + 1,
					"Committed raster marketing media must use a static import instead of a public-path string.",
				);
			}
		}
		return { annotations: parsedExceptions.annotations, diagnostics };
	}

	function checkRemoteMediaMembers(node, members) {
		const src = members.find(
			(member) =>
				ts.isPropertySignature(member) && propertyName(member) === "src",
		);
		if (!src || !ts.isPropertySignature(src) || !hasStringType(src.type)) {
			return;
		}
		const complete =
			completeRequiredProperty(members, "width", ts.SyntaxKind.NumberKeyword) &&
			completeRequiredProperty(
				members,
				"height",
				ts.SyntaxKind.NumberKeyword,
			) &&
			completeRequiredProperty(
				members,
				"blurDataURL",
				ts.SyntaxKind.StringKeyword,
			) &&
			completeRequiredProperty(members, "alt", ts.SyntaxKind.StringKeyword);
		if (!complete) {
			addDiagnostic(
				"unresolved-remote-media",
				node,
				"A remote marketing media branch with string src requires non-optional width, height, blurDataURL, and alt fields.",
			);
		}
	}

	for (const statement of sourceFile.statements) {
		if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
		const specifier = statement.moduleSpecifier;
		if (!ts.isStringLiteral(specifier)) continue;
		const imported = statement.importClause.name?.text;
		if (specifier.text === "next/image" && imported) {
			nextImageIdentifiers.add(imported);
		}
		if (imported && RASTER_EXTENSION.test(specifier.text)) {
			rasterImports.add(imported);
		}
		if (imported && SVG_EXTENSION.test(specifier.text))
			svgImports.add(imported);
	}

	function visit(node) {
		if (ts.isStringLiteralLike(node)) {
			const value = node.text;
			if (
				/figma\.com\/api\/mcp\/asset|localhost[^\s"']*\.(?:avif|gif|jpe?g|png|webp)/iu.test(
					value,
				)
			) {
				addDiagnostic(
					"temporary-media-url",
					node,
					"Expiring Figma/MCP and localhost media URLs cannot ship in marketing product source.",
				);
			}
			if (
				/\.codex\/visual-parity|(?:^|\/)assessment\/(?:source|target|overlay|heatmap|side-by-side)|(?:^|\/)reference\/(?:full-page|side-by-side)/iu.test(
					value,
				)
			) {
				addDiagnostic(
					"reference-capture",
					node,
					"Visual-parity references and flattened captures cannot become marketing product media.",
				);
			}
			if (
				/^\/[^\s"']+\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/iu.test(value) ||
				/url\(\s*["']?\/[^)"']+\.(?:avif|gif|jpe?g|png|webp)/iu.test(value)
			) {
				addDiagnostic(
					"public-raster-string",
					node,
					"Committed raster marketing media must use a static import instead of a public-path string.",
				);
			}
		}

		if (ts.isTypeLiteralNode(node) || ts.isInterfaceDeclaration(node)) {
			checkRemoteMediaMembers(node, node.members);
		}

		if (ts.isObjectLiteralExpression(node)) {
			const src = node.properties.find(
				(property) =>
					ts.isPropertyAssignment(property) && propertyName(property) === "src",
			);
			if (
				src &&
				ts.isPropertyAssignment(src) &&
				ts.isStringLiteralLike(src.initializer) &&
				/^https?:\/\//u.test(src.initializer.text) &&
				!["width", "height", "blurDataURL", "alt"].every((name) =>
					completeObjectProperty(node.properties, name),
				)
			) {
				addDiagnostic(
					"unresolved-remote-media",
					node,
					"A remote marketing media object requires width, height, blurDataURL, and alt fields before rendering.",
				);
			}
		}

		if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
			const tag = node.tagName.getText(sourceFile);
			const kind = sourceKind(node, rasterImports, svgImports);
			if (tag === "img" && kind !== "svg") {
				addDiagnostic(
					"raw-raster-element",
					node,
					"Raster marketing media must render through next/image, not a raw img element.",
				);
			}
			if (nextImageIdentifiers.has(tag)) {
				if (!attribute(node, "alt")) {
					addDiagnostic(
						"missing-alt-contract",
						node,
						"Marketing Image usage requires an explicit content or decorative alt contract.",
					);
				}
				if (kind !== "svg") {
					const placeholder = attributeText(sourceFile, node, "placeholder");
					if (!/blur/u.test(placeholder)) {
						addDiagnostic(
							"missing-raster-blur",
							node,
							"Raster marketing Image usage requires blur placeholder delivery.",
						);
					}
					if (!attribute(node, "sizes")) {
						addDiagnostic(
							"missing-responsive-sizes",
							node,
							"Raster marketing Image usage requires a truthful sizes value.",
						);
					}
					const hasIntrinsicDimensions =
						kind === "raster" ||
						Boolean(attribute(node, "fill")) ||
						(Boolean(attribute(node, "width")) &&
							Boolean(attribute(node, "height")));
					if (!hasIntrinsicDimensions) {
						addDiagnostic(
							"missing-intrinsic-dimensions",
							node,
							"Dynamic marketing Image usage requires fill or explicit width and height.",
						);
					}
				}
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return { annotations: parsedExceptions.annotations, diagnostics };
}

export function analyzeMarketingMediaSources(sources) {
	const diagnostics = [];
	const acceptedExceptions = [];
	for (const source of sources) {
		const result = analyzeSource(source);
		const pending = [...result.diagnostics];
		for (const annotation of result.annotations) {
			const index = pending.findIndex(
				(diagnostic) =>
					diagnostic.exemptable &&
					diagnostic.rule === annotation.rule &&
					diagnostic.line === annotation.targetLine,
			);
			if (index < 0) {
				pending.push({
					exemptable: false,
					line: annotation.line,
					message: `Exception for ${annotation.rule} does not suppress a matching diagnostic on the next code line.`,
					path: annotation.path,
					rule: "stale-media-exception",
				});
				continue;
			}
			pending.splice(index, 1);
			acceptedExceptions.push(annotation);
		}
		diagnostics.push(...pending);
	}
	return { acceptedExceptions, diagnostics };
}

export function verifyMarketingMedia(root) {
	const sources = collectMarketingMediaSources(root);
	const result = analyzeMarketingMediaSources(sources);
	if (result.diagnostics.length > 0) {
		const details = result.diagnostics
			.map(
				(diagnostic) =>
					`- ${diagnostic.path}:${diagnostic.line} [${diagnostic.rule}] ${diagnostic.message}`,
			)
			.join("\n");
		throw new assert.AssertionError({
			message: `Marketing media verification failed:\n${details}`,
		});
	}
	return result;
}

const isCli =
	process.argv[1] &&
	pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
	const root = process.cwd();
	if (!existsSync(resolve(root, "src/app/(site)/(marketing)"))) {
		console.log(
			"Marketing media verification passed: marketing is not installed.",
		);
		process.exit(0);
	}
	const result = verifyMarketingMedia(root);
	for (const exception of result.acceptedExceptions) {
		console.log(
			`Accepted marketing media exception ${exception.path}:${exception.line} [${exception.rule}] ${exception.rationale}`,
		);
	}
	console.log("Marketing media policy verification passed.");
}
