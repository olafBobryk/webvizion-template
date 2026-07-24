import { requirePlatformAdmin } from "@/app/(site)/dashboard/_lib/platform/access.server";
import { listProductReports } from "@/app/(site)/dashboard/_lib/platform/fixtures.server";
import { PlatformReportsSurface } from "./_components/PlatformReportsSurface";

export default async function PlatformReportsPage() {
	await requirePlatformAdmin();
	return <PlatformReportsSurface reports={listProductReports()} />;
}
