import type { FixtureServiceHealth, FixtureServiceId } from "./fixture";

function withServiceParam(endpoint: string, service: FixtureServiceId) {
	const url = new URL(endpoint, window.location.origin);
	url.searchParams.set("service", service);
	return url.toString();
}

export async function getFixtureServiceHealth(
	service: FixtureServiceId,
	endpoint = "/api/health",
): Promise<FixtureServiceHealth> {
	const response = await fetch(withServiceParam(endpoint, service), {
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error("Fixture service is unavailable.");
	}

	const payload = (await response.json()) as { service: FixtureServiceHealth };
	return payload.service;
}
