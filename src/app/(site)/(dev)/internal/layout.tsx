import type { Metadata } from "next";
import { SiteShell } from "@/app/(site)/_components/layout/SiteShell";
import { defaultSiteLayout } from "@/app/(site)/_components/layout/siteLayout";
import { siteMetadata } from "@/config/metadataConfig";
import { createPrivateRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPrivateRouteMetadata({
	description: siteMetadata.defaultDescription,
	path: "/internal",
	title: "Internal",
});

export default function InternalLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SiteShell siteLayout={defaultSiteLayout}>
			<div className="min-h-screen bg-background">{children}</div>
		</SiteShell>
	);
}
