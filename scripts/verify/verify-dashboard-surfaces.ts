import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { isOrganizationInvitationPending } from "../../src/app/(site)/dashboard/_lib/entities/invitation/presentation";
import {
	dashboardDebugStates,
	isDashboardDebugState,
} from "../../src/app/(site)/dashboard/_registry/debug";
import {
	dashboardDomainAreaLabels,
	dashboardSurfaceRegistry,
	getDashboardCapabilities,
	getDashboardDomainAreaInventory,
	getDashboardDomainAreasForEditedPaths,
	getDashboardNavigationCommands,
	getDashboardSidebarGroups,
	getDashboardSurface,
	getDashboardSurfaceById,
	getDashboardSurfaceSourceRoots,
	getDashboardSurfaceTrail,
} from "../../src/app/(site)/dashboard/_registry/surfaceRegistry";

const root = process.cwd();
const memberCapabilities = getDashboardCapabilities("member");
const adminCapabilities = getDashboardCapabilities("admin");
const platformCapabilities = getDashboardCapabilities("owner", "admin");
const invitationNow = new Date("2026-07-23T12:00:00.000Z");
const pendingInvitation = {
	acceptedAt: null,
	createdAt: "2026-07-20T12:00:00.000Z",
	email: "member@example.com",
	expiresAt: "2026-07-30T12:00:00.000Z",
	id: "invitation-summary",
	organizationId: "org-demo",
	revokedAt: null,
	role: "member" as const,
	tokenHash: "summary-token",
};

const surfaceIds = new Set<string>();
const surfaceHrefs = new Set<string>();
const sourceRootOwners = new Map<string, string>();

for (const surface of dashboardSurfaceRegistry) {
	assert.ok(!surfaceIds.has(surface.id), `Duplicate surface id: ${surface.id}`);
	assert.ok(
		!surfaceHrefs.has(surface.href),
		`Duplicate surface href: ${surface.href}`,
	);
	assert.ok(
		surface.domainArea in dashboardDomainAreaLabels,
		`Unknown domain area for ${surface.id}: ${surface.domainArea}`,
	);
	if (surface.parentId) {
		assert.ok(
			getDashboardSurfaceById(surface.parentId),
			`Missing parent ${surface.parentId} for ${surface.id}`,
		);
	}

	for (const sourceRoot of getDashboardSurfaceSourceRoots(surface)) {
		assert.ok(
			!sourceRoot.startsWith("/") && !sourceRoot.includes(".."),
			`Source ownership must be repository-relative: ${sourceRoot}`,
		);
		assert.ok(
			existsSync(resolve(root, sourceRoot)),
			`Missing source ownership root for ${surface.id}: ${sourceRoot}`,
		);
		const existingOwner = sourceRootOwners.get(sourceRoot);
		assert.ok(
			!existingOwner,
			`Ambiguous source ownership root ${sourceRoot}: ${existingOwner} and ${surface.id}`,
		);
		sourceRootOwners.set(sourceRoot, surface.id);
	}

	surfaceIds.add(surface.id);
	surfaceHrefs.add(surface.href);
}

const dashboardRouteRoot = resolve(root, "src/app/(site)/dashboard");
const pageFiles: string[] = [];
function collectPageFiles(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolutePath = resolve(directory, entry.name);
		if (entry.isDirectory()) collectPageFiles(absolutePath);
		else if (entry.name === "page.tsx") pageFiles.push(absolutePath);
	}
}
collectPageFiles(dashboardRouteRoot);

const explicitRouteExemptions = new Map([
	[
		"[...catchAll]/page.tsx",
		"structural catch-all owned by the dashboard shell",
	],
	["overview/page.tsx", "redirect-only compatibility route"],
	["organization/members/page.tsx", "redirect-only compatibility route"],
]);

for (const [exemptPath] of explicitRouteExemptions) {
	assert.ok(
		pageFiles.some(
			(filePath) =>
				relative(dashboardRouteRoot, filePath).replaceAll("\\", "/") ===
				exemptPath,
		),
		`Stale dashboard route exemption: ${exemptPath}`,
	);
}

for (const pageFile of pageFiles) {
	const relativePagePath = relative(dashboardRouteRoot, pageFile).replaceAll(
		"\\",
		"/",
	);
	if (explicitRouteExemptions.has(relativePagePath)) continue;
	const routeDirectory = dirname(relativePagePath).replaceAll("\\", "/");
	const href =
		routeDirectory === "." ? "/dashboard" : `/dashboard/${routeDirectory}`;
	assert.ok(
		surfaceHrefs.has(href),
		`Dashboard page is missing a canonical surface: ${relativePagePath}`,
	);
}

for (const surface of dashboardSurfaceRegistry) {
	const routeSuffix = surface.href.slice("/dashboard".length);
	const pagePath = resolve(
		dashboardRouteRoot,
		`.${routeSuffix || ""}`,
		"page.tsx",
	);
	assert.ok(
		existsSync(pagePath),
		`Canonical surface is missing its dashboard page: ${surface.href}`,
	);
}

