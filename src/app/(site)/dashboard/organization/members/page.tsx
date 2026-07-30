import { redirect } from "next/navigation";
import { surfaceHref } from "@/lib/routes";

export default function DashboardMembersRedirectPage() {
	redirect(surfaceHref("dashboard.administration", {}, { hash: "members" }));
}
