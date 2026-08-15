import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Metadata } from "next";
import {
	marketingDocumentSurfaceIds,
	siteMetadata,
	staticPageMetadata,
} from "@/config/metadataConfig";
import { appSurfaceRegistry } from "@/config/surfaces";
import {
	createMarketingPageMetadata,
	createPrivateRouteMetadata,
} from "@/lib/metadata";
import type { RouteSurfaceBase } from "@/lib/surfaces/routeSurface";

const root = process.cwd();
const routeSurfaces = appSurfaceRegistry as readonly (RouteSurfaceBase &
	Record<string, unknown>)[];

function absoluteTitle(metadata: Metadata) {
	assert.ok(
		metadata.title &&
			typeof metadata.title === "object" &&
			"absolute" in metadata.title,
		"Route metadata must set an absolute document title.",
	);
	return metadata.title.absolute;
}

function assertMetadataParity(metadata: Metadata, expectedTitle: string) {
	assert.equal(absoluteTitle(metadata), expectedTitle);
	assert.equal(metadata.openGraph?.title, expectedTitle);
	assert.equal(metadata.twitter?.title, expectedTitle);
	assert.equal(metadata.openGraph?.description, metadata.description);
	assert.equal(metadata.twitter?.description, metadata.description);
}

function assertRobots(metadata: Metadata, index: boolean) {
	assert.ok(
		metadata.robots && typeof metadata.robots === "object",
		"Route metadata must declare structured robots policy.",
	);
	assert.equal(metadata.robots.index, index);
	assert.equal(metadata.robots.follow, index);
}

function read(relativePath: string) {
	return readFileSync(resolve(root, relativePath), "utf8");
}

function assertFactoryCall(relativePath: string, factory: string) {
	const source = read(relativePath);
	assert.match(
		source,
		new RegExp(`\\b${factory}\\b`),
		`${relativePath} must use ${factory}.`,
	);
}

function pagePathForMarketingHref(href: string) {
	return href === "/"
		? "src/app/(site)/(marketing)/(home)/page.tsx"
		: `src/app/(site)/(marketing)${href}/page.tsx`;
}

