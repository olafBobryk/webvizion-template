import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	resolveFeedbackStatus,
	resolveSupportRequestStatus,
} from "../../src/app/(site)/dashboard/_lib/platform/status";
import {
	getDashboardCapabilities,
	getDashboardSidebarGroups,
	getDashboardSurface,
	getDashboardSurfaceTrail,
} from "../../src/app/(site)/dashboard/_registry/surfaceRegistry";

const root = process.cwd();

const platformCapabilities = getDashboardCapabilities("owner", "admin");
const organizationAdminCapabilities = getDashboardCapabilities("admin");
assert.equal(platformCapabilities.has("platform.manage"), true);
assert.equal(organizationAdminCapabilities.has("platform.manage"), false);
assert.equal(
	getDashboardSurface("/dashboard/platform/inbox")?.id,
	"dashboard.platform.inbox",
);
assert.equal(
	getDashboardSurface("/dashboard/platform/inbox/support-demo")?.id,
	"dashboard.platform.inbox.request",
);
assert.equal(
	getDashboardSurface("/dashboard/platform/reports")?.id,
	"dashboard.platform.reports",
);
assert.equal(
	getDashboardSurface("/dashboard/platform/reports/report-demo")?.id,
	"dashboard.platform.report",
);
assert.deepEqual(
	getDashboardSurfaceTrail(
		"/dashboard/platform/reports/report-demo",
		platformCapabilities,
	).map((item) => item.label),
	["Platform", "Reports"],
);
assert.deepEqual(
	getDashboardSidebarGroups(platformCapabilities)
		.flatMap((group) => group.surfaces)
		.filter((surface) => surface.id.startsWith("dashboard.platform"))
		.map((surface) => surface.id),
	[],
);
assert.equal(
	resolveFeedbackStatus({
		currentStatus: "new",
		requestedStatus: "new",
		triageNote: "Reproduced on mobile.",
	}),
	"triaged",
);
assert.equal(
	resolveSupportRequestStatus({
		currentStatus: "new",
		internalNote: "Follow up with the requester.",
		requestedStatus: "new",
	}),
	"in_progress",
);

for (const routeFile of [
	"src/app/(site)/dashboard/support/page.tsx",
	"src/app/(site)/dashboard/platform/page.tsx",
	"src/app/(site)/dashboard/platform/loading.tsx",
	"src/app/(site)/dashboard/platform/inbox/page.tsx",
	"src/app/(site)/dashboard/platform/inbox/[id]/page.tsx",
	"src/app/(site)/dashboard/platform/reports/page.tsx",
	"src/app/(site)/dashboard/platform/reports/[id]/page.tsx",
	"src/app/api/support/route.ts",
	"src/app/api/feedback/route.ts",
	"src/app/api/platform/inbox/[id]/route.ts",
	"src/app/api/platform/reports/[id]/route.ts",
]) {
	assert.ok(existsSync(resolve(root, routeFile)), `Missing ${routeFile}`);
}

const platformPage = [
	"src/app/(site)/dashboard/platform/page.tsx",
	"src/app/(site)/dashboard/platform/_components/PlatformSurface.tsx",
]
	.map((relativePath) => readFileSync(resolve(root, relativePath), "utf8"))
	.join("\n");
assert.doesNotMatch(platformPage, /redirect\(/);
assert.match(platformPage, /href="\/dashboard\/platform\/inbox"/);
assert.match(platformPage, /href="\/dashboard\/platform\/reports"/);
assert.equal(
	existsSync(resolve(root, "src/app/(site)/platform/layout.tsx")),
	false,
);
assert.equal(
	existsSync(resolve(root, "src/app/(site)/platform/page.tsx")),
	false,
);

const authContracts = readFileSync(
	resolve(root, "src/lib/auth/contracts.ts"),
	"utf8",
);
assert.match(authContracts, /export type PlatformRole = "admin"/);
assert.match(authContracts, /platformRole: PlatformRole \| null/);

const fixtureCore = readFileSync(
	resolve(root, "src/lib/auth/fixture-core.ts"),
	"utf8",
);
assert.match(fixtureCore, /platformRole: "admin"/);
assert.match(fixtureCore, /platformRole: null/);

const reportModal = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/feedback/ReportIssueModal.tsx",
	),
	"utf8",
);
assert.doesNotMatch(reportModal, /FileInput|Attachments/);
assert.match(reportModal, /submitProductReport/);
assert.match(reportModal, /onCloseDisabledChange/);

const supportPage = readFileSync(
	resolve(root, "src/app/(site)/dashboard/support/page.tsx"),
	"utf8",
);
assert.doesNotMatch(supportPage, /<MemberIdentity|<OrganizationIdentity/);

const supportForm = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/support/_components/SupportRequestForm.tsx",
	),
	"utf8",
);
assert.match(supportForm, /<SelectInput/);
assert.match(supportForm, /name="membershipId"/);
assert.doesNotMatch(supportForm, /rounded-xl bg-input\/35/);
assert.doesNotMatch(supportForm, /<MemberIdentity|<OrganizationIdentity/);

const supportRoute = readFileSync(
	resolve(root, "src/app/api/support/route.ts"),
	"utf8",
);
assert.match(supportRoute, /readText\(formData, "membershipId"\)/);
assert.match(
	supportRoute,
	/applicationAdapters\.organizations\.getOrganization/,
);

const resetRoute = readFileSync(
	resolve(root, "src/app/api/debug/fixture/reset/route.ts"),
	"utf8",
);
assert.match(resetRoute, /resetPlatformFixtureState/);

console.log("Platform operations verification passed.");
