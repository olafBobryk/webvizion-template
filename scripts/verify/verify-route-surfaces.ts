import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { appSurfaceRegistry } from "../../src/config/surfaces";
import { assertRouteSurfaceRegistry } from "../../src/lib/surfaces/routeSurface";

const root = process.cwd();
const appRoot = resolve(root, "src/app");
const familyRoots = {
	auth: resolve(appRoot, "(site)/(auth)"),
	dashboard: resolve(appRoot, "(site)/dashboard"),
	marketing: resolve(appRoot, "(site)/(marketing)"),
} as const;

const normalize = (value: string) => value.replaceAll("\\", "/");

function pagePathForSurface(surface: (typeof appSurfaceRegistry)[number]) {
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

assertRouteSurfaceRegistry(appSurfaceRegistry);

for (const [family, familyRoot] of Object.entries(familyRoots)) {
	const installedInRoutes = appSurfaceRegistry.some(
		(surface) => surface.family === family,
	);
	assert.equal(
		existsSync(familyRoot),
		installedInRoutes,
		`${family} route tree and installed surface registry must be added or removed together.`,
	);
}

const registeredPages = new Set<string>();
for (const surface of appSurfaceRegistry) {
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
