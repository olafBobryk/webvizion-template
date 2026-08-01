"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ProfilePicture, ProfilePictureStack } from "./ProfilePicture";

function CatalogPreview1() {
	const render = () => (
		<div className="flex items-end gap-3">
			<ProfilePicture
				name="Ada Lovelace"
				size="sm"
				src="/test/placeholder-portrait.jpg"
			/>
			<ProfilePicture
				fallback="?"
				alt="Unknown profile"
				size="lg"
				tone="neutral"
			/>
			<ProfilePicture
				alt="Organization"
				fallback={<Icon name="building" size="sm" />}
				size="md"
			/>
			<ProfilePicture.Skeleton size="xl" />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<ProfilePictureStack
			ariaLabel="Project members"
			maxVisible={2}
			items={[
				{ id: "ada", name: "Ada Lovelace" },
				{ id: "grace", name: "Grace Hopper" },
				{ id: "alan", name: "Alan Turing" },
				{ id: "katherine", name: "Katherine Johnson" },
			]}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-profile-picture",
	name: "ProfilePicture",
	role: "Canonical avatar image, text or child fallback, loading placeholder, and overlapping group owner.",
	importStatement:
		'import { ProfilePicture, ProfilePictureStack } from "@/components/ui/misc";',
	chooseWhen: ["A person or entity needs stable shared avatar geometry."],
	chooseInstead: [
		"Use a domain entity card when identity requires additional metadata or actions.",
	],
	compounds: [
		"ProfilePicture.Skeleton",
		"ProfilePictureStack",
		"ProfilePictureStack.Skeleton",
	],
	exclusions: ["Local avatar size maps, rings, shadows, or overlap geometry."],
	guarantees: [
		{
			label: "Image, text, child, and loading fallbacks",
			storyId: "ui-misc-profile-picture--fallback-contract",
		},
		{
			label: "Stack labeling and overflow",
			storyId: "ui-misc-profile-picture--stack-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "fallback-contract",
			name: "Image, text, child, and loading fallbacks",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "stack-contract",
			name: "Stack labeling and overflow",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
