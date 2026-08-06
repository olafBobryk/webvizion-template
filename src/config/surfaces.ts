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
	dictionary: "/internal/dictionary",
	dictionarySpamProtectedForm: "/internal/dictionary/forms/spam-protected-form",
	intelligence: "/internal/intelligence",
	playground: "/internal/playground",
	reference: "/internal/reference",
} as const;

export type InternalRouteId = keyof typeof internalRoutes;
