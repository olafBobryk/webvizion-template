import type { ComponentProps } from "react";
import { DashboardSection } from "../../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../../_components/loading/DashboardLoadingStatus";
import {
	OrganizationSettingsSection,
	OrganizationSettingsSectionSkeleton,
} from "./OrganizationSettingsSection";

export function OrganizationSettingsSurface(
	props: ComponentProps<typeof OrganizationSettingsSection>,
) {
	return (
		<DashboardSection
			contentClassName="grid gap-5"
			title="Organization settings"
		>
			<OrganizationSettingsSection {...props} />
		</DashboardSection>
	);
}

export function OrganizationSettingsSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading organization settings">
			<DashboardSection
				contentClassName="grid gap-5"
				title="Organization settings"
			>
				<OrganizationSettingsSectionSkeleton />
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
