import type { ComponentProps } from "react";
import { DashboardLoadingStatus } from "../../../_components/loading/DashboardLoadingStatus";
import { DashboardEntityReferenceLoadingComposition } from "../../entities/EntitySkeletonReference";
import { DashboardSkeletonReferenceClient } from "../DashboardSkeletonReferenceClient";

export function ReferenceSkeletonsSurface(
	props: ComponentProps<typeof DashboardSkeletonReferenceClient>,
) {
	return <DashboardSkeletonReferenceClient {...props} />;
}

export function ReferenceSkeletonsSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading entity presentation reference">
			<DashboardEntityReferenceLoadingComposition />
		</DashboardLoadingStatus>
	);
}
