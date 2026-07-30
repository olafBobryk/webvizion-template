import type { IconName } from "@/components/ui/icons/Icon";
import {
	type DashboardRouteSurface,
	type DashboardSurfaceId,
	dashboardRouteSurfaceRegistry,
} from "@/config/surfaces/dashboard";
import type { MembershipRole, PlatformRole } from "@/lib/auth/contracts";
import { hrefFor, type StaticAppSurfaceId, surfaceHref } from "@/lib/routes";
import { matchesRouteSurface } from "@/lib/surfaces/routeSurface";

export type { DashboardSurfaceId } from "@/config/surfaces/dashboard";

export type DashboardCapability =
	| "dashboard.view"
	| "records.read"
	| "records.write"
	| "organization.read"
	| "organization.manage"
	| "platform.manage"
	| "debug.use";

export const dashboardCapabilityLabels = {
	"dashboard.view": "Dashboard",
	"debug.use": "Debug tools",
	"organization.manage": "Manage organization",
	"organization.read": "View organization",
	"platform.manage": "Manage platform",
	"records.read": "View records",
	"records.write": "Manage records",
} satisfies Record<DashboardCapability, string>;

export type DashboardLayoutWidth = "standard" | "wide";
export type DashboardSidebarTier = "primary" | "secondary" | "utility";

export type DashboardDomainAreaId =
	| "dashboard-core"
	| "product"
	| "account"
	| "organization"
	| "platform"
	| "reference";

export const dashboardDomainAreaLabels = {
	"dashboard-core": "Dashboard core",
	product: "Product",
	account: "Account",
	organization: "Organization",
	platform: "Platform",
	reference: "Reference",
} as const satisfies Record<DashboardDomainAreaId, string>;

export type DashboardCommandDefinition = {
	capability?: DashboardCapability;
	description: string;
	id: string;
	keywords: readonly string[];
	label: string;
	search?: Readonly<Record<string, boolean | number | string>>;
	surfaceId: StaticAppSurfaceId<DashboardRouteSurface>;
};

type DashboardSurfaceMetadata = {
	capability?: DashboardCapability;
	commands: readonly DashboardCommandDefinition[];
	description: string;
	domainArea: DashboardDomainAreaId;
	icon: IconName;
	id: DashboardSurfaceId;
	label: string;
	layoutWidth: DashboardLayoutWidth;
	parentId?: DashboardSurfaceId;
	sidebar: boolean;
	sidebarTier: DashboardSidebarTier;
	sourceRoots?: readonly string[];
};

export type DashboardSurface = DashboardRouteSurface &
	Omit<DashboardSurfaceMetadata, "id">;

type DashboardSurfaceTrailItem = {
	href: string;
	label: string;
};

