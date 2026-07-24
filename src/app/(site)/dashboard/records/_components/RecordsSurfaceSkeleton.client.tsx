"use client";

import { RecordCollectionClient } from "../../_components/entities/record/RecordCollectionClient";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../_components/loading/DashboardLoadingStatus";
import { useDashboardAuth } from "../../_components/providers/DashboardAuthProvider";
import { getDashboardCapabilities } from "../../_registry/surfaceRegistry";

export function RecordsSurfaceSkeletonClient() {
	const { membership, organization } = useDashboardAuth();
	const capabilities = getDashboardCapabilities(membership.role);
	return (
		<DashboardLoadingStatus label="Loading records">
			<DashboardSection
				description={`Organization-scoped reference entities for ${organization.name}.`}
				title="Records"
			>
				<RecordCollectionClient.Skeleton
					canWrite={capabilities.has("records.write")}
					organizationName={organization.name}
				/>
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
