export const dashboardDebugStates = [
	"loading",
	"empty",
	"error",
	"unavailable",
	"not-found",
] as const;

export type DashboardDebugState = (typeof dashboardDebugStates)[number];

export function isDashboardDebugState(
	value: string | null,
): value is DashboardDebugState {
	return dashboardDebugStates.includes(value as DashboardDebugState);
}