function verifyExplicitExemptions() {
	for (const redirectPage of [
		"src/app/(site)/dashboard/overview/page.tsx",
		"src/app/(site)/dashboard/organization/members/page.tsx",
	]) {
		if (!existsSync(resolve(root, redirectPage))) continue;
		assert.match(read(redirectPage), /\bredirect\(/);
	}

	for (const notFoundPage of [
		"src/app/(site)/(marketing)/[...catchAll]/page.tsx",
		"src/app/(site)/dashboard/[...catchAll]/page.tsx",
	]) {
		if (!existsSync(resolve(root, notFoundPage))) continue;
		assert.match(read(notFoundPage), /\bnotFound\(/);
	}

	const componentExportLayout =
		"src/app/(component-export)/internal/demo/layout.tsx";
	if (existsSync(resolve(root, componentExportLayout))) {
		const source = read(componentExportLayout);
		assert.match(source, /index:\s*false/);
		assert.match(source, /follow:\s*false/);
	}
}

async function verifyDashboardOwnership() {
	const registryPath = resolve(
		root,
		"src/app/(site)/dashboard/_registry/surfaceRegistry.ts",
	);
	if (!existsSync(registryPath)) return;

	const registryModule = (await import(pathToFileURL(registryPath).href)) as {
		dashboardSurfaceRegistry: Array<{
			description: string;
			id: string;
			label: string;
		}>;
		getDashboardSurface(pathname: string): { id: string } | null;
	};
	assert.ok(registryModule.dashboardSurfaceRegistry.length > 0);
	for (const surface of registryModule.dashboardSurfaceRegistry) {
		assert.ok(surface.label.trim(), `${surface.id} requires a metadata label.`);
		assert.ok(
			surface.description.trim(),
			`${surface.id} requires a metadata description.`,
		);
	}
	assert.equal(registryModule.getDashboardSurface("/not-dashboard"), null);
	assertFactoryCall(
		"src/app/(site)/dashboard/layout.tsx",
		"createPrivateRouteMetadata",
	);
	assert.match(
		read("src/app/(site)/dashboard/layout.tsx"),
		/\bgetDashboardSurface\b/,
	);
}

async function main() {
	const privateMetadata = createPrivateRouteMetadata({
		description: "Private support route.",
		path: "/dashboard/support",
		title: "Support",
	});
	assertMetadataParity(privateMetadata, `Support | ${siteMetadata.name}`);
	assertRobots(privateMetadata, false);
	assert.equal(privateMetadata.alternates?.canonical, "/dashboard/support");

	const marketingMetadata = createMarketingPageMetadata({
		description: "Public contact route.",
		path: "/contact",
		title: "Contact",
	});
	assertMetadataParity(marketingMetadata, `${siteMetadata.name} | Contact`);
	assertRobots(marketingMetadata, true);

	const homeMetadata = createMarketingPageMetadata({
		description: "Public homepage.",
		home: true,
		path: "/",
		title: "Home",
	});
	assertMetadataParity(homeMetadata, siteMetadata.name);
	assertRobots(homeMetadata, true);

	const installedAuthSurfaces = routeSurfaces.filter(
		(surface) => surface.family === "auth",
	);
	for (const surface of installedAuthSurfaces) {
		assert.ok(typeof surface.label === "string" && surface.label.trim());
		assert.ok(
			typeof surface.description === "string" && surface.description.trim(),
		);
	}
	const authRegistryPath = resolve(root, "src/config/surfaces/auth.ts");
	if (existsSync(authRegistryPath)) {
		const authModule = (await import(pathToFileURL(authRegistryPath).href)) as {
			getAuthSurface(pathname: string): { id: string } | null;
		};
		for (const surface of installedAuthSurfaces) {
			assert.equal(authModule.getAuthSurface(surface.href)?.id, surface.id);
		}
		assert.equal(authModule.getAuthSurface("/not-auth"), null);
	}
	if (existsSync(resolve(root, "src/app/(site)/(auth)/layout.tsx"))) {
		assertFactoryCall(
			"src/app/(site)/(auth)/layout.tsx",
			"createPrivateRouteMetadata",
		);
		assert.doesNotMatch(
			read("src/app/(site)/(auth)/invitation/page.tsx"),
			/export const metadata:[\s\S]{0,160}\btitle\s*:/,
		);
	}

	await verifyDashboardOwnership();

	const installedMarketingSurfaces = routeSurfaces.filter(
		(surface) => surface.family === "marketing" && surface.match === "exact",
	);
	const documentSurfaceIds = new Set<string>(marketingDocumentSurfaceIds);
	const expectedStaticIds = installedMarketingSurfaces
		.map((surface) => surface.id)
		.filter((surfaceId) => !documentSurfaceIds.has(surfaceId))
		.sort();
	assert.deepStrictEqual(
		Object.keys(staticPageMetadata).sort(),
		expectedStaticIds,
	);

	for (const surface of installedMarketingSurfaces) {
		const pagePath = pagePathForMarketingHref(surface.href);
		assert.ok(
			existsSync(resolve(root, pagePath)),
			`${surface.id} requires a page.`,
		);
		if (documentSurfaceIds.has(surface.id)) {
			assertFactoryCall(pagePath, "createMarketingPageMetadata");
			assert.match(read(pagePath), /\bgetMarketingPage\b/);
			continue;
		}

		const layoutPath = pagePath.replace(/page\.tsx$/, "layout.tsx");
		const metadataOwner = existsSync(resolve(root, layoutPath))
			? layoutPath
			: pagePath;
		assertFactoryCall(metadataOwner, "createStaticMarketingPageMetadata");
		assert.match(
			read(metadataOwner),
			new RegExp(`createStaticMarketingPageMetadata\\(\\s*["']${surface.id}`),
		);
	}
	if (
		existsSync(resolve(root, "src/lib/marketing-content/resolvers.ts")) &&
		installedMarketingSurfaces.length > 0
	) {
		const resolverSource = read("src/lib/marketing-content/resolvers.ts");
		assert.match(resolverSource, /\bcache\(/);
		assert.match(resolverSource, /\bgetConfiguredMarketingPage\b/);
	}

	const internalLayoutCandidates = [
		"src/app/(site)/(dev)/internal/layout.tsx",
		"src/app/(site)/(marketing)/internal/layout.tsx",
	];
	const internalLayout = internalLayoutCandidates.find((candidate) =>
		existsSync(resolve(root, candidate)),
	);
	if (internalLayout) {
		assertFactoryCall(internalLayout, "createPrivateRouteMetadata");
	}

	if (existsSync(resolve(root, "src/app/(site)/dashboard/support/page.tsx"))) {
		assert.doesNotMatch(
			read("src/app/(site)/dashboard/support/page.tsx"),
			/export const metadata:[\s\S]{0,160}\btitle\s*:/,
		);
	}
	verifyExplicitExemptions();

	console.log(
		`Route metadata verified for ${routeSurfaces.length} installed route surfaces.`,
	);
}

void main();
