import { NextResponse } from "next/server";
import {
	getPlatformActorSnapshot,
	requireResolvedDashboardSession,
} from "@/app/(site)/dashboard/_lib/platform/access.server";
import {
	FEEDBACK_CATEGORIES,
	FEEDBACK_SEVERITIES,
	type FeedbackBrowserMetadata,
	type FeedbackCategory,
	type FeedbackSeverity,
} from "@/app/(site)/dashboard/_lib/platform/contracts";
import { createProductReport } from "@/app/(site)/dashboard/_lib/platform/fixtures.server";
import { hrefFor } from "@/lib/routes";

type FeedbackPayload = {
	browserMetadata?: unknown;
	category?: unknown;
	currentRoute?: unknown;
	description?: unknown;
	severity?: unknown;
	viewportHeight?: unknown;
	viewportWidth?: unknown;
};

function readText(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readMetadata(value: unknown): FeedbackBrowserMetadata {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as FeedbackBrowserMetadata)
		: {};
}

function readCategory(value: unknown): FeedbackCategory | null {
	return typeof value === "string" &&
		(FEEDBACK_CATEGORIES as readonly string[]).includes(value)
		? (value as FeedbackCategory)
		: null;
}

function readSeverity(value: unknown): FeedbackSeverity | null {
	return typeof value === "string" &&
		(FEEDBACK_SEVERITIES as readonly string[]).includes(value)
		? (value as FeedbackSeverity)
		: null;
}

export async function POST(request: Request) {
	let resolution: Awaited<ReturnType<typeof requireResolvedDashboardSession>>;
	try {
		resolution = await requireResolvedDashboardSession();
	} catch {
		return NextResponse.json(
			{ message: "Sign in to report an issue." },
			{ status: 401 },
		);
	}

	const body = (await request
		.json()
		.catch(() => null)) as FeedbackPayload | null;
	const category = readCategory(body?.category);
	const severity = readSeverity(body?.severity);
	if (!category) {
		return NextResponse.json(
			{ message: "Select a valid category." },
			{ status: 400 },
		);
	}
	if (!severity) {
		return NextResponse.json(
			{ message: "Select a valid severity." },
			{ status: 400 },
		);
	}

	try {
		const report = createProductReport({
			actor: getPlatformActorSnapshot(resolution),
			browserMetadata: readMetadata(body?.browserMetadata),
			category,
			currentRoute:
				readText(body?.currentRoute) || hrefFor("dashboard.overview"),
			description: readText(body?.description),
			severity,
			viewportHeight: readNumber(body?.viewportHeight),
			viewportWidth: readNumber(body?.viewportWidth),
		});
		return NextResponse.json({ message: "Report submitted.", report });
	} catch (error) {
		return NextResponse.json(
			{
				message:
					error instanceof Error
						? error.message
						: "Unable to submit the report.",
			},
			{ status: 400 },
		);
	}
}
