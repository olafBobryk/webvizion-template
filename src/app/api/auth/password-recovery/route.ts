import { NextResponse } from "next/server";
import { AuthDomainError, toPublicAuthError } from "@/lib/auth/errors";
import { isPasswordRecoveryAvailable } from "@/lib/auth/passwordRecoveryCapability";
import { requestPasswordRecovery } from "@/lib/auth/server";
import { hrefFor } from "@/lib/routes";

function getRecoveryUrl(request: Request) {
	if (!isPasswordRecoveryAvailable()) {
		throw new AuthDomainError("password-recovery-unavailable");
	}
	const origin = process.env.APP_ORIGIN || new URL(request.url).origin;
	return new URL(hrefFor("auth.reset-password"), origin).toString();
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { email?: unknown };
		const recovery = await requestPasswordRecovery({
			email: typeof body.email === "string" ? body.email : "",
			resetUrl: getRecoveryUrl(request),
		});
		return NextResponse.json({
			delivery: recovery.delivery,
			message:
				"If an account matches that email, a password reset link is on its way.",
			previewUrl:
				process.env.NODE_ENV !== "production" && recovery.delivery === "local"
					? recovery.previewUrl
					: undefined,
		});
	} catch (error) {
		const publicError = toPublicAuthError(error);
		return NextResponse.json(publicError, { status: publicError.status });
	}
}
