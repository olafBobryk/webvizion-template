import "server-only";

import { randomUUID } from "node:crypto";
import { hrefFor } from "@/lib/routes";
import type {
	CreateProductReportInput,
	CreateSupportRequestInput,
	ProductReport,
	SupportRequest,
	UpdateProductReportInput,
	UpdateSupportRequestInput,
} from "./contracts";
import { resolveFeedbackStatus, resolveSupportRequestStatus } from "./status";

type PlatformFixtureState = {
	reports: Map<string, ProductReport>;
	supportRequests: Map<string, SupportRequest>;
};

const fixtureStateKey = Symbol.for("averlo.platform.fixture-state");
const fixtureGlobal = globalThis as typeof globalThis & {
	[fixtureStateKey]?: PlatformFixtureState;
};

const operatorActor = {
	email: "operator@averlo.local",
	membershipId: "membership-template-owner",
	name: "Template Operator",
	organizationId: "org-demo",
	organizationName: "Demo organization",
	organizationProfilePictureUrl: null,
	organizationSlug: "demo",
	profilePictureUrl: null,
	role: "owner",
	userId: "user-template-owner",
} as const;

const reviewerActor = {
	email: "multi@averlo.local",
	membershipId: "membership-multi-sandbox",
	name: "Multi-org Reviewer",
	organizationId: "org-sandbox",
	organizationName: "Product sandbox",
	organizationProfilePictureUrl: null,
	organizationSlug: "sandbox",
	profilePictureUrl: null,
	role: "owner",
	userId: "user-multi-org",
} as const;

function createInitialState(): PlatformFixtureState {
	const supportRequests: SupportRequest[] = [
		{
			...reviewerActor,
			createdAt: "2026-07-21T09:20:00.000Z",
			id: "support-demo-onboarding",
			internalNote: null,
			message:
				"The organization switcher is clear, but I need help deciding which workspace should own our production records.",
			status: "new",
			subject: "Production workspace guidance",
			updatedAt: "2026-07-21T09:20:00.000Z",
		},
		{
			...operatorActor,
			createdAt: "2026-07-18T14:40:00.000Z",
			id: "support-demo-accessibility",
			internalNote:
				"Shared the keyboard-navigation reference and follow-up steps.",
			message:
				"Can you confirm the recommended keyboard workflow for the command menu and record actions?",
			status: "in_progress",
			subject: "Keyboard workflow question",
			updatedAt: "2026-07-19T08:15:00.000Z",
		},
	];
	const reports: ProductReport[] = [
		{
			...operatorActor,
			browserMetadata: {
				language: "en-GB",
				platform: "MacIntel",
				userAgent: "Averlo fixture browser",
			},
			category: "ux_issue",
			createdAt: "2026-07-21T11:05:00.000Z",
			currentRoute: "/dashboard/organization/members",
			description:
				"The action column remains visible, but the middle columns disappear too late in a constrained card.",
			id: "report-demo-responsive-table",
			severity: "normal",
			status: "triaged",
			triageNote:
				"Reproduce at the tablet breakpoint with the constrained table demo.",
			updatedAt: "2026-07-21T12:10:00.000Z",
			viewportHeight: 900,
			viewportWidth: 820,
		},
		{
			...reviewerActor,
			browserMetadata: { language: "en-US", platform: "iPhone" },
			category: "bug",
			createdAt: "2026-07-20T16:30:00.000Z",
			currentRoute: hrefFor("dashboard.settings"),
			description:
				"The profile modal close action briefly became available while the save request was pending.",
			id: "report-demo-modal-lock",
			severity: "high",
			status: "new",
			triageNote: null,
			updatedAt: "2026-07-20T16:30:00.000Z",
			viewportHeight: 844,
			viewportWidth: 390,
		},
	];
	return {
		reports: new Map(reports.map((report) => [report.id, report])),
		supportRequests: new Map(
			supportRequests.map((request) => [request.id, request]),
		),
	};
}

