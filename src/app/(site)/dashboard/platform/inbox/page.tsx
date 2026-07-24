import { requirePlatformAdmin } from "@/app/(site)/dashboard/_lib/platform/access.server";
import { listSupportRequests } from "@/app/(site)/dashboard/_lib/platform/fixtures.server";
import { PlatformInboxSurface } from "./_components/PlatformInboxSurface";

export default async function PlatformInboxPage() {
	await requirePlatformAdmin();
	return <PlatformInboxSurface requests={listSupportRequests()} />;
}
