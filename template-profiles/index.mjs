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

export function getProfileVerificationCommands(profile, engine = "prune") {
	if (engine === "assemble") {
		return (
			profile.assembly?.verificationCommands ?? profile.verification.commands
		);
	}
	return profile.verification.commands;
}
