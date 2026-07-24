"use client";

import * as React from "react";
import {
	DashboardFooterNote,
	DashboardFooterNoteLink,
} from "../../_components/layout/DashboardFooterNote";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { useDashboardAuth } from "../../_components/providers/DashboardAuthProvider";
import { useDashboardSettingsContext } from "../../_components/providers/DashboardSettingsProvider";
import { getDashboardCapabilities } from "../../_registry/surfaceRegistry";
import {
	AccountDetailsSettingsSection,
	DashboardSettingsHeaderActions,
	SecuritySettingsSection,
} from "./AccountSettingsSections";
import { ProfileSettingsSection } from "./ProfileSettingsSection";

function SettingsFooter({ canManage }: { canManage: boolean }) {
	return canManage ? (
		<DashboardFooterNote>
			Looking for administration?{" "}
			<DashboardFooterNoteLink href="/dashboard/administration">
				Open organization administration
			</DashboardFooterNoteLink>
			.
		</DashboardFooterNote>
	) : null;
}

export function SettingsSurfaceClient() {
	const { sharedSections, dashboardSections } = useDashboardSettingsContext();
	const { membership, user } = useDashboardAuth();
	const canManage = Boolean(
		user &&
			getDashboardCapabilities(membership.role, user.platformRole).has(
				"organization.manage",
			),
	);
	const sections = [...dashboardSections, ...sharedSections];

	return (
		<DashboardSection
			actions={<DashboardSettingsHeaderActions />}
			contentClassName="flex flex-col gap-5"
			title="Account settings"
		>
			{sections.map((section) => (
				<React.Fragment key={section.id}>{section.content}</React.Fragment>
			))}
			<SettingsFooter canManage={canManage} />
		</DashboardSection>
	);
}

export function SettingsSurfaceSkeletonClient() {
	const { settingsSnapshot, sharedSections } = useDashboardSettingsContext();
	const { membership, user } = useDashboardAuth();
	const canManage = Boolean(
		user &&
			getDashboardCapabilities(membership.role, user.platformRole).has(
				"organization.manage",
			),
	);

	return (
		<div aria-busy="true" aria-label="Loading account settings" role="status">
			<DashboardSection
				actions={<DashboardSettingsHeaderActions.Skeleton />}
				contentClassName="flex flex-col gap-5"
				title="Account settings"
			>
				<ProfileSettingsSection.Skeleton />
				<AccountDetailsSettingsSection.Skeleton
					joinedAtLabel={settingsSnapshot.joinedAtLabel}
				/>
				<SecuritySettingsSection.Skeleton
					authMethods={settingsSnapshot.authMethods}
					identities={settingsSnapshot.identities}
				/>
				{sharedSections.map((section) => (
					<React.Fragment key={section.id}>{section.content}</React.Fragment>
				))}
				<SettingsFooter canManage={canManage} />
			</DashboardSection>
		</div>
	);
}
