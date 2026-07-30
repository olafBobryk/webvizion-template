"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
	logout as clearSession,
	fetchSession,
	type OrganizationUpdateInput,
	type SessionUser,
	updateOrganization as updateOrganizationRequest,
	updateSessionUser,
} from "@/lib/api/auth";
import type {
	Organization,
	OrganizationMembership,
} from "@/lib/auth/contracts";
import { hrefFor } from "@/lib/routes";
import {
	DashboardBannedFallback,
	DashboardLoadingFallback,
	DashboardUnauthenticatedFallback,
} from "../pages/DashboardAuthFallbacks";

export type DashboardAuthContextValue = {
	user: SessionUser | null;
	organization: Organization;
	organizationChoices: readonly DashboardOrganizationChoice[];
	membership: OrganizationMembership;
	memberships: readonly OrganizationMembership[];
	initializing: boolean;
	loading: boolean;
	error: Error | null;
	refresh: (options?: { silent?: boolean }) => Promise<void>;
	logout: () => Promise<void>;
	updateOrganization: (patch: OrganizationUpdateInput) => Promise<void>;
	updateUser: (patch: Partial<SessionUser>) => Promise<void>;
};

export type DashboardOrganizationChoice = {
	membership: OrganizationMembership;
	organization: Organization;
};

const DashboardAuthContext =
	React.createContext<DashboardAuthContextValue | null>(null);

function getError(error: unknown) {
	return error instanceof Error
		? error
		: new Error("Unable to resolve the dashboard session.");
}

export function DashboardAuthProvider({
	children,
	initialMembership,
	initialMemberships,
	initialOrganization,
	initialOrganizationChoices,
	initialUser,
}: {
	children: React.ReactNode;
	initialMembership: OrganizationMembership;
	initialMemberships: readonly OrganizationMembership[];
	initialOrganization: Organization;
	initialOrganizationChoices: readonly DashboardOrganizationChoice[];
	initialUser: SessionUser;
}) {
	const router = useRouter();
	const [user, setUser] = React.useState<SessionUser | null>(initialUser);
	const [organization, setOrganization] =
		React.useState<Organization>(initialOrganization);
	const [organizationChoices, setOrganizationChoices] = React.useState<
		readonly DashboardOrganizationChoice[]
	>(initialOrganizationChoices);
	const [initializing] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<Error | null>(null);

	const refresh = React.useCallback(async (options?: { silent?: boolean }) => {
		const silent = options?.silent ?? false;
		if (!silent) {
			setLoading(true);
		}
		setError(null);

		try {
			const response = await fetchSession();
			setUser(response.user);
		} catch (nextError) {
			setUser(null);
			setError(getError(nextError));
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	}, []);

	const logout = React.useCallback(async () => {
		setLoading(true);
		try {
			await clearSession();
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	const updateUser = React.useCallback(
		async (patch: Partial<SessionUser>) => {
			const nextUser = await updateSessionUser(patch);
			setUser(nextUser);
			router.refresh();
		},
		[router],
	);

	const updateOrganization = React.useCallback(
		async (patch: OrganizationUpdateInput) => {
			const nextOrganization = await updateOrganizationRequest(patch);
			setOrganization(nextOrganization);
			setOrganizationChoices((current) =>
				current.map((choice) =>
					choice.organization.id === nextOrganization.id
						? { ...choice, organization: nextOrganization }
						: choice,
				),
			);
			router.refresh();
		},
		[router],
	);

	React.useEffect(() => {
		setOrganization(initialOrganization);
	}, [initialOrganization]);

	React.useEffect(() => {
		setOrganizationChoices(initialOrganizationChoices);
	}, [initialOrganizationChoices]);

	return (
		<DashboardAuthContext.Provider
			value={{
				user,
				organization,
				organizationChoices,
				membership: initialMembership,
				memberships: initialMemberships,
				initializing,
				loading,
				error,
				refresh,
				logout,
				updateOrganization,
				updateUser,
			}}
		>
			{children}
		</DashboardAuthContext.Provider>
	);
}

export function useDashboardAuth() {
	const context = React.useContext(DashboardAuthContext);
	if (!context) {
		throw new Error(
			"useDashboardAuth must be used within DashboardAuthProvider.",
		);
	}
	return context;
}

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { user, initializing } = useDashboardAuth();

	React.useEffect(() => {
		if (!initializing && !user) {
			router.replace(hrefFor("auth.login"));
		}
	}, [initializing, router, user]);

	if (initializing) {
		return <DashboardLoadingFallback />;
	}

	if (!user) {
		return <DashboardUnauthenticatedFallback />;
	}

	if (user.isBanned) {
		return <DashboardBannedFallback />;
	}

	return <>{children}</>;
}
