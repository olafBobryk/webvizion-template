export type FixtureServiceHealth = {
	label: string;
	message: string;
	status: "available" | "unavailable";
};

export const fixtureServiceHealth = {
	auth: {
		label: "Fixture sign-in",
		message: "Fixture credentials and session storage are available.",
		status: "available",
	},
	platform: {
		label: "Platform fixtures",
		message: "Support and report fixtures are ready for internal review.",
		status: "available",
	},
} satisfies Record<string, FixtureServiceHealth>;

export type FixtureServiceId = keyof typeof fixtureServiceHealth;

export function isFixtureServiceId(value: string): value is FixtureServiceId {
	return value in fixtureServiceHealth;
}
