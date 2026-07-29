import { SiteShell } from "@/app/(site)/_components/layout/SiteShell";
import { getSiteLayout } from "@/lib/marketing-content/resolvers";

export default async function MarketingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const siteLayout = await getSiteLayout();

	return <SiteShell siteLayout={siteLayout}>{children}</SiteShell>;
}
