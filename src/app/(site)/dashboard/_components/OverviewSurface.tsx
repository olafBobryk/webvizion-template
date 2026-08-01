import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { hrefFor } from "@/lib/routes";
import { getDashboardSurfaceById } from "../_registry/surfaceRegistry";
import { DashboardSection } from "./layout/DashboardSection";
import { DashboardLoadingStatus } from "./loading/DashboardLoadingStatus";

const referenceSurface = getDashboardSurfaceById("dashboard.reference");

function OverviewContent({ showReference }: { showReference: boolean }) {
	return (
		<DashboardSection
			contentClassName="grid gap-4"
			description="Quick access to your organization, records, and account settings."
			title="Overview"
		>
			<OverviewCard
				description="Review members, roles, and organization administration."
				href={hrefFor("dashboard.organization")}
				icon="building"
				label="Open organization"
				title="Organization"
			/>
			<OverviewCard
				description="Browse and manage records for the active organization."
				href={hrefFor("dashboard.records")}
				icon="database"
				label="Open records"
				title="Records"
			/>
			<OverviewCard
				description="Manage your profile, security, and accessibility preferences."
				href={hrefFor("dashboard.settings")}
				icon="gear"
				label="Open account settings"
				title="Account"
			/>
			{showReference && referenceSurface ? (
				<OverviewCard
					description={referenceSurface.description}
					href={referenceSurface.href}
					icon={referenceSurface.icon}
					label="Open reference"
					title={referenceSurface.label}
				/>
			) : null}
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
			<Card.Heading
				description={description}
				leading={<Icon name={icon} size="sm" />}
				title={title}
			/>
			<Card.Content>
				<Button href={href} size="sm" variant="secondary">
					{label}
				</Button>
			</Card.Content>
		</Card>
	);
}

export function OverviewSurface({
	showReference = false,
}: {
	showReference?: boolean;
}) {
	return <OverviewContent showReference={showReference} />;
}

export function OverviewSurfaceSkeleton({
	showReference = process.env.NODE_ENV !== "production",
}: {
	showReference?: boolean;
}) {
	return (
		<DashboardLoadingStatus label="Loading dashboard overview">
			<OverviewContent showReference={showReference} />
		</DashboardLoadingStatus>
	);
}
