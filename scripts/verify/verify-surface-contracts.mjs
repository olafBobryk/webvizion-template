#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packageJson = JSON.parse(
	readFileSync(path.join(root, "package.json"), "utf8"),
);
assert.equal(
	typeof packageJson.scripts?.["verify:route-surfaces"],
	"string",
	"Projects must retain the focused verify:route-surfaces command.",
);

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const routeSurfaceResult = spawnSync(
	npmCommand,
	["run", "verify:route-surfaces"],
	{
		cwd: root,
		stdio: "inherit",
	},
);
if (routeSurfaceResult.error) throw routeSurfaceResult.error;
assert.equal(
	routeSurfaceResult.status,
	0,
	"Installed route-surface verification failed.",
);

const dashboardRoot = path.join(root, "src/app/(site)/dashboard");
const dashboardRegistry = path.join(
	dashboardRoot,
	"_registry/surfaceRegistry.ts",
);
const hasDashboard = existsSync(dashboardRoot);
const hasDashboardRegistry = existsSync(dashboardRegistry);

assert.equal(
	hasDashboard,
	hasDashboardRegistry,
	"Dashboard route tree and canonical surface registry must be added or removed together.",
);

if (!hasDashboard) {
	console.log(
		"Surface contract verification passed: dashboard is not installed.",
	);
	process.exit(0);
}

assert.equal(
	typeof packageJson.scripts?.["verify:dashboard"],
	"string",
	"Dashboard instances must retain the focused verify:dashboard command.",
);
assert.equal(
	typeof packageJson.scripts?.["verify:dashboard-pages"],
	"string",
	"Dashboard instances must retain the focused verify:dashboard-pages command.",
);

const result = spawnSync(npmCommand, ["run", "verify:dashboard"], {
	cwd: root,
	stdio: "inherit",
});

if (result.error) throw result.error;
assert.equal(
	result.status,
	0,
	"Canonical dashboard surface verification failed.",
);

console.log("Surface contract verification passed.");
