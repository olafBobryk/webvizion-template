import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/app/(site)/_components/layout/SiteShell";
import { defaultSiteLayout } from "@/app/(site)/_components/layout/siteLayout";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default function DevOnlyInternalLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (process.env.NODE_ENV === "production") {
		notFound();
	}

	return (
		<SiteShell siteLayout={defaultSiteLayout}>
			<div className="min-h-screen bg-background">{children}</div>
		</SiteShell>
	);
}
