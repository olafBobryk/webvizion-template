import { NextResponse } from "next/server";
import { resetReferenceRecordFixtureState } from "@/app/(site)/dashboard/_lib/fixtures/reference-records.server";
import { resetPlatformFixtureState } from "@/app/(site)/dashboard/_lib/platform/fixtures.server";
import { dashboardDebugEnabled } from "@/app/(site)/dashboard/_registry/debug";
import { resetFixtureAuthState } from "@/lib/auth/fixture-adapter";
import { clearSessionId } from "@/lib/auth/server";

export async function POST() {
	if (!dashboardDebugEnabled) {
		return NextResponse.json({ message: "Not found." }, { status: 404 });
	}
	resetFixtureAuthState();
	resetPlatformFixtureState();
	resetReferenceRecordFixtureState();
	await clearSessionId();
	return NextResponse.json({ message: "Fixture state reset." });
}
