import type { ComponentProps } from "react";
import { DashboardSection } from "../../../_components/layout/DashboardSection";
import { PlatformCollectionLoading } from "../../_components/PlatformRouteLoading";
import { PlatformReportsContent } from "./PlatformReportsContent";

export function PlatformReportsSurface(
	props: ComponentProps<typeof PlatformReportsContent>,
) {
	return (
		<DashboardSection
			contentClassName="grid min-w-0 gap-5"
			description="Triage structured product feedback with its captured dashboard context."
			title="Reports"
		>
			<PlatformReportsContent {...props} />
		</DashboardSection>
	);
}

export function PlatformReportsSurfaceSkeleton() {
	return (
		<PlatformCollectionLoading
			columns={[
				{ id: "reporter", label: "Reporter" },
				{ id: "organization", label: "Organization" },
				{ id: "route", label: "Route" },
				{ id: "severity", label: "Severity" },
				{ id: "status", label: "Status" },
				{ id: "created", label: "Created" },
				{ id: "actions", kind: "action", label: "Actions" },
			]}
			description="Triage structured product feedback with its captured dashboard context."
			label="Loading Platform Reports"
			title="Reports"
		/>
	);
}
