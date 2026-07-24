import type { ComponentProps } from "react";
import { DashboardSection } from "../../../_components/layout/DashboardSection";
import { PlatformCollectionLoading } from "../../_components/PlatformRouteLoading";
import { PlatformInboxContent } from "./PlatformInboxContent";

export function PlatformInboxSurface(
	props: ComponentProps<typeof PlatformInboxContent>,
) {
	return (
		<DashboardSection
			contentClassName="grid min-w-0 gap-5"
			description="Review fixture-only support requests submitted from authenticated dashboards."
			title="Inbox"
		>
			<PlatformInboxContent {...props} />
		</DashboardSection>
	);
}

export function PlatformInboxSurfaceSkeleton() {
	return (
		<PlatformCollectionLoading
			columns={[
				{ id: "requester", label: "Requester" },
				{ id: "subject", label: "Subject" },
				{ id: "organization", label: "Organization" },
				{ id: "status", label: "Status" },
				{ id: "created", label: "Created" },
				{ id: "actions", kind: "action", label: "Actions" },
			]}
			description="Review fixture-only support requests submitted from authenticated dashboards."
			label="Loading Platform Inbox"
			title="Inbox"
		/>
	);
}
