import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) =>
	readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const readIfPresent = (path) => {
	const url = new URL(`../../${path}`, import.meta.url);
	return existsSync(url) ? readFileSync(url, "utf8") : null;
};

const modalShell = read("src/components/ui/overlays/modal/ModalShell.tsx");
const modalCard = read("src/components/ui/overlays/modal/ModalCard.tsx");
const modalHost = read("src/components/ui/overlays/modal/ModalHost.tsx");
const modalContract = read("src/lib/modal.ts");
const commandSurface = readIfPresent(
	"src/app/(site)/dashboard/_components/commands/DashboardCommandProvider.tsx",
);
const confirmation = read(
	"src/components/ui/overlays/modal/ConfirmationModal.tsx",
);
const imageInspect = read(
	"src/components/ui/overlays/modal/ImageInspectModal.tsx",
);
const fileInspect = readIfPresent(
	"src/components/ui/input/files/FileInspectModal.tsx",
);
const thinShell = readIfPresent(
	"template-profiles/thin-start/overrides/src/components/ui/overlays/modal/ModalShell.tsx",
);

assert.doesNotMatch(modalShell, /from "@\/components\/ui\/primitives\/Panel"/);
assert.doesNotMatch(modalShell, /<Panel\b/);
assert.match(modalShell, /data-modal-shell=""/);
assert.match(modalCard, /<Card\b/);
assert.match(modalCard, /gap="none"/);
assert.match(modalCard, /padding="none"/);
assert.match(
	modalHost,
	/<ModalShell[\s\S]*?<ModalCard \{\.\.\.options\?\.cardProps\}>/,
);
assert.match(modalHost, /modalHostBaseLayerIndex \+ index \* 10/);
assert.match(modalContract, /cardProps\?: Omit<ModalCardProps, "children">/);
assert.match(modalContract, /placement\?: "center" \| "top"/);

for (const removedEscapeHatch of [
	"panelClassName",
	"panelWrapperClassName",
	"panelStyle",
	"backdropClassName",
]) {
	assert.doesNotMatch(modalContract, new RegExp(removedEscapeHatch));
}

if (commandSurface)
	assert.match(commandSurface, /<ModalShell[\s\S]*?<ModalCard/);
for (const resource of [confirmation, imageInspect, fileInspect].filter(
	Boolean,
)) {
	assert.match(resource, /<ModalHeader/);
	assert.match(resource, /<ModalContent/);
	assert.match(resource, /<ModalFooter/);
}

if (thinShell) {
	assert.doesNotMatch(thinShell, /<Panel\b/);
	assert.match(thinShell, /data-modal-shell=""/);
	assert.match(thinShell, /ModalHeader/);
	assert.match(thinShell, /ModalContent/);
	assert.match(thinShell, /ModalFooter/);
}

console.log("Modal system verification passed.");