const dashboardSurfaceMetadataRegistry = [
	{
		commands: [],
		description: "Open the organization overview and recent product activity.",
		domainArea: "dashboard-core",
		icon: "home",
		id: "dashboard.overview",
		label: "Overview",
		layoutWidth: "standard",
		sidebar: true,
		sidebarTier: "primary",
	},
	{
		capability: "records.read",
		commands: [
			{
				capability: "records.write",
				description: "Open the record collection with its create action ready.",
				id: "records.create",
				keywords: ["new", "add", "entity"],
				label: "Create record",
				search: { action: "create" },
				surfaceId: "dashboard.records",
			},
		],
		description: "Browse the organization-scoped reference record collection.",
		domainArea: "product",
		icon: "database",
		id: "dashboard.records",
		label: "Records",
		layoutWidth: "wide",
		sidebar: true,
		sidebarTier: "primary",
		sourceRoots: [
			"src/app/(site)/dashboard/_components/entities/record",
			"src/app/(site)/dashboard/_lib/entities/record",
			"src/app/(site)/dashboard/_lib/fixtures/reference-records.core.ts",
			"src/app/(site)/dashboard/_lib/fixtures/reference-records.server.ts",
		],
	},
	{
		capability: "records.read",
		commands: [],
		description: "Review one organization-scoped reference record.",
		domainArea: "product",
		icon: "cards",
		id: "dashboard.record",
		label: "Record",
		layoutWidth: "standard",
		parentId: "dashboard.records",
		sidebar: false,
		sidebarTier: "primary",
	},
	{
		commands: [],
		description: "Manage the current account and application preferences.",
		domainArea: "account",
		icon: "gear",
		id: "dashboard.settings",
		label: "Account settings",
		layoutWidth: "standard",
		sidebar: true,
		sidebarTier: "utility",
		sourceRoots: [
			"src/app/(site)/dashboard/_components/entities/account",
			"src/app/(site)/dashboard/_lib/entities/account",
			"src/app/api/auth/password-recovery",
			"src/app/api/auth/reset-password",
		],
	},
	{
		capability: "dashboard.view",
		commands: [],
		description: "Review the signed-in account and active organization access.",
		domainArea: "account",
		icon: "user",
		id: "dashboard.profile",
		label: "Profile",
		layoutWidth: "standard",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "organization.manage",
		commands: [
			{
				capability: "organization.manage",
				description:
					"Open Administration and create a local organization invitation.",
				id: "administration.invite",
				keywords: ["invite", "member", "access", "organization"],
				label: "Invite member",
				search: { action: "invite" },
				surfaceId: "dashboard.administration",
			},
		],
		description:
			"Manage organization invitations, memberships, roles, and ownership.",
		domainArea: "organization",
		icon: "shield",
		id: "dashboard.administration",
		label: "Administration",
		layoutWidth: "wide",
		parentId: "dashboard.organization.settings",
		sidebar: false,
		sidebarTier: "secondary",
		sourceRoots: [
			"src/app/(site)/dashboard/_components/entities/member",
			"src/app/(site)/dashboard/_lib/entities/invitation",
			"src/app/(site)/dashboard/_lib/entities/member",
			"src/app/api/auth/administration",
		],
	},
	{
		capability: "dashboard.view",
		commands: [],
		description: "Email support or save a request to the demo Platform Inbox.",
		domainArea: "dashboard-core",
		icon: "question",
		id: "dashboard.support",
		label: "Support",
		layoutWidth: "standard",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "platform.manage",
		commands: [],
		description: "Open internal platform support and report operations.",
		domainArea: "platform",
		icon: "shield",
		id: "dashboard.platform",
		label: "Platform",
		layoutWidth: "wide",
		sidebar: false,
		sidebarTier: "utility",
		sourceRoots: [
			"src/app/(site)/dashboard/_lib/platform",
			"src/app/api/platform",
		],
	},
	{
		capability: "platform.manage",
		commands: [],
		description: "Review support requests submitted from dashboard support.",
		domainArea: "platform",
		icon: "mail",
		id: "dashboard.platform.inbox",
		label: "Inbox",
		layoutWidth: "wide",
		parentId: "dashboard.platform",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "platform.manage",
		commands: [],
		description: "Triage one dashboard support request.",
		domainArea: "platform",
		icon: "mail",
		id: "dashboard.platform.inbox.request",
		label: "Support request",
		layoutWidth: "wide",
		parentId: "dashboard.platform.inbox",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "platform.manage",
		commands: [],
		description: "Review product reports captured from dashboard routes.",
		domainArea: "platform",
		icon: "flag",
		id: "dashboard.platform.reports",
		label: "Reports",
		layoutWidth: "wide",
		parentId: "dashboard.platform",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "platform.manage",
		commands: [],
		description: "Triage one structured product report.",
		domainArea: "platform",
		icon: "flag",
		id: "dashboard.platform.report",
		label: "Product report",
		layoutWidth: "wide",
		parentId: "dashboard.platform.reports",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "organization.read",
		commands: [],
		description: "Review the active organization and its product boundary.",
		domainArea: "organization",
		icon: "building",
		id: "dashboard.organization",
		label: "Organization",
		layoutWidth: "standard",
		sidebar: false,
		sidebarTier: "secondary",
		sourceRoots: [
			"src/app/(site)/dashboard/_components/entities/organization",
			"src/app/(site)/dashboard/_lib/entities/organization",
			"src/app/api/auth/organization",
		],
	},
	{
		capability: "organization.read",
		commands: [],
		description: "Choose the active organization for this dashboard session.",
		domainArea: "organization",
		icon: "users",
		id: "dashboard.organization.switch",
		label: "Switch organization",
		layoutWidth: "standard",
		parentId: "dashboard.organization",
		sidebar: false,
		sidebarTier: "secondary",
	},
	{
		capability: "organization.read",
		commands: [],
		description: "Review one organization-scoped member presentation.",
		domainArea: "organization",
		icon: "user",
		id: "dashboard.organization.member",
		label: "Member",
		layoutWidth: "standard",
		parentId: "dashboard.administration",
		sidebar: false,
		sidebarTier: "secondary",
	},
	{
		capability: "organization.manage",
		commands: [],
		description: "Manage organization identity and product defaults.",
		domainArea: "organization",
		icon: "sliders",
		id: "dashboard.organization.settings",
		label: "Organization settings",
		layoutWidth: "standard",
		parentId: "dashboard.organization",
		sidebar: true,
		sidebarTier: "secondary",
	},
	{
		capability: "debug.use",
		commands: [],
		description: "Review live and skeleton entity presentation contracts.",
		domainArea: "reference",
		icon: "cards",
		id: "dashboard.reference.entities",
		label: "Entity reference",
		layoutWidth: "wide",
		parentId: "dashboard.overview",
		sidebar: false,
		sidebarTier: "utility",
	},
	{
		capability: "debug.use",
		commands: [],
		description: "Review component-owned loading geometry side by side.",
		domainArea: "reference",
		icon: "spinner",
		id: "dashboard.reference.skeletons",
		label: "Skeleton reference",
		layoutWidth: "wide",
		parentId: "dashboard.overview",
		sidebar: false,
		sidebarTier: "utility",
	},
] as const satisfies readonly DashboardSurfaceMetadata[];

