import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import type { MembershipRole } from "@/lib/auth/contracts";
import { DashboardEntityCommands } from "../../../../_components/commands/DashboardEntityCommands";
import {
	DashboardDetailField,
	DashboardDetailFieldSkeleton,
} from "../../../../_components/detail/DashboardDetailField";
import {
	MemberIdentity,
	MemberIdentitySkeleton,
} from "../../../../_components/entities/member/MemberIdentity";
import {
	MemberRoleChip,
	MemberRoleChipSkeleton,
} from "../../../../_components/entities/member/MemberRoleChip";
import { DashboardSection } from "../../../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../../../_components/loading/DashboardLoadingStatus";
import type { ReferenceMember } from "../../../../_lib/entities/member/domain";
import {
	getMemberCommand,
	type MemberPresentation,
	memberFieldDefinitions,
} from "../../../../_lib/entities/member/presentation";

const permissionPresentation = {
	access: { color: "violet", label: "Access" },
	invites: { color: "success", label: "Invites" },
	memberAreas: { color: "muted", label: "Member areas" },
	ownership: { color: "violet", label: "Ownership" },
	profiles: { color: "muted", label: "Profiles" },
} as const;

const permissionsByRole = {
	admin: ["profiles", "invites", "access"],
	member: ["profiles", "memberAreas"],
	owner: ["profiles", "invites", "access", "ownership"],
} as const satisfies Record<MembershipRole, readonly PermissionKey[]>;

const sourceRoleTone = {
	admin: "warning",
	member: "neutral",
	owner: "primary",
} as const;

type PermissionKey = keyof typeof permissionPresentation;

export function OrganizationMemberSurface({
	isOwnProfile,
	member,
	presentation,
}: {
	isOwnProfile: boolean;
	member: ReferenceMember;
	presentation: MemberPresentation;
}) {
	return (
		<DashboardSection
			actions={
				isOwnProfile ? (
					<Button href="/dashboard/settings" size="sm" variant="primary">
						Settings
					</Button>
				) : null
			}
			contentClassName="grid gap-5"
			title={presentation.displayLabel}
		>
			<DashboardEntityCommands
				commands={[getMemberCommand(presentation)]}
				ownerId={`dashboard.member.${member.id}`}
			/>
			<Card>
				<Card.Header>
					<Card.Title className="flex items-center gap-2">
						<Icon className="text-muted-foreground" name="user" size="sm" />
						Member details
					</Card.Title>
					<Card.Description>
						Access information visible to organization members.
					</Card.Description>
				</Card.Header>
				<Card.Content className="grid gap-5">
					<MemberIdentity presentation={presentation} variant="profile" />
					<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
						<DashboardDetailField
							copyValue={presentation.emailLabel}
							icon={
								<Icon
									name={memberFieldDefinitions[1].icon ?? "mail"}
									size="sm"
								/>
							}
							label={memberFieldDefinitions[1].label}
							value={presentation.emailLabel}
						/>
						<DashboardDetailField
							icon={
								<Icon
									name={memberFieldDefinitions[3].icon ?? "calendar"}
									size="sm"
								/>
							}
							label={memberFieldDefinitions[3].label}
							value={presentation.joinedAtLabel}
						/>
					</dl>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header>
					<Card.Title className="flex items-center gap-2">
						<Icon className="text-muted-foreground" name="shield" size="sm" />
						Role and permissions
					</Card.Title>
					<Card.Description>
						Organization access assigned to this member.
					</Card.Description>
				</Card.Header>
				<Card.Content className="grid gap-5">
					<dl className="grid gap-4 sm:grid-cols-2">
						<DashboardDetailField
							icon={<Icon name="shield" size="sm" />}
							label="Organization role"
							value={
								<MemberRoleChip
									label={presentation.role.shortLabel}
									tone={sourceRoleTone[member.role]}
								/>
							}
						/>
						<DashboardDetailField
							icon={<Icon name="check" size="sm" />}
							label="Permissions"
							truncateValue={false}
							value={
								<span className="flex flex-wrap gap-2">
									{permissionsByRole[member.role].map((permission) => {
										const item = permissionPresentation[permission];
										return (
											<Chip color={item.color} key={permission}>
												{item.label}
											</Chip>
										);
									})}
								</span>
							}
						/>
					</dl>
				</Card.Content>
			</Card>

			<Text as="p" className="w-full text-sm leading-6" tone="muted">
				Looking for something specific and cannot find it?{" "}
				<Button
					className="inline-flex align-baseline font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
					href="/dashboard/support"
					size="none"
					variant="ghost"
				>
					Contact support
				</Button>
				. Looking for settings?{" "}
				<Button
					className="inline-flex align-baseline font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
					href="/dashboard/settings"
					size="none"
					variant="ghost"
				>
					Settings
				</Button>
				.
			</Text>
		</DashboardSection>
	);
}

