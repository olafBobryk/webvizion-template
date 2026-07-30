"use server";

import { redirect } from "next/navigation";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "@/lib/auth/continuation";
import { AuthDomainError, toPublicAuthError } from "@/lib/auth/errors";
import {
	applicationAdapters,
	assertAuthMethodAvailable,
	readSessionId,
	resolveCurrentSession,
	selectCurrentOrganization,
	signInWithFixturePassword,
} from "@/lib/auth/server";
import { hrefFor, surfaceHref } from "@/lib/routes";

function readFormString(formData: FormData, name: string) {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : "";
}

function authRedirect(path: string, next: string, message: string) {
	const url = new URL(path, "https://template.local");
	url.searchParams.set("next", next);
	url.searchParams.set("message", message);
	return `${url.pathname}${url.search}`;
}

function redirectAfterSignIn(
	resolution: Awaited<ReturnType<typeof signInWithFixturePassword>>,
	next: string,
): never {
	if (resolution.status === "organization-selection-required") {
		redirect(withSafeContinuation(hrefFor("auth.select-organization"), next));
	}
	if (resolution.status === "membership-required") {
		if (next.startsWith(hrefFor("auth.invitation"))) redirect(next);
		redirect(authRedirect(hrefFor("auth.login"), next, "membership-required"));
	}
	redirect(next);
}

export async function signInAction(formData: FormData) {
	const next = getSafeContinuationPath(readFormString(formData, "next"));
	try {
		const resolution = await signInWithFixturePassword({
			email: readFormString(formData, "email"),
			password: readFormString(formData, "password"),
		});
		redirectAfterSignIn(resolution, next);
	} catch (error) {
		if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}
		const publicError = toPublicAuthError(error);
		redirect(authRedirect(hrefFor("auth.login"), next, publicError.code));
	}
}

export async function enterDemoAction(formData: FormData) {
	const next = getSafeContinuationPath(readFormString(formData, "next"));
	const resolution = await signInWithFixturePassword({
		email: "operator@averlo.local",
		password: "demo-password",
	});
	redirectAfterSignIn(resolution, next);
}

export async function requestUnavailableAuthMethodAction(formData: FormData) {
	const next = getSafeContinuationPath(readFormString(formData, "next"));
	const method = readFormString(formData, "method");
	try {
		if (
			method !== "magic-link-sign-in" &&
			method !== "password-recovery" &&
			method !== "password-update"
		) {
			throw new AuthDomainError("adapter-method-unavailable");
		}
		assertAuthMethodAvailable(method);
		throw new AuthDomainError("adapter-method-unavailable");
	} catch (error) {
		const publicError = toPublicAuthError(error);
		const returnTo =
			readFormString(formData, "returnTo") || hrefFor("auth.login");
		redirect(authRedirect(returnTo, next, publicError.code));
	}
}

export async function selectOrganizationAction(formData: FormData) {
	const next = getSafeContinuationPath(readFormString(formData, "next"));
	try {
		await selectCurrentOrganization(readFormString(formData, "organizationId"));
		redirect(next);
	} catch (error) {
		if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}
		const publicError = toPublicAuthError(error);
		redirect(
			authRedirect(hrefFor("auth.select-organization"), next, publicError.code),
		);
	}
}

export async function acceptInvitationAction(formData: FormData) {
	const invitationId = readFormString(formData, "invitation");
	const tokenHash = readFormString(formData, "token");
	const next = getSafeContinuationPath(readFormString(formData, "next"));
	const invitationPath = surfaceHref(
		"auth.invitation",
		{},
		{
			search: { invitation: invitationId, next, token: tokenHash },
		},
	);
	const resolution = await resolveCurrentSession();
	if (resolution.status === "anonymous") {
		redirect(withSafeContinuation(hrefFor("auth.login"), invitationPath));
	}

	try {
		await applicationAdapters.invitations.acceptInvitation({
			invitationId,
			tokenHash,
			userId: resolution.user.id,
		});
		const sessionId = await readSessionId();
		if (sessionId) {
			const refreshed =
				await applicationAdapters.organizations.resolveSession(sessionId);
			if (refreshed.status === "organization-selection-required") {
				redirect(
					withSafeContinuation(hrefFor("auth.select-organization"), next),
				);
			}
		}
		redirect(next);
	} catch (error) {
		if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}
		const publicError = toPublicAuthError(error);
		redirect(`${invitationPath}&message=${publicError.code}`);
	}
}
