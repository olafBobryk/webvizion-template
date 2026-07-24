"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { MemberRoleChip } from "../../_components/entities/member/MemberRoleChip";
import { useDashboardAuth } from "../../_components/providers/DashboardAuthProvider";
import { memberRolePresentation } from "../../_lib/entities/member/presentation";
import {
	dashboardCapabilityLabels,
	getDashboardCapabilities,
} from "../../_registry/surfaceRegistry";
import type { DashboardSettingsSnapshot } from "./settingsSnapshot";

function DashboardSettingsHeaderActionsRoot() {
	const { membership, user } = useDashboardAuth();
	const canManage = Boolean(
		user &&
			getDashboardCapabilities(membership.role, user.platformRole).has(
				"organization.manage",
			),
	);
	return (
		<div className="flex flex-wrap gap-2">
			<Button
				href="/dashboard/profile"
				size="sm"
				trailingIcon="external-link"
				variant="primary"
			>
				Open profile
			</Button>
			{canManage ? (
				<Button
					href="/dashboard/organization/settings"
					size="sm"
					variant="ghost"
				>
					Organization settings
				</Button>
			) : null}
		</div>
	);
}

function DashboardSettingsHeaderActionsSkeleton() {
	const { membership, user } = useDashboardAuth();
	const canManage = Boolean(
		user &&
			getDashboardCapabilities(membership.role, user.platformRole).has(
				"organization.manage",
			),
	);
	return (
		<div className="flex flex-wrap gap-2">
			<Button.Skeleton size="sm" trailingIcon variant="primary">
				Open profile
			</Button.Skeleton>
			{canManage ? (
				<Button.Skeleton size="sm" variant="ghost">
					Organization settings
				</Button.Skeleton>
			) : null}
		</div>
	);
}

export const DashboardSettingsHeaderActions = Object.assign(
	DashboardSettingsHeaderActionsRoot,
	{ Skeleton: DashboardSettingsHeaderActionsSkeleton },
);

function AccountDetailsSettingsSectionRoot({
	joinedAtLabel,
}: Pick<DashboardSettingsSnapshot, "joinedAtLabel">) {
	const { membership, user } = useDashboardAuth();
	if (!user) return null;

	const capabilities = [
		...getDashboardCapabilities(membership.role, user.platformRole),
	];
	const rolePresentation = memberRolePresentation[membership.role];

	return (
		<Card className="scroll-mt-24" id="account-details">
			<Card.Header className="border-b">
				<Card.Title className="inline-flex items-center gap-2">
					<Icon className="text-muted-foreground" name="user" size="sm" />
					Account details
				</Card.Title>
				<Card.Description>
					Read-only account identity and organization membership details.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<dl className="grid gap-4 sm:grid-cols-2">
					<DashboardDetailField
						copyLabel="Copy email address"
						copyValue={user.email}
						icon={<Icon name="mail" size="sm" />}
						label="Email"
						value={user.email || "Email unavailable"}
					/>
					<DashboardDetailField
						icon={<Icon name="calendar" size="sm" />}
						label="Joined"
						value={joinedAtLabel}
					/>
					<DashboardDetailField
						icon={<Icon name="check" size="sm" />}
						label="Permissions"
						truncateValue={false}
						value={
							<span className="flex flex-wrap gap-2">
								{capabilities.map((capability) => (
									<Chip key={capability}>
										{dashboardCapabilityLabels[capability]}
									</Chip>
								))}
							</span>
						}
					/>
					<DashboardDetailField
						icon={<Icon name="shield" size="sm" />}
						label="Organization role"
						truncateValue={false}
						value={
							<MemberRoleChip
								label={rolePresentation.shortLabel}
								tone={rolePresentation.tone}
							/>
						}
					/>
				</dl>
			</Card.Content>
		</Card>
	);
}

function AccountDetailsSettingsSectionSkeleton({
	joinedAtLabel,
}: Pick<DashboardSettingsSnapshot, "joinedAtLabel">) {
	const { membership, user } = useDashboardAuth();
	if (!user) return null;
	const capabilities = [
		...getDashboardCapabilities(membership.role, user.platformRole),
	];
	const rolePresentation = memberRolePresentation[membership.role];

	return (
		<Card className="scroll-mt-24" id="account-details">
			<Card.Header className="border-b">
				<Card.Title className="inline-flex items-center gap-2">
					<Icon className="text-muted-foreground" name="user" size="sm" />
					Account details
				</Card.Title>
				<Card.Description>
					Read-only account identity and organization membership details.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<dl className="grid gap-4 sm:grid-cols-2">
					<DashboardDetailField.Skeleton
						copyable
						icon={<Icon name="mail" size="sm" />}
						label="Email"
						value={user.email || "Email unavailable"}
					/>
					<DashboardDetailField.Skeleton
						icon={<Icon name="calendar" size="sm" />}
						label="Joined"
						value={joinedAtLabel}
					/>
					<DashboardDetailField.Skeleton
						icon={<Icon name="check" size="sm" />}
						label="Permissions"
						truncateValue={false}
					>
						<span className="flex flex-wrap gap-2">
							{capabilities.map((capability) => (
								<Chip.Skeleton key={capability}>
									{dashboardCapabilityLabels[capability]}
								</Chip.Skeleton>
							))}
						</span>
					</DashboardDetailField.Skeleton>
					<DashboardDetailField.Skeleton
						icon={<Icon name="shield" size="sm" />}
						label="Organization role"
						truncateValue={false}
					>
						<MemberRoleChip.Skeleton label={rolePresentation.shortLabel} />
					</DashboardDetailField.Skeleton>
				</dl>
			</Card.Content>
		</Card>
	);
}

export const AccountDetailsSettingsSection = Object.assign(
	AccountDetailsSettingsSectionRoot,
	{ Skeleton: AccountDetailsSettingsSectionSkeleton },
);
