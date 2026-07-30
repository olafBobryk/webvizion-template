"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icons/Icon";
import { ProfilePicture } from "@/components/ui/misc";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { hrefFor } from "@/lib/routes";
import { getAccountPresentation } from "../../_lib/entities/account/presentation";
import { AccountIdentity } from "../entities/account/AccountIdentity";
import { useDashboardAuth } from "../providers/DashboardAuthProvider";

export function DashboardAccountMenu() {
	const router = useRouter();
	const { loading, logout, membership, organization, user } =
		useDashboardAuth();
	if (!user) return null;
	const accountPresentation = getAccountPresentation({
		membership,
		organization,
		user,
	});

	async function handleSignOut() {
		await logout();
		router.replace(hrefFor("auth.login"));
		router.refresh();
	}

	return (
		<Dropdown.Menu
			align="end"
			ariaLabel="Open account menu"
			menuWidth={290}
			openOnHover={false}
			pinOnClick
			positionStrategy="fixed"
			options={[
				{
					id: "account",
					href: accountPresentation.profileHref,
					label: (
						<AccountIdentity
							presentation={accountPresentation}
							variant="compact"
						/>
					),
					dividerAfter: true,
					layout: "presentation",
				},
				{
					href: hrefFor("dashboard.settings"),
					id: "account-settings",
					label: "Account settings",
					leadingIcon: <Icon name="gear" size="sm" />,
				},
				{
					href: hrefFor("dashboard.organization"),
					id: "organization",
					label: "Organization",
					leadingIcon: <Icon name="building" size="sm" />,
				},
				{
					id: "sign-out",
					label: loading ? "Signing out…" : "Sign out",
					leadingIcon: <Icon name="log-out" size="sm" />,
					onSelect: () => void handleSignOut(),
					tone: "danger",
				},
			]}
			triggerButtonProps={{
				className: "!size-10 !rounded-full !p-0",
				size: "icon-sm",
				variant: "ghost",
			}}
			triggerContent={
				<ProfilePicture
					name={user.name}
					size="sm"
					src={user.profilePictureUrl}
				/>
			}
		/>
	);
}
