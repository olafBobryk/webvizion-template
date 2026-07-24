import type { ComponentProps } from "react";
import { PlatformDetailLoading } from "../../../_components/PlatformRouteLoading";
import { PlatformReportDetailContent } from "./PlatformReportDetailContent";

export function PlatformReportSurface(
	props: ComponentProps<typeof PlatformReportDetailContent>,
) {
	return <PlatformReportDetailContent {...props} />;
}

export function PlatformReportSurfaceSkeleton() {
	return (
		<PlatformDetailLoading
			description="Loading captured route and browser context"
			label="Loading product report"
			title="Product report"
		/>
	);
}
