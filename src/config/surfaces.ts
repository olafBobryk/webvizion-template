import { authSurfaceRegistry } from "@/config/surfaces/auth";
import { dashboardRouteSurfaceRegistry } from "@/config/surfaces/dashboard";
import { marketingSurfaceRegistry } from "@/config/surfaces/marketing";
import { defineRouteSurfaceRegistry } from "@/lib/surfaces/routeSurface";

export const appSurfaceRegistry = defineRouteSurfaceRegistry([
	...marketingSurfaceRegistry,
	...authSurfaceRegistry,
	...dashboardRouteSurfaceRegistry,
] as const);

export type AppSurface = (typeof appSurfaceRegistry)[number];
export type AppSurfaceId = AppSurface["id"];

export const internalRoutes = {
	demo: "/internal/demo",
	testing: "/internal/testing",
} as const;

export type InternalRouteId = keyof typeof internalRoutes;
