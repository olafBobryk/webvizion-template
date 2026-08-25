import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = process.cwd();
const marketingRoot = resolve(root, "src/app/(site)/(marketing)");
const sectionsRoot = resolve(root, "src/lib/marketing-content/sections");
const homePagePath = resolve(marketingRoot, "(home)/page.tsx");
const registryPath = resolve(sectionsRoot, "registry.tsx");
const rendererPath = resolve(sectionsRoot, "renderMarketingSections.tsx");
const typesPath = resolve(root, "src/lib/marketing-content/types.ts");
const packagePath = resolve(root, "package.json");

if (!existsSync(marketingRoot)) {
	console.log(
		"Marketing section policy verification passed: marketing is not installed.",
	);
	process.exit(0);
}

for (const path of [
	homePagePath,
	registryPath,
	rendererPath,
	typesPath,
	packagePath,
]) {
	assert.ok(
		existsSync(path),
		`Marketing section policy requires ${relative(root, path)}.`,
	);
}

const normalize = (value: string) => value.replaceAll("\\", "/");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
	name?: string;
};

function words(value: string) {
	return value
		.replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[^a-zA-Z0-9]+/)
		.flatMap((part) => part.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g) ?? [])
		.map((part) => part.toLowerCase())
		.filter(Boolean);
}

const genericPackageNameWords = new Set([
	"app",
	"next",
	"site",
	"template",
	"web",
]);
const productNameWords = new Set(
	words(packageJson.name?.split("/").at(-1) ?? "").filter(
		(word) => !genericPackageNameWords.has(word),
	),
);

assert.ok(
	productNameWords.size > 0,
	"package.json must provide a project name with at least one non-generic word so section names can remain product-neutral.",
);

function toPascalCase(value: string) {
	return words(value)
		.map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
		.join("");
}

function assertProductNeutral(value: string, context: string) {
	const prohibitedWords = words(value).filter((word) =>
		productNameWords.has(word),
	);
	assert.equal(
		prohibitedWords.length,
		0,
		`${context} must be product-neutral; remove package-name word(s): ${[...new Set(prohibitedWords)].join(", ")}.`,
	);
}

