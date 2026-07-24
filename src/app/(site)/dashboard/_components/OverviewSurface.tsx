import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { DashboardSection } from "./layout/DashboardSection";
import { DashboardLoadingStatus } from "./loading/DashboardLoadingStatus";

function OverviewContent() {
	return (
		<DashboardSection
			contentClassName="grid gap-4"
			description="Quick access to your organization, records, and account settings."
			title="Overview"
		>
			<OverviewCard
				description="Review members, roles, and organization administration."
				href="/dashboard/organization"
				icon="building"
				label="Open organization"
				title="Organization"
			/>
			{/* prune:dashboard.reference-entities:start */}
			<OverviewCard
				description="Browse and manage records for the active organization."
				href="/dashboard/records"
				icon="database"
				label="Open records"
				title="Records"
			/>
			{/* prune:dashboard.reference-entities:end */}
			<OverviewCard
				description="Manage your profile, security, and accessibility preferences."
				href="/dashboard/settings"
				icon="gear"
				label="Open account settings"
				title="Account"
			/>
		</DashboardSection>
	);
}

function OverviewCard({
	description,
	href,
	icon,
	label,
	title,
}: {
	description: string;
	href: string;
	icon: React.ComponentProps<typeof Icon>["name"];
	label: string;
	title: string;
}) {
	return (
		<Card>
			<Card.Header className="border-b">
				<Card.Title className="inline-flex items-center gap-2">
					<Icon name={icon} size="sm" />
					{title}
				</Card.Title>
				<Card.Description>{description}</Card.Description>
			</Card.Header>
			<Card.Content>
				<Button href={href} size="sm" variant="secondary">
					{label}
				</Button>
			</Card.Content>
		</Card>
	);
}

export function OverviewSurface() {
	return <OverviewContent />;
}

export function OverviewSurfaceSkeleton() {
	return (
		<DashboardLoadingStatus label="Loading dashboard overview">
			<OverviewContent />
		</DashboardLoadingStatus>
	);
}
