import { SiteShell } from "@/app/(site)/_components/layout/SiteShell";
import { getSiteLayout } from "@/lib/marketing-content/resolvers";
import { MarketingSettingsProvider } from "./_components/providers/MarketingSettingsProvider";

export default async function MarketingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const siteLayout = await getSiteLayout();

	return (
		<MarketingSettingsProvider>
			<SiteShell siteLayout={siteLayout}>{children}</SiteShell>
		</MarketingSettingsProvider>
	);
}
