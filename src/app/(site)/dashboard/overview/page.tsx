import { redirect } from "next/navigation";
import { hrefFor } from "@/lib/routes";

export default function DashboardOverviewRedirectPage() {
	redirect(hrefFor("dashboard.overview"));
}
