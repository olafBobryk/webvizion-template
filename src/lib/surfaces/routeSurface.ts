export type RouteSurfaceFamily = "auth" | "dashboard" | "marketing";

export type RouteSurfaceHref = "/" | `/${string}`;

export type RouteSurfaceBase<
	TId extends string = string,
	TFamily extends RouteSurfaceFamily = RouteSurfaceFamily,
	THref extends RouteSurfaceHref = RouteSurfaceHref,
> = {
	family: TFamily;
	href: THref;
	id: TId;
	match: "exact" | "pattern";
};

type RouteParameterName<TName extends string> = TName extends `...${infer Name}`
	? Name
	: TName;

type RouteParameterKeys<TPath extends string> =
	TPath extends `${string}[${infer Parameter}]${infer Rest}`
		? RouteParameterName<Parameter> | RouteParameterKeys<Rest>
		: never;

export type RouteSurfaceParameters<TPath extends string> = {
	[Key in RouteParameterKeys<TPath>]: string | number;
};

export type RouteSurfaceHrefOptions = {
	hash?: string;
	search?: Readonly<
		Record<string, boolean | number | string | null | undefined>
	>;
};

function assertSurfaceIdentity(surface: RouteSurfaceBase) {
	if (!surface.id.startsWith(`${surface.family}.`)) {
		throw new Error(
			`Route surface ${surface.id} must use the ${surface.family}. id namespace.`,
		);
	}
	if (surface.match === "exact" && surface.href.includes("[")) {
		throw new Error(
			`Exact route surface ${surface.id} cannot contain route parameters.`,
		);
	}
	if (surface.match === "pattern" && !surface.href.includes("[")) {
		throw new Error(
			`Pattern route surface ${surface.id} must contain a route parameter.`,
		);
	}
}

export function assertRouteSurfaceRegistry(
	registry: readonly RouteSurfaceBase[],
) {
	const ids = new Set<string>();
	const hrefs = new Set<string>();

	for (const surface of registry) {
		assertSurfaceIdentity(surface);
		if (ids.has(surface.id)) {
			throw new Error(`Duplicate route surface id: ${surface.id}`);
		}
		if (hrefs.has(surface.href)) {
			throw new Error(`Duplicate route surface href: ${surface.href}`);
		}
		ids.add(surface.id);
		hrefs.add(surface.href);
	}
}

export function defineRouteSurfaceRegistry<
	const TRegistry extends readonly RouteSurfaceBase[],
>(registry: TRegistry) {
	assertRouteSurfaceRegistry(registry);
	return registry;
}

function escapePatternSegment(segment: string) {
	return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const pathnamePatterns = new Map<string, RegExp>();

function getPathnamePattern(href: string) {
	const cached = pathnamePatterns.get(href);
	if (cached) return cached;

	const source = href
		.split("/")
		.map((segment) => {
			if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return ".+";
			if (/^\[[^\]]+\]$/.test(segment)) return "[^/]+";
			return escapePatternSegment(segment);
		})
		.join("/");
	const pattern = new RegExp(`^${source}$`);
	pathnamePatterns.set(href, pattern);
	return pattern;
}

export function matchesRouteSurface(
	pathname: string,
	surface: RouteSurfaceBase,
) {
	const normalizedPathname = pathname.split(/[?#]/, 1)[0] || "/";
	return surface.match === "exact"
		? normalizedPathname === surface.href
		: getPathnamePattern(surface.href).test(normalizedPathname);
}

export function getRouteSurfaceById<
	TRegistry extends readonly RouteSurfaceBase[],
	TId extends TRegistry[number]["id"],
>(registry: TRegistry, id: TId) {
	return registry.find((surface) => surface.id === id) as Extract<
		TRegistry[number],
		{ id: TId }
	>;
}

function appendHrefOptions(
	href: string,
	options: RouteSurfaceHrefOptions | undefined,
) {
	if (!options) return href;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(options.search ?? {})) {
		if (value !== null && value !== undefined) search.set(key, String(value));
	}
	const query = search.size > 0 ? `?${search.toString()}` : "";
	const hash = options.hash ? `#${options.hash.replace(/^#/, "")}` : "";
	return `${href}${query}${hash}`;
}

export function resolveRouteSurfaceHref<
	TSurface extends RouteSurfaceBase<
		string,
		RouteSurfaceFamily,
		RouteSurfaceHref
	>,
>(
	surface: TSurface,
	parameters: RouteSurfaceParameters<TSurface["href"]>,
	options?: RouteSurfaceHrefOptions,
) {
	const href = surface.href.replace(
		/\[(?:\.\.\.)?([^\]]+)\]/g,
		(_placeholder, parameter: string) => {
			const value = parameters[parameter as keyof typeof parameters];
			if (value === undefined) {
				throw new Error(
					`Missing route parameter ${parameter} for ${surface.id}.`,
				);
			}
			return encodeURIComponent(String(value));
		},
	);
	return appendHrefOptions(href, options);
}
