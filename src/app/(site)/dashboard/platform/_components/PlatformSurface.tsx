import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { hrefFor } from "@/lib/routes";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { PlatformOverviewLoading } from "./PlatformRouteLoading";

export function PlatformSurface() {
	return (
		<DashboardSection
			contentClassName="grid gap-4 md:grid-cols-2"
			description="Open internal platform support and report operations."
			title="Platform"
		>
			<Card>
				<Card.Header>
					<Card.Title className="inline-flex items-center gap-2">
						<Icon name="mail" size="sm" />
						Inbox
					</Card.Title>
					<Card.Description>
						Review support requests submitted from dashboard support.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						href={hrefFor("dashboard.platform.inbox")}
						size="sm"
						variant="secondary"
					>
						Open inbox
					</Button>
				</Card.Content>
			</Card>
			<Card>
				<Card.Header>
					<Card.Title className="inline-flex items-center gap-2">
						<Icon name="flag" size="sm" />
						Reports
					</Card.Title>
					<Card.Description>
						Review product reports captured from dashboard routes.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button
						href={hrefFor("dashboard.platform.reports")}
						size="sm"
						variant="secondary"
					>
						Open reports
					</Button>
				</Card.Content>
			</Card>
		</DashboardSection>
	);
}

export function PlatformSurfaceSkeleton() {
	return <PlatformOverviewLoading />;
}
