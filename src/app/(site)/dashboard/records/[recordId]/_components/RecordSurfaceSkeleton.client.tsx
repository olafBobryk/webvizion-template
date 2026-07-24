"use client";

import { Text } from "@/components/ui/primitives/Text";
import { RecordDetailActions } from "../../../_components/entities/record/RecordDetailActions";
import { RecordDetailContent } from "../../../_components/entities/record/RecordDetailContent";
import { DashboardSection } from "../../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../../_components/loading/DashboardLoadingStatus";
import { useDashboardAuth } from "../../../_components/providers/DashboardAuthProvider";
import { getDashboardCapabilities } from "../../../_registry/surfaceRegistry";

export function RecordSurfaceSkeletonClient() {
	const { membership, organization } = useDashboardAuth();
	const canWrite = getDashboardCapabilities(membership.role).has(
		"records.write",
	);
	return (
		<DashboardLoadingStatus label="Loading record details">
			<DashboardSection
				actions={<RecordDetailActions.Skeleton canWrite={canWrite} />}
				description={`Reference detail in ${organization.name}.`}
				title={
					<Text.Skeleton as="span" variant="headingPage">
						North star
					</Text.Skeleton>
				}
			>
				<RecordDetailContent.Skeleton canWrite={canWrite} />
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
