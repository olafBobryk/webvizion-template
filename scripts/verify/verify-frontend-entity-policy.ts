import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const policyPath = resolve(
	root,
	"src/app/(site)/dashboard/_lib/entities/AGENTS.md",
);
const policy = readFileSync(policyPath, "utf8");
const markers = [
	...policy.matchAll(/<!-- entity-contract:([^=]+)=([^ ]+) -->/g),
];
assert.ok(
	markers.length >= 7,
	"Expected machine-verifiable entity policy markers.",
);

for (const [, key, value] of markers) {
	if (key === "policy-version" || key === "optional-surface") continue;
	assert.ok(
		existsSync(resolve(root, value)),
		`Missing entity policy path ${value}`,
	);
}
assert.ok(
	policy.includes(
		"<!-- entity-contract:optional-surface=dashboardReferenceEntities -->",
	),
);

for (const relativePath of [
	"src/app/(site)/dashboard/_lib/entities/account/presentation.ts",
	"src/app/(site)/dashboard/_lib/entities/invitation/presentation.ts",
	"src/app/(site)/dashboard/_lib/entities/member/presentation.ts",
	"src/app/(site)/dashboard/_lib/entities/organization/presentation.ts",
	"src/app/(site)/dashboard/_lib/entities/record/presentation.ts",
]) {
	const source = readFileSync(resolve(root, relativePath), "utf8");
	assert.ok(
		!source.includes("react"),
		`${relativePath} must remain React-free.`,
	);
	assert.ok(
		!source.includes("fetch("),
		`${relativePath} must remain fetch-free.`,
	);
}

const dashboardSourceFiles = [
	"src/app/(site)/dashboard/_lib",
	"src/app/(site)/dashboard/_components/entities",
];
for (const sourcePath of dashboardSourceFiles) {
	assert.ok(existsSync(resolve(root, sourcePath)));
}

const registry = readFileSync(
	resolve(root, "src/app/(site)/dashboard/_registry/surfaceRegistry.ts"),
	"utf8",
);
assert.ok(!registry.includes("presentationRender"));
assert.ok(!registry.includes("entityRenderer"));
console.log("Frontend entity policy verification passed.");
