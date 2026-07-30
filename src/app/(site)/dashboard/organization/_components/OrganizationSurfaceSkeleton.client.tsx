"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { hrefFor } from "@/lib/routes";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { OrganizationIdentity } from "../../_components/entities/organization/OrganizationIdentity";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../_components/loading/DashboardLoadingStatus";
import { useDashboardAuth } from "../../_components/providers/DashboardAuthProvider";
import { getDashboardCapabilities } from "../../_registry/surfaceRegistry";

export function OrganizationSurfaceSkeletonClient() {
	const { membership, user } = useDashboardAuth();
	const canManage = Boolean(
		user &&
			getDashboardCapabilities(membership.role, user.platformRole).has(
				"organization.manage",
			),
	);
	return (
		<DashboardLoadingStatus label="Loading organization">
			<DashboardSection
				actions={
					canManage ? (
						<Button.Skeleton size="sm" variant="primary">
							Organization settings
						</Button.Skeleton>
					) : null
				}
				contentClassName="grid gap-5"
				title="Organization"
			>
				<Card>
					<Card.Header>
						<Card.Title className="inline-flex items-center gap-2">
							<Icon
								className="text-muted-foreground"
								name="building"
								size="sm"
							/>
							Organization identity
						</Card.Title>
						<Card.Description>
							The active organization for this dashboard session.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<OrganizationIdentity.Skeleton avatarSize="xl" variant="profile" />
						<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
							<DashboardDetailField.Skeleton
								icon={<Icon name="building" size="sm" />}
								label="Name"
								value="Demo organization"
							/>
							<DashboardDetailField.Skeleton
								copyable
								icon={<Icon name="at" size="sm" />}
								label="Slug"
								value="demo"
							/>
							<DashboardDetailField.Skeleton
								icon={<Icon name="shield" size="sm" />}
								label="Your role"
								truncateValue={false}
							>
								<Chip.Skeleton>Owner</Chip.Skeleton>
							</DashboardDetailField.Skeleton>
							<DashboardDetailField.Skeleton
								icon={<Icon name="users" size="sm" />}
								label="Organization mode"
								value="Multi-organization"
							/>
						</dl>
					</Card.Content>
				</Card>
				<Text as="p" className="w-full text-sm leading-6" tone="muted">
					Looking for something specific and cannot find it?{" "}
					<Button
						className="inline-flex align-baseline font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
						href={hrefFor("dashboard.support")}
						size="none"
						variant="ghost"
					>
						Contact support
					</Button>
					. Looking for the account settings page?{" "}
					<Button
						className="inline-flex align-baseline font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
						href={hrefFor("dashboard.settings")}
						size="none"
						variant="ghost"
					>
						Open account settings
					</Button>
					.
				</Text>
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
