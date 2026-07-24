import type { ComponentProps } from "react";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { AdministrationClient } from "../AdministrationClient";
import { AdministrationSurfaceSkeletonView } from "./AdministrationSurfaceSkeletonView";

export function AdministrationSurface(
	props: ComponentProps<typeof AdministrationClient>,
) {
	return (
		<DashboardSection contentClassName="grid gap-5" title="Administration">
			<AdministrationClient {...props} />
		</DashboardSection>
	);
}

export function AdministrationSurfaceSkeleton() {
	return <AdministrationSurfaceSkeletonView />;
}
