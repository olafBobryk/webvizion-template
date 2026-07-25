#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { thinStartProfile } from "../../template-profiles/thin-start/manifest.mjs";
import { templateSurfaces } from "../../template-surfaces/index.mjs";

const root = process.cwd();
assert.equal(
	templateSurfaces.dashboardReferenceEntities.id,
	"dashboard.reference-entities",
);
assert.equal(
	templateSurfaces.dashboardReferenceEntities.flag,
	"--no-dashboard-reference-entities",
);
assert.equal(templateSurfaces.marketing.flag, "--no-marketing");
assert.ok(thinStartProfile.surfaces.remove.includes("dashboard"));
assert.ok(
	thinStartProfile.surfaces.remove.includes("dashboard.reference-entities"),
);
assert.ok(
	thinStartProfile.packageChanges.scripts.remove.includes(
		"verify:frontend-entities",
	),
);
assert.ok(
	thinStartProfile.packageChanges.scripts.remove.includes(
		"verify:mutation-policy",
	),
);

for (const flags of [
	["--no-dashboard-reference-entities", "--dry-run"],
	["--no-dashboard", "--dry-run"],
	["--no-dashboard", "--no-payload", "--dry-run"],
	["--no-marketing", "--no-payload", "--dry-run"],
]) {
	const result = spawnSync("node", ["scripts/prune-template.mjs", ...flags], {
		cwd: root,
		encoding: "utf8",
	});
	assert.equal(
		result.status,
		0,
		`Prune dry-run failed for ${flags.join(" ")}: ${result.stderr}`,
	);
	assert.ok(result.stdout.includes("Dry run complete. No files were changed."));
}

console.log(
	"Application, marketing, child-surface, and static prune dry-runs passed.",
);
