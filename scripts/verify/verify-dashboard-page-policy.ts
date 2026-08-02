import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { dashboardSurfaceRegistry } from "../../src/app/(site)/dashboard/_registry/surfaceRegistry";

const root = process.cwd();
const dashboardRoot = resolve(root, "src/app/(site)/dashboard");

if (!existsSync(dashboardRoot)) {
	console.log(
		"Dashboard page policy verification passed: dashboard is not installed.",
	);
	process.exit(0);
}

const dashboardLayoutSource = readFileSync(
	resolve(dashboardRoot, "layout.tsx"),
	"utf8",
);
assert.match(
	dashboardLayoutSource,
	/if \(resolution\.status === ["']anonymous["']\) \{\s*redirect\(/,
	"Anonymous dashboard access must use a server redirect instead of waiting for client hydration.",
);
assert.equal(
	dashboardLayoutSource.includes("DashboardUnauthenticatedRedirect"),
	false,
	"Dashboard layout must not delegate anonymous access to a client redirect component.",
);

const normalize = (value: string) => value.replaceAll("\\", "/");
const routeDirectoryForHref = (href: string) => {
	const suffix = href.slice("/dashboard".length);
	return resolve(dashboardRoot, `.${suffix || ""}`);
};
const importPattern =
	/import\s*{([^}]+)}\s*from\s*["'](\.\/_components\/[^"']+Surface)["'];?/g;
const collectSurfaceImports = (source: string) =>
	[...source.matchAll(importPattern)].map((match) => ({
		exports: match[1]
			.split(",")
			.map((name) => name.trim())
			.filter(Boolean),
		specifier: match[2],
	}));

const registeredPagePaths = new Set<string>();
for (const surface of dashboardSurfaceRegistry) {
	const routeDirectory = routeDirectoryForHref(surface.href);
	const pagePath = resolve(routeDirectory, "page.tsx");
	const loadingPath = resolve(routeDirectory, "loading.tsx");
	assert.ok(existsSync(pagePath), `${surface.href} must own page.tsx.`);
	assert.ok(existsSync(loadingPath), `${surface.href} must own loading.tsx.`);

	const pageSource = readFileSync(pagePath, "utf8");
	const loadingSource = readFileSync(loadingPath, "utf8");
	assert.equal(
		/^\s*["']use client["'];/m.test(pageSource),
		false,
		`${surface.href}/page.tsx must remain a server component.`,
	);
	assert.equal(
		loadingSource.includes("<DashboardSection"),
		false,
		`${surface.href}/loading.tsx must delegate instead of duplicating layout.`,
	);

	const pageImports = collectSurfaceImports(pageSource);
	const loadingImports = collectSurfaceImports(loadingSource);
	assert.equal(
		pageImports.length,
		1,
		`${surface.href}/page.tsx must import exactly one route-local *Surface entry.`,
	);
	assert.equal(
		loadingImports.length,
		1,
		`${surface.href}/loading.tsx must import exactly one route-local *Surface entry.`,
	);
	const pageImport = pageImports[0];
	const loadingImport = loadingImports[0];
	assert.equal(
		pageImport.specifier,
		loadingImport.specifier,
		`${surface.href} page and loading boundaries must share one surface entry.`,
	);
	const liveExport = pageImport.exports.find((name) =>
		name.endsWith("Surface"),
	);
	const skeletonExport = loadingImport.exports.find((name) =>
		name.endsWith("SurfaceSkeleton"),
	);
	assert.ok(
		liveExport,
		`${surface.href} page must import a named *Surface export.`,
	);
	assert.ok(
		skeletonExport,
		`${surface.href} loading boundary must import a named *SurfaceSkeleton export.`,
	);
	assert.equal(
		skeletonExport,
		`${liveExport}Skeleton`,
		`${surface.href} live and skeleton exports must share a name.`,
	);

	const surfacePath = resolve(
		routeDirectory,
		`${pageImport.specifier.slice(2)}.tsx`,
	);
	assert.ok(
		existsSync(surfacePath),
		`${surface.href} is missing ${pageImport.specifier}.tsx.`,
	);
	const surfaceSource = readFileSync(surfacePath, "utf8");
	for (const requiredExport of [liveExport, skeletonExport]) {
		assert.match(
			surfaceSource,
			new RegExp(
				`export\\s+(?:async\\s+)?function\\s+${requiredExport}\\b|export\\s*{[^}]*\\b${requiredExport}\\b`,
			),
			`${normalize(relative(root, surfacePath))} must export ${requiredExport}.`,
		);
	}

	registeredPagePaths.add(normalize(relative(dashboardRoot, pagePath)));
}

const explicitExemptions = new Map([
	["[...catchAll]/page.tsx", "notFound("],
	["organization/members/page.tsx", "redirect("],
	["overview/page.tsx", "redirect("],
]);
const pageFiles: string[] = [];
const collectPages = (directory: string) => {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolutePath = resolve(directory, entry.name);
		if (entry.isDirectory()) collectPages(absolutePath);
		else if (entry.name === "page.tsx") pageFiles.push(absolutePath);
	}
};
collectPages(dashboardRoot);

for (const [exemptPath, requiredCall] of explicitExemptions) {
	const absolutePath = resolve(dashboardRoot, exemptPath);
	assert.ok(
		existsSync(absolutePath),
		`Stale dashboard page exemption: ${exemptPath}`,
	);
	assert.ok(
		readFileSync(absolutePath, "utf8").includes(requiredCall),
		`${exemptPath} must remain a ${requiredCall.replace("(", "")}-only boundary.`,
	);
}

for (const pagePath of pageFiles) {
	const relativePath = normalize(relative(dashboardRoot, pagePath));
	assert.ok(
		registeredPagePaths.has(relativePath) ||
			explicitExemptions.has(relativePath),
		`Nonregistered dashboard page requires an explicit redirect/catch-all exemption: ${relativePath}`,
	);
}

console.log(
	`Dashboard page policy verification passed for ${dashboardSurfaceRegistry.length} registered surfaces.`,
);
