import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import {
	DashboardDetailField,
	DashboardDetailFieldSkeleton,
} from "../../_components/detail/DashboardDetailField";
import {
	AccountIdentity,
	AccountIdentitySkeleton,
} from "../../_components/entities/account/AccountIdentity";
import {
	DashboardFooterNote,
	DashboardFooterNoteLink,
} from "../../_components/layout/DashboardFooterNote";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../_components/loading/DashboardLoadingStatus";
import type { AccountPresentation } from "../../_lib/entities/account/presentation";
import type { DashboardCapability } from "../../_registry/surfaceRegistry";
import { dashboardCapabilityLabels } from "../../_registry/surfaceRegistry";

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
				<Button href="/dashboard/settings" size="sm" variant="primary">
					Account settings
				</Button>
			}
			contentClassName="grid gap-5"
			title="Profile"
		>
			<Card>
				<Card.Header className="border-b">
					<Card.Title className="inline-flex items-center gap-2">
						<Icon className="text-muted-foreground" name="user" size="sm" />
						Account identity
					</Card.Title>
					<Card.Description>
						The profile shown across the application.
					</Card.Description>
				</Card.Header>
				<Card.Content className="grid gap-5">
					<AccountIdentity presentation={presentation} />
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
				<Card.Header className="border-b">
					<Card.Title className="inline-flex items-center gap-2">
						<Icon className="text-muted-foreground" name="shield" size="sm" />
						Organization access
					</Card.Title>
					<Card.Description>
						Access resolved for the active organization.
					</Card.Description>
				</Card.Header>
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
				<DashboardFooterNoteLink href="/dashboard/settings">
					Account settings
				</DashboardFooterNoteLink>
				.
			</DashboardFooterNote>
		</DashboardSection>
	);
}

export function ProfileSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading profile">
			<DashboardSection
				actions={
					<Button.Skeleton size="sm" variant="primary">
						Account settings
					</Button.Skeleton>
				}
				contentClassName="grid gap-5"
				title="Profile"
			>
				<Card>
					<Card.Header className="border-b">
						<Card.Title className="inline-flex items-center gap-2">
							<Icon className="text-muted-foreground" name="user" size="sm" />
							Account identity
						</Card.Title>
						<Card.Description>
							The profile shown across the application.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<AccountIdentitySkeleton />
						<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
							<DashboardDetailFieldSkeleton
								copyable
								icon={<Icon name="mail" size="sm" />}
								label="Email"
								value="account@example.com"
							/>
							<DashboardDetailFieldSkeleton
								icon={<Icon name="calendar" size="sm" />}
								label="Joined"
								value="20 Jul 2026"
							/>
						</dl>
					</Card.Content>
				</Card>
				<Card>
					<Card.Header className="border-b">
						<Card.Title className="inline-flex items-center gap-2">
							<Icon className="text-muted-foreground" name="shield" size="sm" />
							Organization access
						</Card.Title>
						<Card.Description>
							Access resolved for the active organization.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<dl className="grid gap-4 sm:grid-cols-2">
							<DashboardDetailFieldSkeleton
								icon={<Icon name="building" size="sm" />}
								label="Organization"
								value="Averlo Template"
							/>
							<DashboardDetailFieldSkeleton
								icon={<Icon name="shield" size="sm" />}
								label="Organization role"
								truncateValue={false}
							>
								<Chip.Skeleton>Owner</Chip.Skeleton>
							</DashboardDetailFieldSkeleton>
							<DashboardDetailFieldSkeleton
								className="sm:col-span-2"
								icon={<Icon name="check" size="sm" />}
								label="Permissions"
								truncateValue={false}
							>
								<span className="flex flex-wrap gap-2">
									<Chip.Skeleton>Dashboard</Chip.Skeleton>
									<Chip.Skeleton>Manage organization</Chip.Skeleton>
									<Chip.Skeleton>Manage records</Chip.Skeleton>
								</span>
							</DashboardDetailFieldSkeleton>
						</dl>
					</Card.Content>
				</Card>
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
