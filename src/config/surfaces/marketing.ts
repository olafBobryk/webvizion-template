import { defineRouteSurfaceRegistry } from "@/lib/surfaces/routeSurface";

export const marketingCoreSurfaceRegistry = defineRouteSurfaceRegistry([
	{
		family: "marketing",
		href: "/",
		id: "marketing.home",
		match: "exact",
	},
	{
		family: "marketing",
		href: "/contact",
		id: "marketing.contact",
		match: "exact",
	},
] as const);

export const marketingSettingsSurfaceRegistry = defineRouteSurfaceRegistry([
	{
		family: "marketing",
		href: "/settings",
		id: "marketing.settings",
		match: "exact",
	},
] as const);

export const marketingTemplateSurfaceRegistry = defineRouteSurfaceRegistry([
	{
		family: "marketing",
		href: "/repository-footprint",
		id: "marketing.repositoryFootprint",
		match: "exact",
	},
] as const);

export const marketingSurfaceRegistry = defineRouteSurfaceRegistry([
	...marketingCoreSurfaceRegistry,
	...marketingSettingsSurfaceRegistry,
	...marketingTemplateSurfaceRegistry,
] as const);

export type MarketingSurface = (typeof marketingSurfaceRegistry)[number];
export type MarketingSurfaceId = MarketingSurface["id"];
