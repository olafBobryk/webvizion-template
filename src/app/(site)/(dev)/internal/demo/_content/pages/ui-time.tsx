"use client";

import { DateAgo } from "@/components/ui/time/DateAgo";
import { DateIndicator } from "@/components/ui/time/DateIndicator";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiTimeDemoPage: DemoPage = {
	id: "ui-time",
	slug: ["ui", "time"],
	title: "UI Time",
	description: "Date helpers",
	groups: [
		{
			id: "time",
			title: "Time",
			description: "Date helpers",
			items: [
				{
					id: "date-ago",
					kind: "component",
					name: "DateAgo",
					label: "Relative time",
					related: relatedMap.DateAgo,
					Render() {
						return <DateAgo date={new Date(Date.now() - 1000 * 60 * 90)} />;
					},
				},
				{
					id: "date-indicator",
					kind: "component",
					name: "DateIndicator",
					label: "Formatted date",
					related: relatedMap.DateIndicator,
					Render() {
						return <DateIndicator />;
					},
				},
			],
		},
	],
};
