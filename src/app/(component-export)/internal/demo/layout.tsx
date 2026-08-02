import type { Metadata } from "next";
import { ComponentExportProviders } from "@/lib/component-catalog/ComponentExportProviders";

export const metadata: Metadata = {
	title: "Component Export",
	robots: { index: false, follow: false },
};

export default function ComponentExportLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ComponentExportProviders>{children}</ComponentExportProviders>;
}
