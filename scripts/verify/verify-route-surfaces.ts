import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
	defaultSiteLayout,
	getSiteLinkHref,
	type SiteLayoutDocument,
} from "../../src/app/(site)/_components/layout/siteLayout";
import { appSurfaceRegistry, internalRoutes } from "../../src/config/surfaces";
import {
	assertRouteSurfaceRegistry,
	type RouteSurfaceBase,
} from "../../src/lib/surfaces/routeSurface";

const root = process.cwd();
const appRoot = resolve(root, "src/app");
const familyRoots = {
	auth: resolve(appRoot, "(site)/(auth)"),
	dashboard: resolve(appRoot, "(site)/dashboard"),
	marketing: resolve(appRoot, "(site)/(marketing)"),
} as const;

const normalize = (value: string) => value.replaceAll("\\", "/");
const routeSurfaces: readonly RouteSurfaceBase[] = appSurfaceRegistry;

function pagePathForSurface(surface: RouteSurfaceBase) {
	if (surface.family === "marketing") {
		return surface.href === "/"
			? resolve(familyRoots.marketing, "(home)/page.tsx")
			: resolve(familyRoots.marketing, `.${surface.href}`, "page.tsx");
	}
	if (surface.family === "auth") {
		return resolve(familyRoots.auth, `.${surface.href}`, "page.tsx");
	}
	return resolve(appRoot, `(site)${surface.href}`, "page.tsx");
}

function collectPages(directory: string) {
	const pages: string[] = [];
	if (!existsSync(directory)) return pages;
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolutePath = resolve(directory, entry.name);
		if (entry.isDirectory()) pages.push(...collectPages(absolutePath));
		else if (entry.name === "page.tsx") pages.push(absolutePath);
	}
	return pages;
}

async function main() {
	assertRouteSurfaceRegistry(routeSurfaces);

	const siteLayoutSource = readFileSync(
		resolve(appRoot, "(site)/_components/layout/siteLayout.ts"),
		"utf8",
	);
	assert.doesNotMatch(
		siteLayoutSource,
		/process\.env\.NODE_ENV/,
		"Installed navigation must not disappear from production builds.",
	);

	const marketingFallbackPath = resolve(
		root,
		"src/lib/marketing-content/fallback.ts",
	);
	const marketingFallback = existsSync(marketingFallbackPath)
		? ((await import(pathToFileURL(marketingFallbackPath).href)) as {
				fallbackSiteLayout: SiteLayoutDocument;
			})
		: null;
	const navigationLayout =
		marketingFallback?.fallbackSiteLayout ?? defaultSiteLayout;

	const installedShellHrefs = new Set(
		defaultSiteLayout.header.menuGroups.flatMap((group) => [
			...(group.link ? [getSiteLinkHref(group.link)] : []),
			...(group.links ?? []).map(getSiteLinkHref),
		]),
	);
	const marketingHeaderHrefs = new Set(
		navigationLayout.header.menuGroups.flatMap((group) => [
			...(group.link ? [getSiteLinkHref(group.link)] : []),
			...(group.links ?? []).map(getSiteLinkHref),
		]),
	);
	const topLevelInternalHrefs = Object.values(internalRoutes).filter(
		(href) => href.split("/").filter(Boolean).length === 2,
	);
	for (const href of topLevelInternalHrefs) {
		assert.ok(
			installedShellHrefs.has(href),
			`Installed internal route ${href} is missing from the header menu.`,
		);
	}
	for (const surface of routeSurfaces) {
		if (surface.family !== "marketing" || surface.match !== "exact") continue;
		assert.ok(
			marketingHeaderHrefs.has(surface.href),
			`Installed marketing route ${surface.href} is missing from the header menu.`,
		);
	}

	for (const [family, familyRoot] of Object.entries(familyRoots)) {
		const installedInRoutes = routeSurfaces.some(
			(surface) => surface.family === family,
		);
		assert.equal(
			existsSync(familyRoot),
			installedInRoutes,
			`${family} route tree and installed surface registry must be added or removed together.`,
		);
	}

	const registeredPages = new Set<string>();
	for (const surface of routeSurfaces) {
		const pagePath = pagePathForSurface(surface);
		assert.ok(
			existsSync(pagePath),
			`Route surface ${surface.id} is missing ${normalize(relative(root, pagePath))}.`,
		);
		registeredPages.add(normalize(relative(appRoot, pagePath)));
	}

	const explicitPageExemptions = new Set([
		"(site)/(marketing)/[...catchAll]/page.tsx",
		"(site)/dashboard/[...catchAll]/page.tsx",
		"(site)/dashboard/organization/members/page.tsx",
		"(site)/dashboard/overview/page.tsx",
	]);

	for (const familyRoot of Object.values(familyRoots)) {
		for (const pagePath of collectPages(familyRoot)) {
			const relativePath = normalize(relative(appRoot, pagePath));
			if (relativePath.startsWith("(site)/(marketing)/internal/")) continue;
			assert.ok(
				registeredPages.has(relativePath) ||
					explicitPageExemptions.has(relativePath),
				`Page requires one route-surface owner or explicit exemption: ${relativePath}`,
			);
		}
	}

	for (const exemption of explicitPageExemptions) {
		const familyInstalled = exemption.includes("/(marketing)/")
			? existsSync(familyRoots.marketing)
			: existsSync(familyRoots.dashboard);
		if (familyInstalled) {
			assert.ok(
				existsSync(resolve(appRoot, exemption)),
				`Stale route-surface page exemption: ${exemption}`,
			);
		}
	}

	console.log(
		`Route-surface verification passed for ${appSurfaceRegistry.length} installed surfaces.`,
	);
}

void main();
