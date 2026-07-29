"use client";

import { AdministrationSurfaceSkeleton } from "../../administration/_components/AdministrationSurface";
import { OrganizationSurfaceSkeleton } from "../../organization/_components/OrganizationSurface";
import { OrganizationMemberSurfaceSkeleton } from "../../organization/members/[memberId]/_components/OrganizationMemberSurface";
import { OrganizationSettingsSurfaceSkeleton } from "../../organization/settings/_components/OrganizationSettingsSurface";
import { OrganizationSwitchSurfaceSkeleton } from "../../organization/switch/_components/OrganizationSwitchSurface";
import { PlatformSurfaceSkeleton } from "../../platform/_components/PlatformSurface";
import { PlatformInboxSurfaceSkeleton } from "../../platform/inbox/_components/PlatformInboxSurface";
import { PlatformInboxRequestSurfaceSkeleton } from "../../platform/inbox/[id]/_components/PlatformInboxRequestSurface";
import { PlatformReportsSurfaceSkeleton } from "../../platform/reports/_components/PlatformReportsSurface";
import { PlatformReportSurfaceSkeleton } from "../../platform/reports/[id]/_components/PlatformReportSurface";
import { ProfileSurfaceSkeleton } from "../../profile/_components/ProfileSurface";
import { RecordsSurfaceSkeleton } from "../../records/_components/RecordsSurface";
import { RecordSurfaceSkeleton } from "../../records/[recordId]/_components/RecordSurface";
import { EntityReferenceSurfaceSkeleton } from "../../reference/entities/_components/EntityReferenceSurface";
import { ReferenceSkeletonsSurfaceSkeleton } from "../../reference/skeletons/_components/ReferenceSkeletonsSurface";
import { SettingsSurfaceSkeleton } from "../../settings/_components/SettingsSurface";
import { OverviewSurfaceSkeleton } from "../OverviewSurface";

export function DashboardForcedLoadingView({ pathname }: { pathname: string }) {
	if (pathname === "/dashboard/profile") return <ProfileSurfaceSkeleton />;
	if (pathname === "/dashboard/administration")
		return <AdministrationSurfaceSkeleton />;
	if (pathname === "/dashboard/platform") return <PlatformSurfaceSkeleton />;
	if (/^\/dashboard\/platform\/inbox\/[^/]+$/.test(pathname))
		return <PlatformInboxRequestSurfaceSkeleton />;
	if (pathname === "/dashboard/platform/inbox")
		return <PlatformInboxSurfaceSkeleton />;
	if (/^\/dashboard\/platform\/reports\/[^/]+$/.test(pathname))
		return <PlatformReportSurfaceSkeleton />;
	if (pathname === "/dashboard/platform/reports")
		return <PlatformReportsSurfaceSkeleton />;
	if (pathname === "/dashboard/settings") return <SettingsSurfaceSkeleton />;
	if (pathname === "/dashboard/organization/settings")
		return <OrganizationSettingsSurfaceSkeleton />;
	if (pathname === "/dashboard/organization/switch")
		return <OrganizationSwitchSurfaceSkeleton />;
	if (pathname === "/dashboard/organization")
		return <OrganizationSurfaceSkeleton />;
	if (/^\/dashboard\/organization\/members\/[^/]+$/.test(pathname))
		return <OrganizationMemberSurfaceSkeleton />;
	if (pathname === "/dashboard/organization/members")
		return <AdministrationSurfaceSkeleton />;
	if (/^\/dashboard\/records\/[^/]+$/.test(pathname))
		return <RecordSurfaceSkeleton />;
	if (pathname === "/dashboard/records") return <RecordsSurfaceSkeleton />;
	if (pathname === "/dashboard/reference/entities")
		return <EntityReferenceSurfaceSkeleton />;
	if (pathname === "/dashboard/reference/skeletons")
		return <ReferenceSkeletonsSurfaceSkeleton />;
	return <OverviewSurfaceSkeleton />;
}
