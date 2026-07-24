import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/app/(site)/dashboard/_lib/platform/access.server";
import { getProductReport } from "@/app/(site)/dashboard/_lib/platform/fixtures.server";
import { PlatformReportSurface } from "./_components/PlatformReportSurface";

export default async function PlatformReportDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requirePlatformAdmin();
	const { id } = await params;
	const report = getProductReport(id);
	if (!report) notFound();
	return <PlatformReportSurface initialReport={report} />;
}
