import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
if (!existsSync(resolve(root, "src/app/(site)/(marketing)"))) {
	console.log("Marketing verification passed: marketing is not installed.");
	process.exit(0);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
for (const script of [
	"verify:marketing-sections",
	"verify:site-layout",
	"verify:marketing-media",
]) {
	const result = spawnSync(npmCommand, ["run", script], {
		cwd: root,
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	assert.equal(result.status, 0, `${script} failed.`);
}

console.log("Composed marketing verification passed.");
