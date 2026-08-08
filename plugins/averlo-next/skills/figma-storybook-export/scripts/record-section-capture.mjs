#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

function parseArgs(argv) {
	const options = {
		root: process.cwd(),
		state: null,
		section: null,
		storyId: null,
		signature: null,
		frameId: null,
		captureId: null,
		captureHeight: null,
		screenshot: null,
		validation: "complete",
	};
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--root") options.root = argv[++index];
		else if (argv[index] === "--state") options.state = argv[++index];
		else if (argv[index] === "--section") options.section = argv[++index];
		else if (argv[index] === "--story-id") options.storyId = argv[++index];
		else if (argv[index] === "--signature") options.signature = argv[++index];
		else if (argv[index] === "--frame-id") options.frameId = argv[++index];
		else if (argv[index] === "--capture-id") options.captureId = argv[++index];
		else if (argv[index] === "--capture-height")
			options.captureHeight = Number(argv[++index]);
		else if (argv[index] === "--screenshot") options.screenshot = argv[++index];
		else if (argv[index] === "--validation") options.validation = argv[++index];
		else throw new Error("Unknown argument: " + argv[index]);
	}
	return options;
}

const options = parseArgs(process.argv.slice(2));
if (
	!options.section ||
	!options.storyId ||
	!options.signature ||
	!options.frameId ||
	!options.captureId ||
	!Number.isFinite(options.captureHeight) ||
	!options.screenshot
) {
	throw new Error(
		"--section, --story-id, --signature, --frame-id, --capture-id, --capture-height, and --screenshot are required",
	);
}
const statePath = resolve(
	options.state ??
		join(options.root, ".codex", "tmp", "figma-storybook-export", "state.json"),
);
if (!existsSync(statePath)) throw new Error("State not found: " + statePath);
const state = JSON.parse(readFileSync(statePath, "utf8"));
if (state.schemaVersion !== 3 || state.strategy !== "storybook-section-capture")
	throw new Error(
		"State must use schemaVersion 3 and the section-capture strategy",
	);
const section = state.sections?.[options.section];
if (!section) throw new Error("Section not found in state: " + options.section);
const now = new Date().toISOString();
Object.assign(section, {
	storyId: options.storyId,
	contentSignature: options.signature,
	frameId: options.frameId,
	captureRootId: options.captureId,
	captureHeight: options.captureHeight,
	validationScreenshot: options.screenshot,
	status: options.validation === "complete" ? "validated" : "captured",
	capturedAt: now,
	validatedAt: options.validation === "complete" ? now : null,
});
const complete = Object.values(state.sections).every(
	(entry) => entry.status === "validated",
);
state.pipeline.lastSyncAt = now;
state.verification = {
	...(state.verification ?? {}),
	status: complete ? "complete" : "pending",
	validatedAt: complete ? now : null,
};
writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
process.stdout.write(
	JSON.stringify({
		statePath,
		section: options.section,
		frameId: options.frameId,
		captureRootId: options.captureId,
		status: section.status,
	}) + "\n",
);