const domainInventory = getDashboardDomainAreaInventory();
const hasReferenceEntitySurfaces = existsSync(
	resolve(root, "src/app/(site)/dashboard/records/page.tsx"),
);
for (const areaId of [
	"dashboard-core",
	"account",
	"organization",
	"platform",
] as const) {
	assert.ok(
		domainInventory.some((area) => area.id === areaId),
		`Missing dashboard domain area: ${areaId}`,
	);
}
assert.ok(domainInventory.some((area) => area.id === "product"));
assert.ok(domainInventory.some((area) => area.id === "reference"));
assert.deepEqual(
	getDashboardDomainAreasForEditedPaths([
		"src/app/(site)/dashboard/records/page.tsx",
		"src/app/(site)/dashboard/platform/reports/page.tsx",
		"src/app/(site)/dashboard/records/loading.tsx",
	]).map((area) => area.id),
	["product", "platform"],
);
assert.deepEqual(
	getDashboardDomainAreasForEditedPaths([
		"src/app/(site)/dashboard/_registry/surfaceRegistry.ts",
		"src/app/api/auth/administration/invitations/route.ts",
		"src/app/(site)/dashboard/settings/page.tsx",
	]).map((area) => area.id),
	["dashboard-core", "account", "organization"],
);
assert.deepEqual(
	getDashboardDomainAreasForEditedPaths([
		"/absolute/path/src/app/(site)/dashboard/page.tsx",
		"src/app/(site)/(marketing)/page.tsx",
	]),
	[],
);
if (!hasReferenceEntitySurfaces) {
	assert.equal(
		domainInventory.some(
			(area) => area.id === "product" || area.id === "reference",
		),
		false,
	);
}

assert.equal(
	isOrganizationInvitationPending(pendingInvitation, invitationNow),
	true,
);
assert.equal(
	isOrganizationInvitationPending(
		{ ...pendingInvitation, expiresAt: "2026-07-22T12:00:00.000Z" },
		invitationNow,
	),
	false,
);
assert.equal(
	isOrganizationInvitationPending(
		{ ...pendingInvitation, acceptedAt: "2026-07-22T12:00:00.000Z" },
		invitationNow,
	),
	false,
);
assert.equal(
	isOrganizationInvitationPending(
		{ ...pendingInvitation, revokedAt: "2026-07-22T12:00:00.000Z" },
		invitationNow,
	),
	false,
);

assert.equal(
	getDashboardSurface("/dashboard/records/north-star")?.id,
	"dashboard.record",
);
assert.equal(
	getDashboardSurface(
		"/dashboard/organization/members/membership-template-owner",
	)?.id,
	"dashboard.organization.member",
);
assert.equal(
	getDashboardSurface("/dashboard/reference/entities")?.id,
	"dashboard.reference.entities",
);
assert.equal(getDashboardSurface("/dashboard/pages"), null);
assert.equal(
	getDashboardSurface("/dashboard/support")?.id,
	"dashboard.support",
);
assert.equal(
	getDashboardSurface("/dashboard/profile")?.id,
	"dashboard.profile",
);
assert.equal(
	getDashboardSurface("/dashboard/administration")?.id,
	"dashboard.administration",
);
assert.equal(
	getDashboardSurface("/dashboard/platform")?.id,
	"dashboard.platform",
);
assert.equal(
	getDashboardSurface("/dashboard/platform/inbox")?.id,
	"dashboard.platform.inbox",
);
assert.equal(
	getDashboardSurface("/dashboard/platform/reports/report-demo")?.id,
	"dashboard.platform.report",
);

const memberSidebarIds = getDashboardSidebarGroups(memberCapabilities)
	.flatMap((group) => group.surfaces)
	.map((surface) => surface.id);
assert.ok(memberSidebarIds.includes("dashboard.records"));
assert.ok(!memberSidebarIds.includes("dashboard.organization.settings"));
assert.ok(!memberSidebarIds.includes("dashboard.profile"));
assert.ok(!memberSidebarIds.includes("dashboard.administration"));

const adminSidebarIds = getDashboardSidebarGroups(adminCapabilities)
	.flatMap((group) => group.surfaces)
	.map((surface) => surface.id);
assert.ok(adminSidebarIds.includes("dashboard.organization.settings"));
assert.ok(!adminSidebarIds.includes("dashboard.profile"));
assert.ok(!adminSidebarIds.includes("dashboard.administration"));
assert.ok(!adminSidebarIds.includes("dashboard.platform.inbox"));

const platformSidebarIds = getDashboardSidebarGroups(platformCapabilities)
	.flatMap((group) => group.surfaces)
	.map((surface) => surface.id);
assert.ok(!platformSidebarIds.includes("dashboard.platform"));
assert.ok(!platformSidebarIds.includes("dashboard.platform.inbox"));
assert.ok(!platformSidebarIds.includes("dashboard.platform.reports"));

