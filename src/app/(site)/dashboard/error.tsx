"use client";

import { Button } from "@/components/ui/primitives/Button";
import { hrefFor } from "@/lib/routes";
import { DashboardStatusFrame } from "./_components/layout/DashboardStatusFrame";

export default function DashboardErrorPage({ reset }: { reset: () => void }) {
	return (
		<DashboardStatusFrame
			action={
				<div className="flex gap-2">
					<Button onClick={reset} variant="primary">
						Try again
					</Button>
					<Button href={hrefFor("dashboard.overview")} variant="secondary">
						Go to overview
					</Button>
				</div>
			}
			description="The dashboard could not complete this request."
			title="Something went wrong"
		/>
	);
}
