import type { Metadata } from "next";
import { createStaticMarketingPageMetadata } from "@/lib/metadata";

export const metadata: Metadata =
	createStaticMarketingPageMetadata("marketing.settings");

export default function MarketingSettingsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return children;
}
