import {
	defineRouteSurfaceRegistry,
	matchesRouteSurface,
} from "@/lib/surfaces/routeSurface";

export const authSurfaceRegistry = defineRouteSurfaceRegistry([
	{
		description: "Sign in to continue to your dashboard.",
		family: "auth",
		href: "/login",
		id: "auth.login",
		label: "Sign in",
		match: "exact",
	},
	{
		description: "Enter your email address to receive a sign-in link.",
		family: "auth",
		href: "/sign-in-options",
		id: "auth.sign-in-options",
		label: "Magic link",
		match: "exact",
	},
	{
		description: "Enter your email to receive a password reset link.",
		family: "auth",
		href: "/forgot-password",
		id: "auth.forgot-password",
		label: "Reset your password",
		match: "exact",
	},
	{
		description: "Choose a new password for your account.",
		family: "auth",
		href: "/reset-password",
		id: "auth.reset-password",
		label: "Choose a new password",
		match: "exact",
	},
	{
		description: "Choose a password to finish setting up your account.",
		family: "auth",
		href: "/set-password",
		id: "auth.set-password",
		label: "Finish account setup",
		match: "exact",
	},
	{
		description: "Review this invitation before joining the organization.",
		family: "auth",
		href: "/invitation",
		id: "auth.invitation",
		label: "Review invitation",
		match: "exact",
	},
	{
		description: "Choose an organization to continue.",
		family: "auth",
		href: "/select-organization",
		id: "auth.select-organization",
		label: "Choose an organization",
		match: "exact",
	},
] as const);

export type AuthSurface = (typeof authSurfaceRegistry)[number];
export type AuthSurfaceId = AuthSurface["id"];

export function getAuthSurface(pathname: string) {
	return (
		authSurfaceRegistry.find((surface) =>
			matchesRouteSurface(pathname, surface),
		) ?? null
	);
}
