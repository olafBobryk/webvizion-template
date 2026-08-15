import { type NextRequest, NextResponse } from "next/server";
import { fixtureServiceHealth, isFixtureServiceId } from "@/lib/health/fixture";

export function GET(request: NextRequest) {
	const service = request.nextUrl.searchParams.get("service");
	const checkedAt = new Date().toISOString();
	if (service) {
		if (!isFixtureServiceId(service)) {
			return NextResponse.json(
				{ message: "Unknown fixture service." },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ checkedAt, service: fixtureServiceHealth[service] },
			{ headers: { "Cache-Control": "no-store" } },
		);
	}

	return NextResponse.json(
		{ checkedAt, services: fixtureServiceHealth },
		{ headers: { "Cache-Control": "no-store" } },
	);
}
