import { defineRouteSurfaceRegistry } from "@/lib/surfaces/routeSurface";

export const authSurfaceRegistry = defineRouteSurfaceRegistry([
	{ family: "auth", href: "/login", id: "auth.login", match: "exact" },
	{
		family: "auth",
		href: "/sign-in-options",
		id: "auth.sign-in-options",
		match: "exact",
	},
	{
		family: "auth",
		href: "/forgot-password",
		id: "auth.forgot-password",
		match: "exact",
	},
	{
		family: "auth",
		href: "/reset-password",
		id: "auth.reset-password",
		match: "exact",
	},
	{
		family: "auth",
		href: "/set-password",
		id: "auth.set-password",
		match: "exact",
	},
	{
		family: "auth",
		href: "/invitation",
		id: "auth.invitation",
		match: "exact",
	},
	{
		family: "auth",
		href: "/select-organization",
		id: "auth.select-organization",
		match: "exact",
	},
] as const);

export type AuthSurface = (typeof authSurfaceRegistry)[number];
export type AuthSurfaceId = AuthSurface["id"];
