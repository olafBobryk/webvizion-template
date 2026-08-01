import { OrganizationIdentity } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity";
import { toOrganizationEntity } from "@/app/(site)/dashboard/_lib/entities/organization/domain";
import { getOrganizationPresentation } from "@/app/(site)/dashboard/_lib/entities/organization/presentation";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Card } from "@/components/ui/primitives/surfaces";
import type {
	Organization,
	OrganizationMembership,
} from "@/lib/auth/contracts";
import {
	AuthDomainError,
	type AuthErrorCode,
	toPublicAuthError,
} from "@/lib/auth/errors";
import { selectOrganizationAction } from "../../(auth)/actions";

export type OrganizationSelectionChoice = {
	membership: OrganizationMembership;
	organization: Organization;
};

const organizationChoiceSkeletonKeys = ["alpha", "bravo", "charlie", "delta"];

function getErrorMessage(message?: string) {
	if (!message) return null;
	return toPublicAuthError(new AuthDomainError(message as AuthErrorCode))
		.message;
}

type OrganizationSelectionCardSkeletonProps = {
	choiceCount?: number;
	choices?: readonly {
		current?: boolean;
		displayLabel: string;
		key: string;
		secondaryLabel: string;
	}[];
	currentChoice?: boolean;
	description?: React.ReactNode;
	headingIcon?: IconName;
	title?: React.ReactNode;
};

function OrganizationSelectionCardRoot({
	choices,
	currentOrganizationId,
	description = "Choose the workspace you want to use for this dashboard session.",
	headingIcon,
	message,
	next,
	title = "Choose an organization",
}: {
	choices: readonly OrganizationSelectionChoice[];
	currentOrganizationId?: string;
	description?: React.ReactNode;
	headingIcon?: IconName;
	message?: string;
	next: string;
	title?: React.ReactNode;
}) {
	const errorMessage = getErrorMessage(message);

	return (
		<Card className="w-full max-w-lg">
			<Card.Header>
				<Card.Title as="h1" className="inline-flex items-center gap-2">
					{headingIcon ? (
						<Icon
							className="text-muted-foreground"
							name={headingIcon}
							size="sm"
						/>
					) : null}
					{title}
				</Card.Title>
				<Card.Description>{description}</Card.Description>
				{errorMessage ? (
					<StatusMessage className="mt-3" tone="danger">
						{errorMessage}
					</StatusMessage>
				) : null}
			</Card.Header>
			<Card.Content>
				<div className="divide-y divide-border/70">
					{choices.map(({ membership, organization }) => {
						const current = organization.id === currentOrganizationId;
						const presentation = getOrganizationPresentation(
							toOrganizationEntity(organization, membership.role),
						);
						return (
							<form
								action={selectOrganizationAction}
								className="py-3 first:pt-0 last:pb-0"
								key={membership.id}
							>
								<input name="next" type="hidden" value={next} />
								<input
									name="organizationId"
									type="hidden"
									value={membership.organizationId}
								/>
								<Button
									align="between"
									className="h-auto w-full gap-4 rounded-none px-0 py-0"
									size="none"
									type="submit"
									variant="ghost"
								>
									<OrganizationIdentity presentation={presentation} />
									<span className="flex shrink-0 items-center gap-2">
										{current ? <Chip tone="primary">Current</Chip> : null}
										<Icon
											className="text-muted-foreground"
											name="arrow-right"
											size="sm"
										/>
									</span>
								</Button>
							</form>
						);
					})}
				</div>
			</Card.Content>
		</Card>
	);
}

function OrganizationSelectionCardSkeleton({
	choiceCount = 3,
	choices,
	currentChoice = false,
	description = "Choose the workspace you want to use for this dashboard session.",
	headingIcon,
	title = "Choose an organization",
}: OrganizationSelectionCardSkeletonProps) {
	const skeletonChoices =
		choices ??
		organizationChoiceSkeletonKeys.slice(0, choiceCount).map((key, index) => ({
			current: currentChoice && index === 0,
			displayLabel: "Example organization",
			key,
			secondaryLabel: "example · Member",
		}));
	return (
		<Card className="w-full max-w-lg">
			<Card.Heading
				description={description}
				title={
					<>
						{headingIcon ? (
							<Icon
								className="text-muted-foreground"
								name={headingIcon}
								size="sm"
							/>
						) : null}
						{title}
					</>
				}
				titleAs="h1"
			/>
			<Card.Content>
				<div className="divide-y divide-border/70">
					{skeletonChoices.map((choice) => (
						<div className="py-3 first:pt-0 last:pb-0" key={choice.key}>
							<div className="flex items-center justify-between gap-4 border border-transparent">
								<OrganizationIdentity.Skeleton
									displayLabel={choice.displayLabel}
									secondaryLabel={choice.secondaryLabel}
								/>
								<span className="flex shrink-0 items-center gap-2">
									{choice.current ? (
										<Chip.Skeleton>Current</Chip.Skeleton>
									) : null}
									<Icon.Skeleton size="sm" />
								</span>
							</div>
						</div>
					))}
				</div>
			</Card.Content>
		</Card>
	);
}

export const OrganizationSelectionCard = Object.assign(
	OrganizationSelectionCardRoot,
	{ Skeleton: OrganizationSelectionCardSkeleton },
);
