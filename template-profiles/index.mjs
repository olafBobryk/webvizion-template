import appOnlyProfile from "./app-only/manifest.mjs";
import fullProfile from "./full/manifest.mjs";
import marketingOnlyProfile from "./marketing-only/manifest.mjs";
import thinStartProfile from "./thin-start/manifest.mjs";

export const templateProfiles = {
	[fullProfile.id]: fullProfile,
	[appOnlyProfile.id]: appOnlyProfile,
	[marketingOnlyProfile.id]: marketingOnlyProfile,
	[thinStartProfile.id]: thinStartProfile,
};

export function getTemplateProfile(id) {
	const profile = templateProfiles[id];
	if (!profile) {
		throw new Error(
			`Unknown template profile: ${id}. Choose one of ${Object.keys(templateProfiles).join(", ")}.`,
		);
	}
	return profile;
}

export function getProfileContentMode(profile, requestedContent) {
	const content = requestedContent ?? profile.content.default;
	if (!profile.content.supported.includes(content)) {
		throw new Error(
			`Profile ${profile.id} does not support ${content} content. Choose one of ${profile.content.supported.join(", ")}.`,
		);
	}
	return content;
}

export function getProfileVerificationCommands(profile) {
	return (
		profile.assembly?.verificationCommands ?? profile.verification.commands
	);
}
