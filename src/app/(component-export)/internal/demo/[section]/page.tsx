import { notFound } from "next/navigation";
import { ComponentExportSurface } from "@/lib/component-catalog/ComponentExportSurface";
import {
	componentExportContentSections,
	isComponentExportSectionId,
} from "@/lib/component-catalog/exportSections";

export function generateStaticParams() {
	return componentExportContentSections.map((section) => ({
		section: section.id,
	}));
}

export default async function ComponentExportSectionPage({
	params,
}: {
	params: Promise<{ section: string }>;
}) {
	const { section } = await params;
	if (!isComponentExportSectionId(section) || section === "overview")
		notFound();
	return <ComponentExportSurface sectionId={section} />;
}
