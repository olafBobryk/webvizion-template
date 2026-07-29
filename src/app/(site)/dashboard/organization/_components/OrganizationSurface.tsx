import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { OrganizationIdentity } from "../../_components/entities/organization/OrganizationIdentity";
import {
	DashboardFooterNote,
	DashboardFooterNoteLink,
} from "../../_components/layout/DashboardFooterNote";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import type { OrganizationPresentation } from "../../_lib/entities/organization/presentation";
import { OrganizationSurfaceSkeletonClient } from "./OrganizationSurfaceSkeleton.client";

export function OrganizationSurface({
	canManage,
	modeLabel,
	name,
	presentation,
	role,
	slug,
}: {
	canManage: boolean;
	modeLabel: string;
	name: string;
	presentation: OrganizationPresentation;
	role: { shortLabel: string; tone: "info" | "neutral" | "warning" };
	slug: string;
}) {
	return (
		<DashboardSection
			actions={
				canManage ? (
					<Button
						href="/dashboard/organization/settings"
						size="sm"
						variant="primary"
					>
						Organization settings
					</Button>
				) : null
			}
			contentClassName="grid gap-5"
			title="Organization"
		>
			<Card>
				<Card.Header className="border-b">
					<Card.Title className="inline-flex items-center gap-2">
						<Icon className="text-muted-foreground" name="building" size="sm" />
						Organization identity
					</Card.Title>
					<Card.Description>
						The active organization for this dashboard session.
					</Card.Description>
				</Card.Header>
				<Card.Content className="grid gap-5">
					<OrganizationIdentity
						avatarSize="xl"
						presentation={presentation}
						variant="profile"
					/>
					<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
						<DashboardDetailField
							icon={<Icon name="building" size="sm" />}
							label="Name"
							value={name}
						/>
						<DashboardDetailField
							copyLabel="Copy organization slug"
							copyValue={slug}
							icon={<Icon name="at" size="sm" />}
							label="Slug"
							value={slug}
						/>
						<DashboardDetailField
							icon={<Icon name="shield" size="sm" />}
							label="Your role"
							value={<Chip color={role.tone}>{role.shortLabel}</Chip>}
						/>
						<DashboardDetailField
							icon={<Icon name="users" size="sm" />}
							label="Organization mode"
							value={modeLabel}
						/>
					</dl>
				</Card.Content>
			</Card>
			<DashboardFooterNote>
				Looking for account preferences?{" "}
				<DashboardFooterNoteLink href="/dashboard/settings">
					Open Account settings
				</DashboardFooterNoteLink>
				.
			</DashboardFooterNote>
		</DashboardSection>
	);
}

export function OrganizationSurfaceSkeleton() {
	return <OrganizationSurfaceSkeletonClient />;
}