function getState() {
	fixtureGlobal[fixtureStateKey] ??= createInitialState();
	return fixtureGlobal[fixtureStateKey];
}

function normalizeNullableText(value?: string | null) {
	return value?.trim() || null;
}

function cloneSupportRequest(request: SupportRequest) {
	return { ...request };
}

function cloneProductReport(report: ProductReport) {
	return { ...report, browserMetadata: { ...report.browserMetadata } };
}

export function resetPlatformFixtureState() {
	fixtureGlobal[fixtureStateKey] = createInitialState();
}

export function listSupportRequests() {
	return [...getState().supportRequests.values()]
		.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
		.map(cloneSupportRequest);
}

export function getSupportRequest(id: string) {
	const request = getState().supportRequests.get(id);
	return request ? cloneSupportRequest(request) : null;
}

export function createSupportRequest(input: CreateSupportRequestInput) {
	const subject = input.subject.trim();
	const message = input.message.trim();
	if (subject.length < 2 || subject.length > 120) {
		throw new Error("Enter a subject between 2 and 120 characters.");
	}
	if (message.length < 10 || message.length > 4_000) {
		throw new Error("Enter a message between 10 and 4,000 characters.");
	}
	const now = new Date().toISOString();
	const request: SupportRequest = {
		...input.actor,
		createdAt: now,
		id: `support-${randomUUID()}`,
		internalNote: null,
		message,
		status: "new",
		subject,
		updatedAt: now,
	};
	getState().supportRequests.set(request.id, request);
	return cloneSupportRequest(request);
}

export function updateSupportRequest(
	id: string,
	input: UpdateSupportRequestInput,
) {
	const current = getState().supportRequests.get(id);
	if (!current) return null;
	const internalNote = Object.hasOwn(input, "internalNote")
		? normalizeNullableText(input.internalNote)
		: current.internalNote;
	const status = resolveSupportRequestStatus({
		currentStatus: current.status,
		internalNote,
		requestedStatus: input.status,
	});
	const next: SupportRequest = {
		...current,
		internalNote,
		status,
		updatedAt: new Date().toISOString(),
	};
	getState().supportRequests.set(id, next);
	return cloneSupportRequest(next);
}

export function listProductReports() {
	return [...getState().reports.values()]
		.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
		.map(cloneProductReport);
}

export function getProductReport(id: string) {
	const report = getState().reports.get(id);
	return report ? cloneProductReport(report) : null;
}

export function createProductReport(input: CreateProductReportInput) {
	const description = input.description.trim();
	if (description.length < 10 || description.length > 5_000) {
		throw new Error("Enter a description between 10 and 5,000 characters.");
	}
	const routeCandidate = input.currentRoute.trim();
	const currentRoute =
		routeCandidate.startsWith("/") && !routeCandidate.startsWith("//")
			? routeCandidate
			: hrefFor("dashboard.overview");
	const now = new Date().toISOString();
	const report: ProductReport = {
		...input.actor,
		browserMetadata: { ...(input.browserMetadata ?? {}) },
		category: input.category,
		createdAt: now,
		currentRoute,
		description,
		id: `report-${randomUUID()}`,
		severity: input.severity,
		status: "new",
		triageNote: null,
		updatedAt: now,
		viewportHeight: input.viewportHeight ?? null,
		viewportWidth: input.viewportWidth ?? null,
	};
	getState().reports.set(report.id, report);
	return cloneProductReport(report);
}

export function updateProductReport(
	id: string,
	input: UpdateProductReportInput,
) {
	const current = getState().reports.get(id);
	if (!current) return null;
	const triageNote = Object.hasOwn(input, "triageNote")
		? normalizeNullableText(input.triageNote)
		: current.triageNote;
	const status = resolveFeedbackStatus({
		currentStatus: current.status,
		requestedStatus: input.status,
		triageNote,
	});
	const next: ProductReport = {
		...current,
		status,
		triageNote,
		updatedAt: new Date().toISOString(),
	};
	getState().reports.set(id, next);
	return cloneProductReport(next);
}
