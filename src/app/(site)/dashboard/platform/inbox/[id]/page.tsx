import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/app/(site)/dashboard/_lib/platform/access.server";
import { getSupportRequest } from "@/app/(site)/dashboard/_lib/platform/fixtures.server";
import { PlatformInboxRequestSurface } from "./_components/PlatformInboxRequestSurface";

export default async function PlatformInboxDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requirePlatformAdmin();
	const { id } = await params;
	const supportRequest = getSupportRequest(id);
	if (!supportRequest) notFound();
	return <PlatformInboxRequestSurface initialRequest={supportRequest} />;
}
