import { type NextRequest, NextResponse } from "next/server";

const DEV_ONLY_PATH_PREFIXES = [
	"/internal",
	"/api/debug",
	"/api/dev",
	"/api/internal",
];

function isDevOnlyPath(pathname: string) {
	return DEV_ONLY_PATH_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

export function proxy(request: NextRequest) {
	if (
		process.env.NODE_ENV === "production" &&
		isDevOnlyPath(request.nextUrl.pathname)
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
		"/internal/:path*",
		"/api/debug/:path*",
		"/api/dev/:path*",
		"/api/internal/:path*",
	],
};
