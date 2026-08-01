"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { HealthCheckIndicator } from "./HealthCheckIndicator";

const _healthyResponse = {
	status: "healthy",
	checkedAt: "2026-08-01T12:00:00.000Z",
	services: {
		app: { status: "healthy", message: "App is available." },
		supabase: {
			status: "healthy",
			message: "Database is available.",
			latencyMs: 18,
		},
	},
};
function CatalogPreview1() {
	return createElement(
		HealthCheckIndicator as unknown as ComponentType<Record<string, unknown>>,
		{ ...{}, ...{ endpoint: "/storybook-health", label: "Database" } },
	);
}
function CatalogPreview2() {
	return createElement(
		HealthCheckIndicator as unknown as ComponentType<Record<string, unknown>>,
		{
			...{},
			...{ endpoint: "/storybook-health", label: "API", variant: "sm" },
		},
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-health-check-indicator",
	name: "HealthCheckIndicator",
	role: "Compact live service-health status with optional user-triggered refresh.",
	importStatement:
		'import { HealthCheckIndicator } from "@/components/ui/misc";',
	chooseWhen: [
		"A health endpoint should be represented by shared checking, operational, and unavailable states.",
	],
	chooseInstead: [
		"Use StateIndicator when service availability owns an entire region.",
	],
	compounds: [],
	exclusions: ["Page-local polling badges and response-schema variants."],
	guarantees: [
		{
			label: "Polite operational status",
			storyId: "ui-misc-health-check-indicator--operational-contract",
		},
		{
			label: "Compact non-action presentation",
			storyId: "ui-misc-health-check-indicator--compact-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "operational-contract",
			name: "Polite operational status",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "compact-contract",
			name: "Compact non-action presentation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
