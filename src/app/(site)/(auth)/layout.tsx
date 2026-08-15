import type { Metadata } from "next";
import { headers } from "next/headers";
import { siteMetadata } from "@/config/metadataConfig";
import { getAuthSurface } from "@/config/surfaces/auth";
import { createPrivateRouteMetadata } from "@/lib/metadata";
import { AuthShell } from "./_components/AuthShell";

export async function generateMetadata(): Promise<Metadata> {
	const requestPath =
		(await headers()).get("x-template-request-path")?.split(/[?#]/, 1)[0] ??
		"/login";
	const surface = getAuthSurface(requestPath);

	return createPrivateRouteMetadata({
		description: surface?.description ?? siteMetadata.defaultDescription,
		path: surface?.href ?? "/login",
		title: surface?.label ?? "Sign in",
	});
}

export default function SiteAuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AuthShell>{children}</AuthShell>;
}
