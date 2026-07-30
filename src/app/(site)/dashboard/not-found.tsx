import { Button } from "@/components/ui/primitives/Button";
import { hrefFor } from "@/lib/routes";
import { DashboardStatusFrame } from "./_components/layout/DashboardStatusFrame";

export default function DashboardNotFoundPage() {
	return (
		<DashboardStatusFrame
			action={
				<Button href={hrefFor("dashboard.overview")}>Go to overview</Button>
			}
			description="This dashboard surface does not exist or is unavailable for the current capability set."
			title="Dashboard page not found"
		/>
	);
}
