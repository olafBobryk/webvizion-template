import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { hrefFor } from "@/lib/routes";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { AccountIdentity } from "../../_components/entities/account/AccountIdentity";
import {
	DashboardFooterNote,
	DashboardFooterNoteLink,
} from "../../_components/layout/DashboardFooterNote";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import type { AccountPresentation } from "../../_lib/entities/account/presentation";
import type { DashboardCapability } from "../../_registry/surfaceRegistry";
import { dashboardCapabilityLabels } from "../../_registry/surfaceRegistry";
import { ProfileSurfaceSkeletonClient } from "./ProfileSurfaceSkeleton.client";

export function ProfileSurface({
	capabilities,
	presentation,
	role,
}: {
	capabilities: DashboardCapability[];
	presentation: AccountPresentation;
	role: { shortLabel: string; tone: "info" | "neutral" | "warning" };
}) {
	return (
		<DashboardSection
			actions={
				<Button
					href={hrefFor("dashboard.settings")}
					size="sm"
					variant="primary"
				>
					Account settings
				</Button>
			}
			contentClassName="grid gap-5"
			title="Profile"
		>
			<Card>
				<Card.Heading
					description="The profile shown across the application."
					leading={
						<Icon className="text-muted-foreground" name="user" size="sm" />
					}
					title="Account identity"
				/>
				<Card.Content className="grid gap-5">
					<AccountIdentity avatarSize="xl" presentation={presentation} />
					<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
						<DashboardDetailField
							copyLabel="Copy email address"
							copyValue={presentation.emailLabel}
							icon={<Icon name="mail" size="sm" />}
							label="Email"
							value={presentation.emailLabel}
						/>
						<DashboardDetailField
							icon={<Icon name="calendar" size="sm" />}
							label="Joined"
							value={presentation.joinedAtLabel}
						/>
					</dl>
				</Card.Content>
			</Card>
			<Card>
				<Card.Heading
					description="Access resolved for the active organization."
					leading={
						<Icon className="text-muted-foreground" name="shield" size="sm" />
					}
					title="Organization access"
				/>
				<Card.Content>
					<dl className="grid gap-4 sm:grid-cols-2">
						<DashboardDetailField
							icon={<Icon name="building" size="sm" />}
							label="Organization"
							value={presentation.organizationLabel}
						/>
						<DashboardDetailField
							icon={<Icon name="shield" size="sm" />}
							label="Organization role"
							value={<Chip color={role.tone}>{role.shortLabel}</Chip>}
						/>
						<DashboardDetailField
							className="sm:col-span-2"
							icon={<Icon name="check" size="sm" />}
							label="Permissions"
							truncateValue={false}
							value={
								<span className="flex flex-wrap gap-2">
									{capabilities.map((capability) => (
										<Chip color="muted" key={capability}>
											{dashboardCapabilityLabels[capability]}
										</Chip>
									))}
								</span>
							}
						/>
					</dl>
				</Card.Content>
			</Card>
			<DashboardFooterNote>
				Profile edits remain in{" "}
				<DashboardFooterNoteLink href={hrefFor("dashboard.settings")}>
					Account settings
				</DashboardFooterNoteLink>
				.
			</DashboardFooterNote>
		</DashboardSection>
	);
}

export function ProfileSurfaceSkeleton() {
	return <ProfileSurfaceSkeletonClient />;
}
