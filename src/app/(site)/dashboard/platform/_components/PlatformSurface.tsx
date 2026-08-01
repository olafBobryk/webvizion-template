import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
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
				<Card.Heading
					description="Review support requests submitted from dashboard support."
					leading={<Icon name="mail" size="sm" />}
					title="Inbox"
				/>
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
				<Card.Heading
					description="Review product reports captured from dashboard routes."
					leading={<Icon name="flag" size="sm" />}
					title="Reports"
				/>
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
