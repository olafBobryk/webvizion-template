import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const skillRoot = path.resolve(
	process.cwd(),
	"plugins/averlo/skills/static-composition",
);

async function read(relativePath) {
	return fs.readFile(path.join(skillRoot, relativePath), "utf8");
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

test("composition record defines related source and progress tables", async () => {
	const contract = await read("references/composition-record.md");
	const sourceRows = tableAfter(contract, "## Source decomposition");
	const progressRows = tableAfter(contract, "## Progress");

	assert.deepEqual(sourceRows[0], [
		"Scope ID",
		"Order",
		"Kind",
		"Original source node/bounds",
		"Agent Space node/crop",
		"Target route/selector",
		"Shell boundary",
		"Terminal condition",
	]);
	assert.deepEqual(progressRows[0], [
		"Scope ID",
		"Status",
		"Current changed pixels",
		"Best changed pixels",
		"Current mean delta",
		"Best mean delta",
		"Current Target identity",
		"Best Target identity",
		"Non-improving turns",
		"Evidence",
		"Next action or blocker",
	]);

	const sourceIds = new Set(sourceRows.slice(2).map((row) => row[0]));
	const progressIds = new Set(progressRows.slice(2).map((row) => row[0]));
	assert.equal(sourceIds.size, sourceRows.length - 2);
	assert.equal(progressIds.size, progressRows.length - 2);
	assert.deepEqual(progressIds, sourceIds);
});

test("composition record defines the complete current-state vocabulary", async () => {
	const contract = await read("references/composition-record.md");
	for (const status of [
		"queued",
		"active",
		"waiting",
		"stale",
		"exact",
		"system-fit-verified",
		"blocked",
	]) {
		assert.match(contract, new RegExp(`- ${"`"}${status}${"`"}:`));
	}
	for (const artifact of ["source.png", "target.png", "diff.png"]) {
		assert.match(contract, new RegExp(artifact.replace(".", "\\.")));
	}
	assert.match(contract, /Keep current state only; do not append an attempt/u);
});

test("Static Composition owns status and resumes from the record", async () => {
	const [skill, contract] = await Promise.all([
		read("SKILL.md"),
		read("references/composition-record.md"),
	]);
	assert.match(
		skill,
		/Invoke \$averlo:static-composition to continue the composition in <record-path> using the skill-defined terminal condition\./u,
	);
	assert.match(skill, /Static Composition alone interprets those facts/u);
	assert.match(skill, /Update the record before ending every turn/u);
	assert.doesNotMatch(
		`${skill}\n${contract}`,
		/(?:goal-ledger-prep|\$goal-ledger-prep|goal ledger)/iu,
	);
});

test("Visual Parity and Compose do not duplicate composition status", async () => {
	const [visualParity, compose] = await Promise.all([
		fs.readFile(path.resolve(skillRoot, "../visual-parity/SKILL.md"), "utf8"),
		fs.readFile(path.resolve(skillRoot, "../compose/SKILL.md"), "utf8"),
	]);
	assert.match(
		visualParity,
		/does not edit\s+the product, assign composition status/u,
	);
	assert.doesNotMatch(visualParity, /Case results:/u);
	assert.doesNotMatch(visualParity, /accepted-intentional/u);
	assert.match(compose, /must not create a competing record or goal/u);
	assert.doesNotMatch(compose, /create_goal/u);
});