const homePageSource = readFileSync(homePagePath, "utf8");
assert.equal(
	/^\s*["']use client["'];/m.test(homePageSource),
	false,
	"Marketing home page must remain a server component.",
);
assert.match(
	homePageSource,
	/getMarketingPage\(\s*["']home["']\s*\)/,
	"Marketing home page must resolve the home marketing document.",
);
assert.match(
	homePageSource,
	/renderMarketingSections\(\s*page\.layout\s*\)/,
	"Marketing home page must render the home document through renderMarketingSections(page.layout).",
);

const homeSectionImports = [
	...homePageSource.matchAll(
		/from\s*["']@\/lib\/marketing-content\/sections\/([^"']+)["']/g,
	),
].map((match) => match[1]);
assert.deepEqual(
	homeSectionImports.sort(),
	["MarketingSectionReviewState", "renderMarketingSections"],
	"Marketing home page may import only the review state and section dispatcher; registered section renderers belong in the registry.",
);

const registrySource = readFileSync(registryPath, "utf8");
const registryObject = registrySource.match(
	/export const marketingSectionRegistry\s*=\s*\{([\s\S]*?)\}\s*satisfies/m,
);
assert.ok(
	registryObject,
	"Marketing section registry must use the canonical registry export.",
);

const rendererImports = new Map<string, string>();
for (const match of registrySource.matchAll(
	/import\s*\{([^}]+)\}\s*from\s*["'](\.[^"']+)["'];?/g,
)) {
	const specifier = match[2];
	for (const importedName of match[1].split(",")) {
		const name = importedName.trim();
		if (name.endsWith("Section")) rendererImports.set(name, specifier);
	}
}

const registryEntries = [
	...(registryObject?.[1].matchAll(
		/^\s*([A-Za-z][A-Za-z0-9]*):\s*([A-Za-z][A-Za-z0-9]*),?\s*$/gm,
	) ?? []),
].map((match) => ({ blockType: match[1], rendererName: match[2] }));

assert.ok(
	registryEntries.length > 0,
	"Marketing section registry must contain at least one section.",
);
assert.equal(
	new Set(registryEntries.map(({ blockType }) => blockType)).size,
	registryEntries.length,
	"Marketing section registry cannot register a block type twice.",
);
assert.equal(
	new Set(registryEntries.map(({ rendererName }) => rendererName)).size,
	registryEntries.length,
	"Each marketing block type must own one dedicated renderer.",
);

const registeredRendererPaths = new Set<string>();
for (const { blockType, rendererName } of registryEntries) {
	const expectedRendererName = `${toPascalCase(blockType)}Section`;
	assert.equal(
		rendererName,
		expectedRendererName,
		`${blockType} must use the canonical renderer name ${expectedRendererName}.`,
	);
	assertProductNeutral(blockType, `Marketing block type ${blockType}`);
	assertProductNeutral(rendererName, `Marketing renderer ${rendererName}`);

	const specifier = rendererImports.get(rendererName);
	assert.ok(
		specifier,
		`${blockType} must import ${rendererName} from a relative section module.`,
	);
	assert.ok(
		specifier.startsWith("./"),
		`${blockType} renderer import must stay within the sections owner.`,
	);

	const segments = specifier.slice(2).split("/");
	assert.ok(
		segments.length >= 2,
		`${blockType} may use intermediate grouping folders, but must end in ${blockType}/${expectedRendererName}.`,
	);
	assert.equal(
		segments.at(-2),
		blockType,
		`${blockType} renderer must live in a leaf folder named ${blockType}; intermediate folders are organizational only.`,
	);
	assert.equal(
		segments.at(-1),
		expectedRendererName,
		`${blockType} renderer file must be named ${expectedRendererName}.tsx.`,
	);
	for (const segment of segments) {
		assertProductNeutral(segment, `Marketing section path ${specifier}`);
	}

	const sourcePath = resolve(sectionsRoot, `${specifier.slice(2)}.tsx`);
	assert.ok(
		existsSync(sourcePath),
		`${blockType} renderer is missing ${normalize(relative(root, sourcePath))}.`,
	);
	const source = readFileSync(sourcePath, "utf8");
	assert.match(
		source,
		new RegExp(
			`export\\s+(?:const|function|class)\\s+${expectedRendererName}\\b|export\\s*\\{[^}]*\\b${expectedRendererName}\\b`,
		),
		`${normalize(relative(root, sourcePath))} must named-export ${expectedRendererName}.`,
	);
	assert.match(
		source,
		/<Section\b/u,
		`${normalize(relative(root, sourcePath))} must render through the shared Section owner.`,
	);
	assert.doesNotMatch(
		source,
		/<(?:header|footer|section)\b/u,
		`${normalize(relative(root, sourcePath))} may own one shared Section root, but cannot reproduce shell regions or independent raw section siblings.`,
	);
	registeredRendererPaths.add(normalize(sourcePath));
}

const declaredBlockTypes = new Set(
	[
		...readFileSync(typesPath, "utf8").matchAll(
			/MarketingSectionBase<["']([^"']+)["']>/g,
		),
	].map((match) => match[1]),
);
assert.deepEqual(
	[...registryEntries.map(({ blockType }) => blockType)].sort(),
	[...declaredBlockTypes].sort(),
	"Marketing section registry keys must exactly match discriminated MarketingSection block types.",
);

const typesSource = readFileSync(typesPath, "utf8");
for (const { blockType } of registryEntries) {
	const declaration = typesSource.match(
		new RegExp(
			`MarketingSectionBase<["']${blockType}["']>\\s*&\\s*\\{([\\s\\S]*?)\\}`,
			"u",
		),
	);
	assert.ok(
		declaration,
		`${blockType} must declare a structured block payload beyond MarketingSectionBase instead of representing an entire page through an empty block.`,
	);
	assert.match(
		declaration?.[1] ?? "",
		/[A-Za-z_$][A-Za-z0-9_$]*\??\s*:/u,
		`${blockType} must declare at least one meaningful content or media field.`,
	);
}

function collectSectionRendererFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = resolve(directory, entry.name);
		if (entry.isDirectory()) return collectSectionRendererFiles(entryPath);
		return entry.name.endsWith("Section.tsx") ? [entryPath] : [];
	});
}

for (const rendererPath of collectSectionRendererFiles(sectionsRoot)) {
	assert.ok(
		registeredRendererPaths.has(normalize(rendererPath)),
		`${normalize(relative(root, rendererPath))} is an orphan section renderer; register it or make it a helper without the *Section name.`,
	);
}

function collectMarketingPageFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = resolve(directory, entry.name);
		if (entry.isDirectory()) return collectMarketingPageFiles(entryPath);
		return entry.name === "page.tsx" ? [entryPath] : [];
	});
}

for (const pagePath of collectMarketingPageFiles(marketingRoot)) {
	const pageSource = readFileSync(pagePath, "utf8");
	const pageLabel = normalize(relative(root, pagePath));
	assert.doesNotMatch(
		pageSource,
		/<style\b/iu,
		`${pageLabel} cannot hide or restyle shared shell regions through route-local CSS.`,
	);
	const resolvedSlug = pageSource.match(
		/getMarketingPage\(\s*["']([^"']+)["']\s*\)/u,
	)?.[1];
	if (!resolvedSlug || resolvedSlug === "document") continue;
	assert.match(
		pageSource,
		/renderMarketingSections\(\s*page\.layout\s*\)/u,
		`${pageLabel} must delegate its ordered section document through renderMarketingSections(page.layout).`,
	);
}

const renderSource = readFileSync(rendererPath, "utf8");
assert.match(
	renderSource,
	/marketingSectionRegistry/,
	"renderMarketingSections must dispatch through the canonical section registry.",
);
assert.match(
	renderSource,
	/<Renderer\s+section=\{section\}/,
	"renderMarketingSections must render the registered renderer with its section data.",
);

console.log(
	`Marketing section policy verification passed for ${registryEntries.length} registered sections.`,
);
