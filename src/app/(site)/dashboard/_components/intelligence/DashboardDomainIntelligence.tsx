import { Chip } from "@/components/ui/misc";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import {
	getDashboardDomainAreaInventory,
	getDashboardDomainAreasForEditedPaths,
} from "../../_registry/surfaceRegistry";

export function DashboardDomainChips({
	editedPaths,
}: {
	editedPaths: readonly string[];
}) {
	const areas = getDashboardDomainAreasForEditedPaths(editedPaths);
	if (areas.length === 0) return null;

	return (
		<div className="grid gap-2">
			<Text variant="caption" tone="muted">
				Dashboard areas edited
			</Text>
			<div className="flex flex-wrap gap-2">
				{areas.map((area) => (
					<Chip key={area.id} tone="neutral">
						{area.label}
					</Chip>
				))}
			</div>
		</div>
	);
}

export function DashboardDomainOverview({
	turns,
}: {
	turns: readonly { editedPaths: readonly string[] }[];
}) {
	const inventory = getDashboardDomainAreaInventory();
	const touchedCounts = new Map(inventory.map((area) => [area.id, 0]));

	for (const turn of turns) {
		for (const area of getDashboardDomainAreasForEditedPaths(
			turn.editedPaths,
		)) {
			touchedCounts.set(area.id, (touchedCounts.get(area.id) ?? 0) + 1);
		}
	}

	const touchedTurnCount = turns.filter(
		(turn) =>
			getDashboardDomainAreasForEditedPaths(turn.editedPaths).length > 0,
	).length;

	return (
		<Card>
			<Card.Heading
				description="Current registered product areas and the local turns that edited them.\n\t\t\t\t\tUnselected or removed surfaces are excluded automatically."
				title="Dashboard domain coverage"
			/>
			<Card.Content className="grid gap-5">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{inventory.map((area) => {
						const touchedCount = touchedCounts.get(area.id) ?? 0;
						return (
							<div className="grid gap-1" key={area.id}>
								<Text variant="headingSm">{area.label}</Text>
								<Text variant="caption" tone="muted">
									{area.surfaceCount} registered{" "}
									{area.surfaceCount === 1 ? "surface" : "surfaces"} ·{" "}
									{touchedCount} {touchedCount === 1 ? "turn" : "turns"} touched
								</Text>
								<Text variant="caption">{area.surfaceLabels.join(", ")}</Text>
							</div>
						);
					})}
				</div>
				{touchedTurnCount === 0 ? (
					<Text variant="caption" tone="muted">
						No dashboard domain edits have been observed in local Codex turns
						yet.
					</Text>
				) : null}
			</Card.Content>
		</Card>
	);
}