const memberCommands = getDashboardNavigationCommands(memberCapabilities);
const adminCommands = getDashboardNavigationCommands(adminCapabilities);
const memberCommandIds = memberCommands.map((command) => command.id);
const adminCommandIds = adminCommands.map((command) => command.id);
assert.ok(memberCommandIds.includes("navigate.dashboard.profile"));
assert.ok(!memberCommandIds.includes("navigate.dashboard.administration"));
assert.ok(!memberCommandIds.includes("administration.invite"));
assert.ok(adminCommandIds.includes("navigate.dashboard.profile"));
assert.ok(adminCommandIds.includes("navigate.dashboard.administration"));
assert.ok(adminCommandIds.includes("administration.invite"));
assert.ok(!memberCommandIds.includes("records.create"));
assert.ok(adminCommandIds.includes("records.create"));

assert.deepEqual(
	getDashboardSurfaceTrail(
		"/dashboard/records/north-star",
		memberCapabilities,
	).map((item) => item.label),
	["Records"],
);
assert.deepEqual(
	getDashboardSurfaceTrail(
		"/dashboard/platform/inbox/support-demo",
		platformCapabilities,
	).map((item) => item.label),
	["Platform", "Inbox"],
);
assert.deepEqual(
	getDashboardSurfaceTrail(
		"/dashboard/organization/members/membership-template-owner",
		adminCapabilities,
	).map((item) => item.label),
	["Organization", "Organization settings", "Administration"],
);

assert.deepEqual(
	getDashboardSurfaceTrail("/dashboard", memberCapabilities),
	[],
);
assert.deepEqual(
	getDashboardSurfaceTrail("/dashboard/settings", memberCapabilities),
	[],
);
assert.deepEqual(
	getDashboardSurfaceTrail("/dashboard/support", memberCapabilities),
	[],
);
assert.deepEqual(
	getDashboardSurfaceTrail(
		"/dashboard/organization/settings",
		adminCapabilities,
	),
	[{ href: "/dashboard/organization", label: "Organization" }],
);
assert.deepEqual(
	getDashboardSurfaceTrail("/dashboard/administration", adminCapabilities).map(
		(item) => item.label,
	),
	["Organization", "Organization settings"],
);
assert.equal(
	adminCommands.find(
		(command) => command.id === "navigate.dashboard.administration",
	)?.parentId,
	"navigate.dashboard.organization.settings",
);

for (const routeFile of [
	"src/app/(site)/dashboard/page.tsx",
	"src/app/(site)/dashboard/records/page.tsx",
	"src/app/(site)/dashboard/records/[recordId]/page.tsx",
	"src/app/(site)/dashboard/settings/page.tsx",
	"src/app/(site)/dashboard/profile/page.tsx",
	"src/app/(site)/dashboard/profile/loading.tsx",
	"src/app/(site)/dashboard/administration/page.tsx",
	"src/app/(site)/dashboard/administration/loading.tsx",
	"src/app/(site)/dashboard/support/page.tsx",
	"src/app/(site)/dashboard/platform/page.tsx",
	"src/app/(site)/dashboard/platform/loading.tsx",
	"src/app/(site)/dashboard/platform/inbox/page.tsx",
	"src/app/(site)/dashboard/platform/inbox/[id]/page.tsx",
	"src/app/(site)/dashboard/platform/reports/page.tsx",
	"src/app/(site)/dashboard/platform/reports/[id]/page.tsx",
	"src/app/(site)/dashboard/organization/page.tsx",
	"src/app/(site)/dashboard/organization/members/page.tsx",
	"src/app/(site)/dashboard/organization/members/[memberId]/page.tsx",
	"src/app/(site)/dashboard/organization/settings/page.tsx",
	"src/app/(site)/dashboard/reference/entities/page.tsx",
]) {
	assert.ok(existsSync(resolve(root, routeFile)), `Missing ${routeFile}`);
}
assert.ok(
	!existsSync(resolve(root, "src/app/(site)/dashboard/pages/page.tsx")),
);
assert.ok(!existsSync(resolve(root, "src/app/(site)/platform/layout.tsx")));
assert.ok(!existsSync(resolve(root, "src/app/(site)/platform/page.tsx")));

const globalRoutes = readFileSync(
	resolve(root, "src/config/routes.ts"),
	"utf8",
);
assert.ok(!globalRoutes.includes('dashboard: "/dashboard"'));

const commandProvider = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/commands/DashboardCommandProvider.tsx",
	),
	"utf8",
);
assert.ok(commandProvider.includes("return context.register"));
assert.ok(commandProvider.includes("next.delete(token)"));

assert.deepEqual(dashboardDebugStates, [
	"loading",
	"empty",
	"error",
	"unavailable",
	"not-found",
]);
assert.equal(isDashboardDebugState("loading"), true);
assert.equal(isDashboardDebugState("unknown"), false);

console.log("Dashboard surface registry verification passed.");