export const dashboardSurfaceRegistry: readonly DashboardSurface[] =
	dashboardRouteSurfaceRegistry.map((routeSurface) => {
		const metadata = dashboardSurfaceMetadataRegistry.find(
			(candidate) => candidate.id === routeSurface.id,
		);
		if (!metadata) {
			throw new Error(`Missing dashboard metadata for ${routeSurface.id}.`);
		}
		return { ...routeSurface, ...metadata } as DashboardSurface;
	});

export type DashboardDomainAreaInventoryItem = {
	id: DashboardDomainAreaId;
	label: string;
	surfaceCount: number;
	surfaceIds: DashboardSurfaceId[];
	surfaceLabels: string[];
};

const DASHBOARD_ROUTE_SOURCE_ROOT = "src/app/(site)/dashboard";

function normalizeRepositoryPath(value: string) {
	const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
	if (
		!normalized ||
		normalized.startsWith("/") ||
		normalized === ".." ||
		normalized.startsWith("../") ||
		normalized.includes("/../")
	) {
		return null;
	}
	return normalized.replace(/\/$/, "");
}

function repositoryPathMatchesRoot(repositoryPath: string, root: string) {
	return repositoryPath === root || repositoryPath.startsWith(`${root}/`);
}

export function getDashboardSurfaceSourceRoots(surface: DashboardSurface) {
	const routeSuffix = surface.href.slice(hrefFor("dashboard.overview").length);
	return [
		`${DASHBOARD_ROUTE_SOURCE_ROOT}${routeSuffix}`,
		...(surface.sourceRoots ?? []),
	] as const;
}

export function getDashboardDomainAreaInventory() {
	return (
		Object.entries(dashboardDomainAreaLabels) as [
			DashboardDomainAreaId,
			string,
		][]
	)
		.map(([id, label]) => {
			const surfaces = dashboardSurfaceRegistry.filter(
				(surface) => surface.domainArea === id,
			);
			return {
				id,
				label,
				surfaceCount: surfaces.length,
				surfaceIds: surfaces.map((surface) => surface.id),
				surfaceLabels: surfaces.map((surface) => surface.label),
			} satisfies DashboardDomainAreaInventoryItem;
		})
		.filter((area) => area.surfaceCount > 0);
}

export function getDashboardDomainAreasForEditedPaths(
	editedPaths: readonly string[],
) {
	const ownership = dashboardSurfaceRegistry
		.flatMap((surface) =>
			getDashboardSurfaceSourceRoots(surface).map((root) => ({
				areaId: surface.domainArea,
				root,
			})),
		)
		.sort((left, right) => right.root.length - left.root.length);
	const matchedAreas = new Set<DashboardDomainAreaId>();

	for (const editedPath of editedPaths) {
		const normalizedPath = normalizeRepositoryPath(editedPath);
		if (!normalizedPath) continue;
		const match = ownership.find(({ root }) =>
			repositoryPathMatchesRoot(normalizedPath, root),
		);
		if (match) matchedAreas.add(match.areaId);
	}

	return getDashboardDomainAreaInventory().filter((area) =>
		matchedAreas.has(area.id),
	);
}