export function OrganizationMemberSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading member details">
			<DashboardSection
				actions={
					<Button.Skeleton size="sm" variant="primary">
						Settings
					</Button.Skeleton>
				}
				contentClassName="grid gap-5"
				title={
					<Text.Skeleton as="span" variant="headingPage">
						Example member
					</Text.Skeleton>
				}
			>
				<Card>
					<Card.Header>
						<Card.Title className="flex items-center gap-2">
							<Icon className="text-muted-foreground" name="user" size="sm" />
							Member details
						</Card.Title>
						<Card.Description>
							Access information visible to organization members.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<MemberIdentitySkeleton variant="profile" />
						<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
							<DashboardDetailFieldSkeleton
								copyable
								icon={
									<Icon
										name={memberFieldDefinitions[1].icon ?? "mail"}
										size="sm"
									/>
								}
								label={memberFieldDefinitions[1].label}
								value="member@example.com"
							/>
							<DashboardDetailFieldSkeleton
								icon={
									<Icon
										name={memberFieldDefinitions[3].icon ?? "calendar"}
										size="sm"
									/>
								}
								label={memberFieldDefinitions[3].label}
								value="20 Jul 2026"
							/>
						</dl>
					</Card.Content>
				</Card>
				<Card>
					<Card.Header>
						<Card.Title className="flex items-center gap-2">
							<Icon className="text-muted-foreground" name="shield" size="sm" />
							Role and permissions
						</Card.Title>
						<Card.Description>
							Organization access assigned to this member.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-5">
						<dl className="grid gap-4 sm:grid-cols-2">
							<DashboardDetailFieldSkeleton
								icon={<Icon name="shield" size="sm" />}
								label="Organization role"
								truncateValue={false}
							>
								<MemberRoleChipSkeleton />
							</DashboardDetailFieldSkeleton>
							<DashboardDetailFieldSkeleton
								icon={<Icon name="check" size="sm" />}
								label="Permissions"
								truncateValue={false}
							>
								<span className="flex flex-wrap gap-2">
									<Chip.Skeleton>Profiles</Chip.Skeleton>
									<Chip.Skeleton>Invites</Chip.Skeleton>
									<Chip.Skeleton>Access</Chip.Skeleton>
									<Chip.Skeleton>Ownership</Chip.Skeleton>
								</span>
							</DashboardDetailFieldSkeleton>
						</dl>
					</Card.Content>
				</Card>
				<Text as="p" className="w-full text-sm leading-6" tone="muted">
					Looking for something specific and cannot find it?{" "}
					<Button
						className="inline-flex align-baseline font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
						href="/dashboard/support"
						size="none"
						variant="ghost"
					>
						Contact support
					</Button>
					. Looking for settings?{" "}
					<Button
						className="inline-flex align-baseline font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
						href="/dashboard/settings"
						size="none"
						variant="ghost"
					>
						Settings
					</Button>
					.
				</Text>
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
