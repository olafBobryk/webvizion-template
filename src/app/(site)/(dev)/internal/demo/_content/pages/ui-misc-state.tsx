"use client";

import { ErrorState, IdleState, StateIndicator } from "@/components/ui/misc";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiMiscStateDemoPage: DemoPage = {
	id: "ui-misc-state",
	slug: ["ui", "misc", "state"],
	title: "UI Misc: State",
	description: "State helpers",
	groups: [
		{
			id: "misc-state",
			title: "State",
			description: "State helpers",
			items: [
				{
					id: "state-indicator",
					kind: "component",
					name: "StateIndicator",
					label: "State summary",
					related: relatedMap.StateIndicator,
					Render() {
						return (
							<div className="grid gap-4">
								<StateIndicator
									align="center"
									description="This dashboard route is unavailable."
									layout="stacked"
									title="Surface unavailable"
								/>
								<StateIndicator
									align="center"
									description="Create the first record to populate this surface."
									iconClassName="text-muted-foreground"
									iconName="cards"
									layout="stacked"
									title="No records yet"
									variant="framed"
								/>
							</div>
						);
					},
				},
				{
					id: "error-state",
					kind: "component",
					name: "ErrorState",
					label: "Error state",
					related: relatedMap.ErrorState,
					Render() {
						return <ErrorState description="Try again later" />;
					},
				},
				{
					id: "idle-state",
					kind: "component",
					name: "IdleState",
					label: "Idle state",
					related: relatedMap.IdleState,
					Render() {
						return <IdleState description="Nothing here yet" />;
					},
				},
			],
		},
	],
};
