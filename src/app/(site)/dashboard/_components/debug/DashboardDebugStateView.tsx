import { Button } from "@/components/ui/primitives/Button";
import { hrefFor } from "@/lib/routes";
import type { DashboardDebugState } from "../../_registry/debug";
import { DashboardStatusFrame } from "../layout/DashboardStatusFrame";
import { DashboardForcedLoadingView } from "./DashboardForcedLoadingView";

export function DashboardDebugStateView({
	pathname,
	state,
}: {
	pathname: string;
	state: DashboardDebugState;
}) {
	if (state === "loading")
		return <DashboardForcedLoadingView pathname={pathname} />;
	if (state === "empty") {
		return (
			<DashboardStatusFrame
				description="This organization has no items for the current surface yet."
				title="Nothing here yet"
			/>
		);
	}
	if (state === "error") {
		return (
			<DashboardStatusFrame
				action={<Button variant="secondary">Try again</Button>}
				description="The deterministic debug mode is showing the route error treatment."
				title="Something went wrong"
			/>
		);
	}
	if (state === "unavailable") {
		return (
			<DashboardStatusFrame
				description="This capability is unavailable for the current organization context."
				title="Surface unavailable"
			/>
		);
	}
	return (
		<DashboardStatusFrame
			action={
				<Button href={hrefFor("dashboard.overview")}>Return to overview</Button>
			}
			description="The deterministic debug mode is showing the dashboard not-found treatment."
			title="Page not found"
		/>
	);
}
