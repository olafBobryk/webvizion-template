import { type NextRequest, NextResponse } from "next/server";

const PRODUCTION_GUARDED_PATH_PREFIXES = [
	"/api/debug",
	"/api/dev",
	"/api/internal",
	"/internal/testing",
];

function isProductionGuardedPath(pathname: string) {
	return PRODUCTION_GUARDED_PATH_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

export function proxy(request: NextRequest) {
	if (
		process.env.NODE_ENV === "production" &&
		isProductionGuardedPath(request.nextUrl.pathname)
	) {
		return new NextResponse(null, { status: 404 });
	}

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set(
		"x-template-request-path",
		`${request.nextUrl.pathname}${request.nextUrl.search}`,
	);
	return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/api/debug/:path*",
		"/api/dev/:path*",
		"/api/internal/:path*",
		"/internal/testing/:path*",
	],
};
