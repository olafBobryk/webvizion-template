import { requirePlatformAdmin } from "@/app/(site)/dashboard/_lib/platform/access.server";
import { PlatformSurface } from "./_components/PlatformSurface";

export default async function PlatformPage() {
	await requirePlatformAdmin();
	return <PlatformSurface />;
}
