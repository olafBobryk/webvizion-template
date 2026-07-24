import type { ComponentProps } from "react";
import { PlatformDetailLoading } from "../../../_components/PlatformRouteLoading";
import { PlatformInboxDetailContent } from "./PlatformInboxDetailContent";

export function PlatformInboxRequestSurface(
	props: ComponentProps<typeof PlatformInboxDetailContent>,
) {
	return <PlatformInboxDetailContent {...props} />;
}

export function PlatformInboxRequestSurfaceSkeleton() {
	return (
		<PlatformDetailLoading
			description="Loading support request context"
			label="Loading support request"
			title="Support request"
		/>
	);
}
