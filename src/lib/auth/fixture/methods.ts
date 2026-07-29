import type { AdapterMethodAvailability } from "../contracts";
import { isPasswordRecoveryAvailable } from "../passwordRecoveryCapability";

const passwordRecoveryAvailable = isPasswordRecoveryAvailable();

export const fixtureAuthMethods: AdapterMethodAvailability = {
	"password-sign-in": { available: true },
	"magic-link-sign-in": {
		available: false,
		reason: "The fixture adapter does not send email.",
	},
	"password-recovery": {
		available: passwordRecoveryAvailable,
		reason: passwordRecoveryAvailable
			? undefined
			: "Configure APP_ORIGIN, PASSWORD_RESET_FROM, and RESEND_API_KEY.",
	},
	"password-update": {
		available: passwordRecoveryAvailable,
		reason: passwordRecoveryAvailable
			? undefined
			: "Configure APP_ORIGIN, PASSWORD_RESET_FROM, and RESEND_API_KEY.",
	},
	"identity-link": {
		available: false,
		reason: "No external identity provider is installed.",
	},
	"identity-unlink": { available: true },
};
