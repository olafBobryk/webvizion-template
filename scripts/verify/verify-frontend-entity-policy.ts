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
assert.equal(policy.includes("entity-contract:reference-"), false);
assert.equal(policy.includes("entity-contract:optional-surface"), false);
assert.ok(policy.includes("task-local finite-axis reviewer"));

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

const entitySelector = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/EntitySelector.tsx",
	),
	"utf8",
);
assert.ok(
	entitySelector.includes("<SelectInput") &&
		entitySelector.includes('dropdownPositionStrategy="fixed"') &&
		entitySelector.includes("renderOption(entity)") &&
		entitySelector.includes("dropdownContent:"),
	"EntitySelector must own plain selected text, fixed portal positioning, and caller-rendered presentation rows.",
);
assert.ok(
	!entitySelector.includes("showSelectedIcon={") &&
		entitySelector.includes('"showSelectedIcon"'),
	"EntitySelector must prevent callers from placing entity presentation in the closed InputFrame.",
);
for (const [entity, identity] of [
	["member", "Member"],
	["organization", "Organization"],
	["record", "Record"],
] as const) {
	const selector = readFileSync(
		resolve(
			root,
			`src/app/(site)/dashboard/_components/entities/${entity}/${identity}Selector.tsx`,
		),
		"utf8",
	);
	assert.ok(
		selector.includes("<EntitySelector") &&
			selector.includes(`renderOption={`) &&
			selector.includes(`<${identity}Identity`) &&
			selector.includes('variant="default"'),
		`${identity}Selector must compose EntitySelector and explicitly choose its default identity presentation.`,
	);
	assert.equal(
		selector.includes("dropdownContent:") ||
			selector.includes("showSelectedIcon"),
		false,
		`${identity}Selector must leave listbox mechanics and closed InputFrame presentation to EntitySelector.`,
	);
}

const registry = readFileSync(
	resolve(root, "src/app/(site)/dashboard/_registry/surfaceRegistry.ts"),
	"utf8",
);
assert.ok(!registry.includes("presentationRender"));
assert.ok(!registry.includes("entityRenderer"));
console.log("Frontend entity policy verification passed.");
