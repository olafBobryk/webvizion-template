#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = await fs.realpath(process.cwd());
const metadataPath = path.join(root, ".codex", "preview.json");

try {
	const existing = JSON.parse(await fs.readFile(metadataPath, "utf8"));
	throw new Error(
		`Refusing to replace existing preview metadata for pid ${existing.pid ?? "unknown"}. Stop that preview before running this verifier.`,
	);
} catch (error) {
	if (error?.code !== "ENOENT") throw error;
}

const wrapper = spawn(
	process.execPath,
	[path.join(root, "scripts", "dev-server.mjs"), "preview", "--random"],
	{
		cwd: root,
		detached: true,
		stdio: ["ignore", "ignore", "inherit"],
	},
);

let previewPid;
try {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		try {
			const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
			previewPid = metadata.pid;
			break;
		} catch (error) {
			if (error?.code !== "ENOENT") throw error;
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	assert.ok(Number.isInteger(previewPid), "Preview metadata was not written.");

	const exited = once(wrapper, "exit");
	process.kill(-wrapper.pid, "SIGINT");
	const [code, signal] = await exited;
	assert.equal(code, 130);
	assert.equal(signal, null);

	await assert.rejects(fs.access(metadataPath), { code: "ENOENT" });
	for (let attempt = 0; attempt < 50; attempt += 1) {
		try {
			process.kill(previewPid, 0);
		} catch (error) {
			if (error?.code === "ESRCH") {
				previewPid = null;
				break;
			}
			throw error;
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	assert.equal(
		previewPid,
		null,
		"The preview child survived wrapper shutdown.",
	);
} finally {
	if (wrapper.exitCode === null && wrapper.signalCode === null) {
		wrapper.kill("SIGTERM");
		await once(wrapper, "exit");
	}
	await fs.rm(metadataPath, { force: true });
}

console.log("Dev server shutdown verification passed.");
