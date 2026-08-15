"use client";

import clsx from "clsx";
import * as React from "react";
import { Chip, type ChipTone } from "@/components/ui/misc/Chip";
import { Loader } from "@/components/ui/misc/Loader";
import { Text } from "@/components/ui/primitives/Text";
import { getFixtureServiceHealth } from "@/lib/health/client";
import {
	type FixtureServiceHealth,
	type FixtureServiceId,
	fixtureServiceHealth,
} from "@/lib/health/fixture";

type HealthCheckIndicatorProps = {
	service: FixtureServiceId;
	endpoint?: string;
	className?: string;
};

type IndicatorState = "checking" | "available" | "unavailable";

const statusStyles: Record<IndicatorState, { dot: string; tone: ChipTone }> = {
	checking: {
		dot: "text-muted",
		tone: "neutral",
	},
	available: {
		dot: "bg-success",
		tone: "success",
	},
	unavailable: {
		dot: "bg-danger",
		tone: "danger",
	},
};

function getIndicatorState(
	response: FixtureServiceHealth | null,
	errorMessage: string | null,
): IndicatorState {
	if (errorMessage) return "unavailable";
	if (response === null) return "checking";
	return response.status === "available" ? "available" : "unavailable";
}

function getStatusLabel(state: IndicatorState) {
	switch (state) {
		case "checking":
			return "Checking";
		case "available":
			return "Available";
		case "unavailable":
			return "Unavailable";
	}
}

export function HealthCheckIndicator({
	service,
	endpoint = "/api/health",
	className,
}: HealthCheckIndicatorProps) {
	const [response, setResponse] = React.useState<FixtureServiceHealth | null>(
		null,
	);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	React.useEffect(() => {
		let isActive = true;

		async function checkHealth() {
			setResponse(null);
			setErrorMessage(null);
			try {
				const fixtureHealth = await getFixtureServiceHealth(service, endpoint);
				if (isActive) setResponse(fixtureHealth);
			} catch (error) {
				if (!isActive) return;
				setErrorMessage(
					error instanceof Error
						? error.message
						: "Fixture service is unavailable.",
				);
			}
		}

		void checkHealth();
		return () => {
			isActive = false;
		};
	}, [endpoint, service]);

	const state = getIndicatorState(response, errorMessage);
	const styles = statusStyles[state];
	const fixture = fixtureServiceHealth[service];
	const label = response?.label ?? fixture.label;
	const message =
		response?.message ??
		errorMessage ??
		`Checking ${fixture.label.toLowerCase()}.`;

	return (
		<Chip
			as="div"
			contentMode="contents"
			size="none"
			tone={styles.tone}
			className={clsx("min-w-0 gap-2 px-3 py-1.5", className)}
			aria-live="polite"
			title={message}
		>
			<span className="flex h-3 w-3 shrink-0 items-center justify-center">
				{state === "checking" ? (
					<Loader size="sm" className={styles.dot} />
				) : (
					<span className={clsx("h-2 w-2 rounded-full", styles.dot)} />
				)}
			</span>
			<Text
				as="span"
				variant="caption"
				theme="inherit"
				tone="inherit"
				className="truncate"
			>
				{label}: {getStatusLabel(state)}
			</Text>
		</Chip>
	);
}
