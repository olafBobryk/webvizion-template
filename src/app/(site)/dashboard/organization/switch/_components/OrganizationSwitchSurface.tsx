import type { ComponentProps } from "react";
import { OrganizationSelectionCard } from "@/app/(site)/_components/organization/OrganizationSelectionCard";
import { OrganizationSwitchSurfaceSkeletonClient } from "./OrganizationSwitchSurfaceSkeleton.client";

export function OrganizationSwitchSurface(
	props: ComponentProps<typeof OrganizationSelectionCard>,
) {
	return (
		<section className="flex min-h-[calc(100svh-10rem)] items-center justify-center py-6 sm:py-10">
			<OrganizationSelectionCard {...props} />
		</section>
	);
}

export function OrganizationSwitchSurfaceSkeleton() {
	return <OrganizationSwitchSurfaceSkeletonClient />;
}
