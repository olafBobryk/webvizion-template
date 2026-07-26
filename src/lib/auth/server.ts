import "server-only";

import { cookies } from "next/headers";
import type { AuthMethod, SessionResolution } from "./contracts";
import { AuthDomainError } from "./errors";
import { fixtureAdapters } from "./fixture-adapter";

export const sessionCookieName = "averlo_fixture_session";
export const applicationAdapters = fixtureAdapters;

const cookieOptions = {
	httpOnly: true,
	sameSite: "lax" as const,
	secure: process.env.NODE_ENV === "production",
	path: "/",
	maxAge: 8 * 60 * 60,
};

export async function readSessionId() {
	return (await cookies()).get(sessionCookieName)?.value ?? null;
}

export async function writeSessionId(sessionId: string) {
	(await cookies()).set(sessionCookieName, sessionId, cookieOptions);
}

export async function clearSessionId() {
	(await cookies()).set(sessionCookieName, "", {
		...cookieOptions,
		maxAge: 0,
	});
}

export async function resolveCurrentSession(): Promise<SessionResolution> {
	return applicationAdapters.organizations.resolveSession(
		await readSessionId(),
	);
}

export async function signInWithFixturePassword(input: {
	email: string;
	password: string;
}) {
	assertAuthMethodAvailable("password-sign-in");
	const user = await applicationAdapters.auth.authenticatePassword(input);
	const session = await applicationAdapters.auth.createSession(user.id);
	await writeSessionId(session.id);
	return applicationAdapters.organizations.resolveSession(session.id);
}

export async function signOutCurrentSession() {
	const sessionId = await readSessionId();
	if (sessionId) await applicationAdapters.auth.deleteSession(sessionId);
	await clearSessionId();
}

export async function requestPasswordRecovery(input: {
	email: string;
	resetUrl: string;
}) {
	assertAuthMethodAvailable("password-recovery");
	return applicationAdapters.auth.requestPasswordRecovery(input);
}

export async function resetPasswordWithRecovery(input: {
	password: string;
	token: string;
}) {
	assertAuthMethodAvailable("password-update");
	return applicationAdapters.auth.resetPassword(input);
}

export async function validatePasswordRecoveryToken(input: { token: string }) {
	assertAuthMethodAvailable("password-update");
	return applicationAdapters.auth.validatePasswordRecoveryToken(input);
}

export function assertAuthMethodAvailable(method: AuthMethod) {
	const state = applicationAdapters.auth.methods[method];
	if (!state.available) {
		throw new AuthDomainError("adapter-method-unavailable", state.reason);
	}
}

export async function selectCurrentOrganization(organizationId: string) {
	const sessionId = await readSessionId();
	if (!sessionId) throw new AuthDomainError("session-required");
	const resolution = await applicationAdapters.organizations.selectOrganization(
		sessionId,
		organizationId,
	);
	await writeSessionId(resolution.session.id);
	return resolution;
}
