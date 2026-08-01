"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { DashboardDetailField } from "../../_components/detail/DashboardDetailField";
import { AccountIdentity } from "../../_components/entities/account/AccountIdentity";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { DashboardLoadingStatus } from "../../_components/loading/DashboardLoadingStatus";

export function ProfileSurfaceSkeletonClient() {
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
					<Card.Heading
						description="The profile shown across the application."
						leading={
							<Icon className="text-muted-foreground" name="user" size="sm" />
						}
						title="Account identity"
					/>
					<Card.Content className="grid gap-5">
						<AccountIdentity.Skeleton avatarSize="xl" />
						<dl className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
							<DashboardDetailField.Skeleton
								copyable
								icon={<Icon name="mail" size="sm" />}
								label="Email"
								value="account@example.com"
							/>
							<DashboardDetailField.Skeleton
								icon={<Icon name="calendar" size="sm" />}
								label="Joined"
								value="20 Jul 2026"
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
							<DashboardDetailField.Skeleton
								icon={<Icon name="building" size="sm" />}
								label="Organization"
								value="Averlo Template"
							/>
							<DashboardDetailField.Skeleton
								icon={<Icon name="shield" size="sm" />}
								label="Organization role"
								truncateValue={false}
							>
								<Chip.Skeleton>Owner</Chip.Skeleton>
							</DashboardDetailField.Skeleton>
							<DashboardDetailField.Skeleton
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
							</DashboardDetailField.Skeleton>
						</dl>
					</Card.Content>
				</Card>
			</DashboardSection>
		</DashboardLoadingStatus>
	);
}
