import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const skillsRoot = path.resolve(process.cwd(), "plugins/averlo/skills");
const composeRoot = path.join(skillsRoot, "compose");

async function read(relativePath) {
	return fs.readFile(path.join(composeRoot, relativePath), "utf8");
}

async function readSkill(name, relativePath = "SKILL.md") {
	return fs.readFile(path.join(skillsRoot, name, relativePath), "utf8");
}

function tableAfter(source, heading) {
	const start = source.indexOf(`${heading}\n`);
	assert.notEqual(start, -1, `missing ${heading}`);
	const lines = source.slice(start + heading.length + 1).split(/\r?\n/u);
	const first = lines.findIndex((line) => line.startsWith("|"));
	assert.notEqual(first, -1, `missing table after ${heading}`);
	const table = [];
	for (const line of lines.slice(first)) {
		if (!line.startsWith("|")) break;
		table.push(
			line
				.slice(1, -1)
				.split("|")
				.map((cell) => cell.trim()),
		);
	}
	return table;
}

test("Compose routes the three static peers in order and motion only explicitly", async () => {
	const compose = await read("SKILL.md");
	const realization = compose.indexOf("$averlo:composition-realization");
	const integration = compose.indexOf("$averlo:composition-system-integration");
	const convergence = compose.indexOf("$averlo:composition-convergence");

	assert.ok(realization > -1);
	assert.ok(integration > realization);
	assert.ok(convergence > integration);
	assert.match(
		compose,
		/Default the Terminal plane to `composition-convergence`/u,
	);
	assert.match(
		compose,
		/Select\s+`motion-composition` only when the caller explicitly requests motion/u,
	);
	assert.match(
		compose,
		/Invoke exactly one peer composition skill per continuation/u,
	);
	assert.match(
		compose,
		/never calls Figma, edits product code, interprets comparison\s+metrics/u,
	);
});

test("Compose is the only implicit composition workflow", async () => {
	const expected = {
		compose: true,
		"composition-realization": false,
		"composition-system-integration": false,
		"composition-convergence": false,
		"motion-composition": false,
		"visual-parity": false,
	};

	for (const [skill, implicit] of Object.entries(expected)) {
		const metadata = await readSkill(skill, "agents/openai.yaml");
		assert.match(
			metadata,
			new RegExp(`allow_implicit_invocation: ${implicit}`, "u"),
			`${skill} implicit policy`,
		);
	}

	await assert.rejects(
		fs.access(path.join(skillsRoot, "static-composition", "SKILL.md")),
		{ code: "ENOENT" },
	);
});

test("the one record relates plane handoffs and scope evidence", async () => {
	const contract = await read("references/composition-record.md");
	const handoffs = tableAfter(contract, "## Plane handoffs");
	const source = tableAfter(contract, "## Source decomposition");
	const integration = tableAfter(contract, "## Integration parity");
	const progress = tableAfter(contract, "## Source progress");

	assert.deepEqual(handoffs[0], [
		"Plane",
		"Status",
		"Terminal evidence",
		"Next action or blocker",
	]);
	assert.deepEqual(source[0], [
		"Scope ID",
		"Order",
		"Kind",
		"Original source node/bounds",
		"Agent Space node/crop",
		"Target route/selector",
		"Shell boundary",
		"Terminal condition",
	]);
	assert.equal(integration[0][0], "Scope ID");
	assert.equal(progress[0][0], "Scope ID");
	assert.match(
		contract,
		/Compose alone updates lifecycle metadata and Plane handoffs/u,
	);
	assert.match(
		contract,
		/Rename Progress to Source progress without changing scope IDs/u,
	);
	assert.match(
		contract,
		/Never infer a ready handoff from the\s+old label alone/u,
	);
});

test("Realization establishes a complete baseline without claiming parity", async () => {
	const realization = await readSkill("composition-realization");
	assert.match(realization, /Inspect the complete source before section work/u);
	assert.match(realization, /390, 768, 1024,\s+and 1440 pixels/u);
	assert.match(
		realization,
		/Section-local components, exact local variables, and\s+local CSS are allowed/u,
	);
	assert.match(
		realization,
		/Call every comparable nonzero source case `baselined`\s+or `measured`, never `verified` or complete/u,
	);
	assert.match(
		realization,
		/do not set Overall state\s+or the composition complete/u,
	);
});

test("System Integration is subtractive and target-to-target exact", async () => {
	const integration = await readSkill("composition-system-integration");
	for (const disposition of [
		"replace",
		"merge-retire",
		"source-supported-retain",
		"unevidenced-preserve",
		"instance-local",
	]) {
		assert.match(integration, new RegExp(`\`${disposition}\``, "u"));
	}
	assert.match(
		integration,
		/Repetition or owner overlap can never be escaped as `instance-local`/u,
	);
	assert.match(integration, /Make migration subtractive/u);
	assert.match(
		integration,
		/A semantic wrapper that still receives the complete visual\s+recipe from route-local classes is not a migrated visual owner/u,
	);
	assert.match(integration, /target-to-target difference/u);
	assert.match(integration, /integration-exact only at `changedPixels: 0`/u);
	assert.match(
		integration,
		/An\s+improvement against Figma cannot compensate for a target-to-target difference/u,
	);
});

test("Convergence continues improving nonzero work and blocks only after three stalls", async () => {
	const convergence = await readSkill("composition-convergence");
	assert.match(convergence, /not restricted to one hypothesis or one edit/u);
	assert.match(convergence, /Any improving nonzero result\s+is actionable/u);
	assert.match(convergence, /leave the goal active, and continue/u);
	assert.match(
		convergence,
		/Never end the workflow merely because the result is close/u,
	);
	assert.match(
		convergence,
		/three consecutive non-improving correction turns/u,
	);
	assert.match(convergence, /pure recapture with the same Target SHA-256/u);
	assert.match(convergence, /set Integration handoff\s+to `pending`/u);
	assert.match(convergence, /reports `changedPixels: 0`/u);
});

test("goal and evidence ownership do not create a second ledger", async () => {
	const [
		compose,
		realization,
		integration,
		convergence,
		visualParity,
		contract,
	] = await Promise.all([
		read("SKILL.md"),
		readSkill("composition-realization"),
		readSkill("composition-system-integration"),
		readSkill("composition-convergence"),
		readSkill("visual-parity"),
		read("references/composition-record.md"),
	]);
	const combined = [
		compose,
		realization,
		integration,
		convergence,
		contract,
	].join("\n");

	assert.match(compose, /goal is runtime\s+continuation only/u);
	assert.match(compose, /Never create\s+child goals/u);
	assert.match(realization, /peer running under Compose reuses its goal/u);
	assert.match(integration, /Reuse Compose's active goal/u);
	assert.match(convergence, /Reuse Compose's active goal/u);
	assert.doesNotMatch(
		combined,
		/(?:goal-ledger-prep|\$goal-ledger-prep|goal ledger)/iu,
	);
	assert.match(
		visualParity,
		/does not edit the product, assign composition\s+status/u,
	);
	assert.doesNotMatch(visualParity, /accepted-intentional/u);
});
