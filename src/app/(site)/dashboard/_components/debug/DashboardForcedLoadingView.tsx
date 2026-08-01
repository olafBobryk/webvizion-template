"use client";

import { getDashboardSurface } from "../../_registry/surfaceRegistry";
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
import { ReferenceSurfaceSkeleton } from "../../reference/_components/ReferenceSurface";
import { ReferenceSkeletonsSurfaceSkeleton } from "../../reference/skeletons/_components/ReferenceSkeletonsSurface";
import { SettingsSurfaceSkeleton } from "../../settings/_components/SettingsSurface";
import { OverviewSurfaceSkeleton } from "../OverviewSurface";

export function DashboardForcedLoadingView({ pathname }: { pathname: string }) {
	switch (getDashboardSurface(pathname)?.id) {
		case "dashboard.profile":
			return <ProfileSurfaceSkeleton />;
		case "dashboard.administration":
			return <AdministrationSurfaceSkeleton />;
		case "dashboard.platform":
			return <PlatformSurfaceSkeleton />;
		case "dashboard.platform.inbox.request":
			return <PlatformInboxRequestSurfaceSkeleton />;
		case "dashboard.platform.inbox":
			return <PlatformInboxSurfaceSkeleton />;
		case "dashboard.platform.report":
			return <PlatformReportSurfaceSkeleton />;
		case "dashboard.platform.reports":
			return <PlatformReportsSurfaceSkeleton />;
		case "dashboard.settings":
			return <SettingsSurfaceSkeleton />;
		case "dashboard.organization.settings":
			return <OrganizationSettingsSurfaceSkeleton />;
		case "dashboard.organization.switch":
			return <OrganizationSwitchSurfaceSkeleton />;
		case "dashboard.organization":
			return <OrganizationSurfaceSkeleton />;
		case "dashboard.organization.member":
			return <OrganizationMemberSurfaceSkeleton />;
		case "dashboard.record":
			return <RecordSurfaceSkeleton />;
		case "dashboard.records":
			return <RecordsSurfaceSkeleton />;
		case "dashboard.reference":
			return <ReferenceSurfaceSkeleton />;
		case "dashboard.reference.skeletons":
			return <ReferenceSkeletonsSurfaceSkeleton />;
		default:
			return <OverviewSurfaceSkeleton />;
	}
}
