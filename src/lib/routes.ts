import {
	type AppSurface,
	type AppSurfaceId,
	appSurfaceRegistry,
	type InternalRouteId,
	internalRoutes,
} from "@/config/surfaces";
import {
	getRouteSurfaceById,
	type RouteSurfaceHrefOptions,
	type RouteSurfaceParameters,
	resolveRouteSurfaceHref,
} from "@/lib/surfaces/routeSurface";

export type { AppSurfaceId } from "@/config/surfaces";

type AppSurfaceById<TId extends AppSurfaceId> = Extract<
	AppSurface,
	{ id: TId }
>;

export type StaticAppSurfaceId<TSurface extends AppSurface = AppSurface> =
	TSurface extends { href: `${string}[${string}` } ? never : TSurface["id"];

const appSurfaceIds = new Set<string>(
	appSurfaceRegistry.map((surface) => surface.id),
);
const staticAppSurfaceIds = new Set<string>(
	appSurfaceRegistry
		.filter((surface) => surface.match === "exact")
		.map((surface) => surface.id),
);

export function isAppSurfaceId(value: string): value is AppSurfaceId {
	return appSurfaceIds.has(value);
}

export function isStaticAppSurfaceId(
	value: string,
): value is StaticAppSurfaceId {
	return staticAppSurfaceIds.has(value);
}

export function hrefFor(surfaceId: StaticAppSurfaceId) {
	return getRouteSurfaceById(appSurfaceRegistry, surfaceId).href;
}

export function getOptionalSurfaceHref(surfaceId: string) {
	const surface = appSurfaceRegistry.find(
		(candidate) => candidate.id === surfaceId && candidate.match === "exact",
	);
	return surface?.href ?? null;
}

export const defaultSurfaceHref =
	getOptionalSurfaceHref("marketing.home") ??
	getOptionalSurfaceHref("auth.login") ??
	getOptionalSurfaceHref("dashboard.overview") ??
	"/";

export function surfaceHref<TId extends AppSurfaceId>(
	surfaceId: TId,
	parameters: RouteSurfaceParameters<AppSurfaceById<TId>["href"]>,
	options?: RouteSurfaceHrefOptions,
) {
	return resolveRouteSurfaceHref(
		getRouteSurfaceById(appSurfaceRegistry, surfaceId),
		parameters,
		options,
	);
}

export type { InternalRouteId } from "@/config/surfaces";

export function isInternalRouteId(value: string): value is InternalRouteId {
	return value in internalRoutes;
}

export function internalHrefFor(internalRouteId: InternalRouteId) {
	return internalRoutes[internalRouteId];
}
