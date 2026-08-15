"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { HealthCheckIndicator } from "./HealthCheckIndicator";

function CatalogPreview1() {
	return createElement(
		HealthCheckIndicator as unknown as ComponentType<Record<string, unknown>>,
		{ ...{}, ...{ endpoint: "/storybook-health", service: "auth" } },
	);
}
function CatalogPreview2() {
	return createElement(
		HealthCheckIndicator as unknown as ComponentType<Record<string, unknown>>,
		{ ...{}, ...{ endpoint: "/storybook-health", service: "platform" } },
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-health-check-indicator",
	name: "HealthCheckIndicator",
	role: "Compact deterministic fixture-service status with shared checking, available, and unavailable states.",
	importStatement:
		'import { HealthCheckIndicator } from "@/components/ui/misc";',
	chooseWhen: [
		"A template fixture service should expose shared checking, available, and unavailable states.",
	],
	chooseInstead: [
		"Use StateIndicator when service availability owns an entire region.",
	],
	compounds: [],
	exclusions: [
		"Page-local polling badges, refresh controls, and response-schema variants.",
	],
	guarantees: [
		{
			label: "Polite fixture sign-in status",
			storyId: "ui-misc-health-check-indicator--operational-contract",
		},
		{
			label: "Checking fixture state",
			storyId: "ui-misc-health-check-indicator--checking-contract",
		},
		{
			label: "Platform fixture status",
			storyId: "ui-misc-health-check-indicator--platform-fixture-contract",
		},
		{
			label: "Unavailable fixture state",
			storyId: "ui-misc-health-check-indicator--unavailable-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "operational-contract",
			name: "Polite fixture sign-in status",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "platform-fixture-contract",
			name: "Platform fixture status",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
