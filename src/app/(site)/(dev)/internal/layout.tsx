import type { Metadata } from "next";
import { SiteShell } from "@/app/(site)/_components/layout/SiteShell";
import { defaultSiteLayout } from "@/app/(site)/_components/layout/siteLayout";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

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