export const dashboardFeatureConfig = {
	organizationSwitcher:
		process.env.NEXT_PUBLIC_DASHBOARD_ORGANIZATION_SWITCHER === "enabled",
} as const;

export function getDashboardCapabilities(
	role: MembershipRole,
	platformRole: PlatformRole | null = null,
) {
	const capabilities = new Set<DashboardCapability>([
		"dashboard.view",
		"records.read",
		"organization.read",
	]);
	if (role === "owner" || role === "admin") {
		capabilities.add("records.write");
		capabilities.add("organization.manage");
	}
	if (platformRole === "admin") capabilities.add("platform.manage");
	if (process.env.NODE_ENV !== "production") capabilities.add("debug.use");
	return capabilities;
}

export function hasDashboardCapability(
	capabilities: ReadonlySet<DashboardCapability>,
	capability?: DashboardCapability,
) {
	return !capability || capabilities.has(capability);
}

export function getDashboardSurface(pathname: string) {
	return (
		dashboardSurfaceRegistry.find((surface) =>
			matchesRouteSurface(pathname, surface),
		) ?? null
	);
}

export function getDashboardSurfaceById(id: DashboardSurfaceId) {
	return dashboardSurfaceRegistry.find((surface) => surface.id === id) ?? null;
}

export function getVisibleDashboardSurfaces(
	capabilities: ReadonlySet<DashboardCapability>,
) {
	return dashboardSurfaceRegistry.filter(
		(surface) =>
			hasDashboardCapability(capabilities, surface.capability) &&
			(surface.id !== "dashboard.organization.switch" ||
				dashboardFeatureConfig.organizationSwitcher),
	);
}

export function getDashboardSidebarGroups(
	capabilities: ReadonlySet<DashboardCapability>,
) {
	const surfaces = getVisibleDashboardSurfaces(capabilities).filter(
		(surface) => surface.sidebar,
	);
	return (["primary", "secondary", "utility"] as const)
		.map((tier) => ({
			id: tier,
			tier,
			surfaces: surfaces.filter((surface) => surface.sidebarTier === tier),
		}))
		.filter((group) => group.surfaces.length > 0);
}

export function getDashboardSurfaceTrail(
	pathname: string,
	capabilities: ReadonlySet<DashboardCapability>,
) {
	const surface = getDashboardSurface(pathname);
	if (!surface || !hasDashboardCapability(capabilities, surface.capability)) {
		return [];
	}
	const lineage: DashboardSurface[] = [];
	let current = surface.parentId
		? getDashboardSurfaceById(surface.parentId)
		: null;
	while (current) {
		if (hasDashboardCapability(capabilities, current.capability)) {
			lineage.unshift(current);
		}
		current = current.parentId
			? getDashboardSurfaceById(current.parentId)
			: null;
	}
	return lineage.map((item) => ({
		href: item.href,
		label: item.label,
	})) satisfies DashboardSurfaceTrailItem[];
}

export function getDashboardNavigationCommands(
	capabilities: ReadonlySet<DashboardCapability>,
) {
	return getVisibleDashboardSurfaces(capabilities).flatMap((surface) => {
		const parentHref = surface.parentId
			? getDashboardSurfaceById(surface.parentId)?.href
			: null;
		return [
			{
				description: surface.description,
				href: surface.href.includes("[")
					? (parentHref ?? hrefFor("dashboard.overview"))
					: surface.href,
				icon: surface.icon,
				id: `navigate.${surface.id}`,
				keywords: [surface.label, "navigate", "open"],
				label: surface.label,
				parentId: surface.parentId ? `navigate.${surface.parentId}` : undefined,
			},
			...surface.commands
				.filter((command) =>
					hasDashboardCapability(capabilities, command.capability),
				)
				.map(({ search, surfaceId, ...command }) => ({
					...command,
					href: surfaceHref(surfaceId, {}, { search }),
					icon: surface.icon,
					parentId: `navigate.${surface.id}`,
				})),
		];
	});
}
