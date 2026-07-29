import { createHash, randomBytes } from "node:crypto";
import { AuthDomainError } from "../errors";
import { deleteFixtureSession } from "./sessions";
import {
	type FixtureAuthState,
	type FixturePasswordRecovery,
	fixtureNowIso,
} from "./state";

const passwordRecoveryLifetimeMs = 30 * 60 * 1000;

function hashFixtureRecoveryToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}

export function requestFixturePasswordRecovery(
	state: FixtureAuthState,
	input: { email: string; resetUrl: string },
	now = new Date(),
) {
	const email = input.email.trim().toLowerCase();
	const user = [...state.users.values()].find(
		(candidate) => candidate.email.toLowerCase() === email,
	);
	if (!user) return null;

	const token = randomBytes(32).toString("base64url");
	const resetUrl = new URL(input.resetUrl);
	resetUrl.searchParams.set("token", token);
	const tokenHash = hashFixtureRecoveryToken(token);
	const recovery: FixturePasswordRecovery = {
		email: user.email,
		expiresAt: fixtureNowIso(
			new Date(now.getTime() + passwordRecoveryLifetimeMs),
		),
		resetUrl: resetUrl.toString(),
		tokenHash,
		userId: user.id,
	};

	state.passwordRecoveries.set(tokenHash, recovery);
	state.recoveryOutbox.push({
		createdAt: fixtureNowIso(now),
		email: user.email,
		resetUrl: recovery.resetUrl,
	});
	return { ...recovery };
}

export function resetFixturePassword(
	state: FixtureAuthState,
	input: { password: string; token: string },
	now = new Date(),
) {
	const { recovery, tokenHash } = readFixturePasswordRecovery(
		state,
		input.token,
		now,
	);

	const credential = state.credentials.find(
		(candidate) => candidate.userId === recovery.userId,
	);
	if (!credential) throw new AuthDomainError("password-recovery-invalid");
	credential.password = input.password;
	state.passwordRecoveries.delete(tokenHash);
	for (const [sessionId, session] of state.sessions) {
		if (session.userId === recovery.userId) {
			deleteFixtureSession(state, sessionId);
		}
	}
}

export function validateFixturePasswordRecoveryToken(
	state: FixtureAuthState,
	input: { token: string },
	now = new Date(),
) {
	readFixturePasswordRecovery(state, input.token, now);
}

function readFixturePasswordRecovery(
	state: FixtureAuthState,
	token: string,
	now: Date,
) {
	const tokenHash = hashFixtureRecoveryToken(token);
	const recovery = state.passwordRecoveries.get(tokenHash);
	if (!recovery) throw new AuthDomainError("password-recovery-invalid");
	if (new Date(recovery.expiresAt).getTime() <= now.getTime()) {
		state.passwordRecoveries.delete(tokenHash);
		throw new AuthDomainError("password-recovery-expired");
	}
	return { recovery, tokenHash };
}
