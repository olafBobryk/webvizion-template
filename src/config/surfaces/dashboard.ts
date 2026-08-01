import { templateCapabilities } from "@/config/capabilities";
import { defineRouteSurfaceRegistry } from "@/lib/surfaces/routeSurface";

const dashboardRouteSurfaceDefinitions = [
	{
		family: "dashboard",
		href: "/dashboard",
		id: "dashboard.overview",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/records",
		id: "dashboard.records",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/records/[recordId]",
		id: "dashboard.record",
		match: "pattern",
	},
	{
		family: "dashboard",
		href: "/dashboard/assistant",
		id: "dashboard.assistant",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/assistant/conversations",
		id: "dashboard.assistant.conversations",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/assistant/[threadId]",
		id: "dashboard.assistant.thread",
		match: "pattern",
	},
	{
		family: "dashboard",
		href: "/dashboard/settings",
		id: "dashboard.settings",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/profile",
		id: "dashboard.profile",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/administration",
		id: "dashboard.administration",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/support",
		id: "dashboard.support",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/platform",
		id: "dashboard.platform",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/platform/inbox",
		id: "dashboard.platform.inbox",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/platform/inbox/[id]",
		id: "dashboard.platform.inbox.request",
		match: "pattern",
	},
	{
		family: "dashboard",
		href: "/dashboard/platform/reports",
		id: "dashboard.platform.reports",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/platform/reports/[id]",
		id: "dashboard.platform.report",
		match: "pattern",
	},
	{
		family: "dashboard",
		href: "/dashboard/organization",
		id: "dashboard.organization",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/organization/switch",
		id: "dashboard.organization.switch",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/organization/members/[memberId]",
		id: "dashboard.organization.member",
		match: "pattern",
	},
	{
		family: "dashboard",
		href: "/dashboard/organization/settings",
		id: "dashboard.organization.settings",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/reference",
		id: "dashboard.reference",
		match: "exact",
	},
	{
		family: "dashboard",
		href: "/dashboard/reference/skeletons",
		id: "dashboard.reference.skeletons",
		match: "exact",
	},
] as const;

export const dashboardRouteSurfaceRegistry = defineRouteSurfaceRegistry(
	dashboardRouteSurfaceDefinitions.filter(
		(surface) =>
			templateCapabilities.assistant ||
			!surface.id.startsWith("dashboard.assistant"),
	),
);

export type DashboardRouteSurface =
	(typeof dashboardRouteSurfaceRegistry)[number];
export type DashboardSurfaceId = DashboardRouteSurface["id"];
