import type { Metadata } from "next";
import {
	getSupportEmail,
	getSupportMailto,
} from "../_lib/platform/support.server";
import { requireDashboardCapability } from "../_registry/access.server";
import { SupportSurface } from "./_components/SupportSurface";

export const metadata: Metadata = { title: "Support | Averlo" };

export default async function DashboardSupportPage() {
	await requireDashboardCapability("dashboard.view");
	const supportEmail = getSupportEmail();
	const supportMailto = getSupportMailto();

	return (
		<SupportSurface supportEmail={supportEmail} supportMailto={supportMailto} />
	);
}
