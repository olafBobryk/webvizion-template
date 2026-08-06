#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const surfacesRoot = path.join(root, "src/components/ui/primitives/surfaces");
const requiredSurfaceFiles = [
	"AGENTS.md",
	"Card.tsx",
	"Float.tsx",
	"Panel.tsx",
	"index.ts",
	"surfaceStyles.ts",
];

for (const file of requiredSurfaceFiles) {
	assert.ok(
		existsSync(path.join(surfacesRoot, file)),
		`Missing semantic surface owner: ${file}`,
	);
}
for (const removedFile of ["Card.tsx", "Panel.tsx"]) {
	assert.ok(
		!existsSync(path.join(root, "src/components/ui/primitives", removedFile)),
		`Legacy primitive path still exists: ${removedFile}`,
	);
}

const surfaceFacade = readFileSync(path.join(surfacesRoot, "index.ts"), "utf8");
for (const publicName of [
	"Card",
	"CardHeadingProps",
	"CardProps",
	"Float",
	"FloatProps",
	"Panel",
	"PanelProps",
	"SurfaceBackground",
	"SurfaceElevation",
	"SurfaceRadius",
]) {
	assert.match(
		surfaceFacade,
		new RegExp(`\\b${publicName}\\b`),
		`Surface facade is missing ${publicName}.`,
	);
}
for (const internalName of [
	"CardHeader",
	"SurfaceBorder",
	"surfaceChromeStyles",
]) {
	assert.doesNotMatch(
		surfaceFacade,
		new RegExp(`\\b${internalName}\\b`),
		`Surface facade exposes internal ${internalName}.`,
	);
}

function sourceFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return sourceFiles(entryPath);
		return /\\.(?:ts|tsx)$/.test(entry.name) ? [entryPath] : [];
	});
}

for (const file of sourceFiles(path.join(root, "src"))) {
	const source = readFileSync(file, "utf8");
	assert.doesNotMatch(
		source,
		/@\/components\/ui\/primitives\/(?:Card|Panel)/,
		`Legacy surface import remains in ${path.relative(root, file)}.`,
	);
	assert.doesNotMatch(
		source,
		/<(?:Panel|Card|Float|Dropdown\\.Panel|DropdownSurface|ModalCard)\\b[^>]*\\bshadow=/gs,
		`Generic shadow prop remains on a surface in ${path.relative(root, file)}.`,
	);
	assert.doesNotMatch(
		source,
		/<(?:Panel|Card|Float|Dropdown\\.Panel|DropdownSurface|ModalCard)\\b[^>]*\\b(?:border="ring"|bordered=)/gs,
		`Legacy border prop remains on a surface in ${path.relative(root, file)}.`,
	);
}

const panelSource = readFileSync(path.join(surfacesRoot, "Panel.tsx"), "utf8");
const cardSource = readFileSync(path.join(surfacesRoot, "Card.tsx"), "utf8");
const floatSource = readFileSync(path.join(surfacesRoot, "Float.tsx"), "utf8");
assert.match(panelSource, /data-surface-role="panel"/);
assert.match(cardSource, /data-surface-role="card"/);
assert.match(floatSource, /data-surface-role="float"/);
assert.match(cardSource, /elevation = "card"/);
assert.match(floatSource, /elevation = "float"/);

const dashboardRoot = path.join(root, "src/app/(site)/dashboard");
const hasDashboard = existsSync(dashboardRoot);
const shellSurfaceContracts = [
	{
		file: "src/app/(site)/_components/layout/HeaderFull.tsx",
		installed: true,
		role: "marketing-header",
	},
	{
		file: "src/app/(site)/_components/layout/HeaderCompact.tsx",
		installed: true,
		role: "marketing-header",
	},
	{
		file: "src/app/(site)/dashboard/_components/layout/DashboardFrame.tsx",
		installed: hasDashboard,
		role: "dashboard-header",
	},
	{
		file: "src/app/(site)/dashboard/_components/layout/DashboardSidebarShell.tsx",
		installed: hasDashboard,
		role: "dashboard-sidebar",
	},
];

for (const contract of shellSurfaceContracts) {
	const contractPath = path.join(root, contract.file);
	assert.equal(
		existsSync(contractPath),
		contract.installed,
		`${contract.file} installation does not match its selected surface.`,
	);
	if (!contract.installed) continue;
	const source = readFileSync(contractPath, "utf8");
	assert.match(
		source,
		/@\/components\/ui\/primitives\/surfaces/,
		`${contract.file} must consume the public surface facade.`,
	);
	assert.match(
		source,
		new RegExp(`data-shell-surface="${contract.role}"`),
		`${contract.file} is missing its semantic shell-surface marker.`,
	);
	assert.match(
		source,
		/radius="none"/,
		`${contract.file} shell chrome must remain radius-free.`,
	);
}

const tooltipSource = readFileSync(
	path.join(root, "src/components/ui/misc/Tooltip.tsx"),
	"utf8",
);
assert.match(tooltipSource, /menuElevation="panel"/);
assert.doesNotMatch(
	tooltipSource,
	/!bg-popover|backdrop-blur|shadow-(?:sm|md|lg|xl)/,
	"Tooltip must inherit Float chrome instead of owning ad hoc presentation.",
);

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

const dashboardRegistry = path.join(
	dashboardRoot,
	"_registry/surfaceRegistry.ts",
);
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
