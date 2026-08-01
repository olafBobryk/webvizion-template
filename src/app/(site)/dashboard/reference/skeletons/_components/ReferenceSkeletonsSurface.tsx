import type { ComponentProps } from "react";
import { DashboardLoadingStatus } from "../../../_components/loading/DashboardLoadingStatus";
import {
	DashboardSkeletonReferenceClient,
	DashboardSkeletonReferenceLoadingComposition,
} from "../DashboardSkeletonReferenceClient";

export function ReferenceSkeletonsSurface(
	props: ComponentProps<typeof DashboardSkeletonReferenceClient>,
) {
	return <DashboardSkeletonReferenceClient {...props} />;
}

export function ReferenceSkeletonsSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading skeleton reference">
			<DashboardSkeletonReferenceLoadingComposition />
		</DashboardLoadingStatus>
	);
}
