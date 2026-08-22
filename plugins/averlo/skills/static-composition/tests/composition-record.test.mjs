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
	const ownerRows = tableAfter(contract, "## Owner migration");
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
	assert.deepEqual(ownerRows[0], [
		"Owner axis ID",
		"Owner",
		"Axis or role",
		"Source evidence and affected scopes",
		"Inherited recipe and consumers",
		"Disposition",
		"Resulting owner and consumers",
		"Storybook and catalogue evidence",
	]);

	const sourceIds = new Set(sourceRows.slice(2).map((row) => row[0]));
	const progressIds = new Set(progressRows.slice(2).map((row) => row[0]));
	assert.equal(sourceIds.size, sourceRows.length - 2);
	assert.equal(progressIds.size, progressRows.length - 2);
	assert.deepEqual(progressIds, sourceIds);
});

test("owner migration is evidence-scoped and subtractive", async () => {
	const [skill, contract] = await Promise.all([
		read("SKILL.md"),
		read("references/composition-record.md"),
	]);
	for (const disposition of [
		"replace",
		"merge-retire",
		"source-supported-retain",
		"unevidenced-preserve",
		"instance-local",
	]) {
		assert.match(
			contract,
			new RegExp(`- ${"`"}${disposition}${"`"}:`, "u"),
		);
	}
	assert.match(skill, /exact owner-axis or role granularity/u);
	assert.match(
		skill,
		/Owner\s+overlap or repetition can never be justified as `instance-local`/u,
	);
	assert.match(skill, /One observed\s+value does not authorize changes to adjacent axes/u);
	assert.match(skill, /repeated\s+horizontal gutters may replace a shared Section `px` axis/u);
	assert.match(skill, /`unevidenced-preserve` keeps an adjacent axis or role/u);
	assert.match(skill, /must never be reported as converted/u);
	assert.match(skill, /Make migration subtractive for every evidenced role/u);
	assert.match(skill, /remove duplicated page-local visual recipes/u);
	assert.match(
		skill,
		/Do not start final\s+zero-diff\s+convergence against temporary page-local approximations/u,
	);
	assert.match(
		contract,
		/System integration remains\s+incomplete while any evidenced row lacks current owner, consumer, contract, and\s+Storybook\/catalogue evidence/u,
	);
});

test("composition record defines the complete current-state vocabulary", async () => {
	const contract = await read("references/composition-record.md");
	for (const status of [
		"queued",
		"active",
		"mismatched",
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
	assert.match(contract, /pure recapture with the same Target-capture/u);
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
	assert.match(skill, /390, 768, 1024, and 1440 pixels/u);
	assert.match(
		skill,
		/Do not begin the\s+correction phase until every row has current baseline evidence/u,
	);
	assert.match(skill, /not restricted to one hypothesis or one edit/u);
	assert.match(
		skill,
		/create a new goal from the same incomplete record\s+before any Source call or Target edit/u,
	);
	assert.match(skill, /If the replacement\s+goal cannot be created/u);
	assert.match(
		skill,
		/comparable nonzero scope measured or baselined, never verified/u,
	);
	assert.match(
		skill,
		/Do not silently search or borrow from\s+sibling repositories/u,
	);
	assert.doesNotMatch(
		`${skill}\n${contract}`,
		/(?:goal-ledger-prep|\$goal-ledger-prep|goal ledger)/iu,
	);
});

test("Static Composition supports a bounded realization handoff", async () => {
	const [skill, contract] = await Promise.all([
		read("SKILL.md"),
		read("references/composition-record.md"),
	]);
	for (const field of ["Delivery shape", "Current pass", "Realization handoff"]) {
		assert.match(contract, new RegExp(`- ${field}:`, "u"));
	}
	assert.match(
		skill,
		/Invoke \$averlo:static-composition to complete the realization pass in <record-path> using the skill-defined realization terminal condition\./u,
	);
	assert.match(skill, /first-pass baseline is\s+evidence for the next task, not a parity claim/u);
	assert.match(skill, /set Realization handoff to `ready`/u);
	assert.match(skill, /complete only\s+the staged realization goal/u);
	assert.match(skill, /Do not set Overall state or the composition\s+record to `complete`/u);
	assert.match(contract, /must\s+not set Overall state to `complete`/u);
});

test("system integration follows complete-focus realization", async () => {
	const [skill, compose] = await Promise.all([
		read("SKILL.md"),
		fs.readFile(path.resolve(skillRoot, "../compose/SKILL.md"), "utf8"),
	]);
	assert.match(skill, /census every visible role across the\s+complete source focus/u);
	assert.match(skill, /Convert one recorded shell or section scope at a time/u);
	assert.match(skill, /componentization as a render-preserving refactor/u);
	assert.match(
		skill,
		/Do not start final\s+zero-diff\s+convergence against temporary page-local approximations/u,
	);
	assert.match(
		skill,
		/Fonts,\s+constituent assets, media delivery, source provenance, semantic native DOM,\s+complete decomposition, stable selectors, and repository safety checks are\s+first-pass requirements/u,
	);
	assert.match(compose, /in\s+`end-to-end` delivery/u);
	assert.match(compose, /must not stop at a staged realization handoff/u);
});

test("only Static Composition is implicit for goal-backed continuation", async () => {
	const repositoryRoot = path.resolve(skillRoot, "../../../..");
	const [canonicalAgents, assembler] = await Promise.all([
		fs.readFile(path.join(repositoryRoot, "AGENTS.md"), "utf8"),
		fs.readFile(
			path.join(repositoryRoot, "template-assembly/assembler.mjs"),
			"utf8",
		),
	]);

	for (const [workflow, implicit] of Object.entries({
		compose: false,
		"motion-composition": false,
		"repository-workflows": false,
		"static-composition": true,
		"visual-parity": false,
	})) {
		const agentMetadata = await fs.readFile(
			path.join(
				repositoryRoot,
				`plugins/averlo/skills/${workflow}/agents/openai.yaml`,
			),
			"utf8",
		);
		assert.match(
			agentMetadata,
			new RegExp(`allow_implicit_invocation: ${implicit}`, "u"),
			`${workflow} implicit-invocation policy is incorrect`,
		);
	}
	for (const policy of [canonicalAgents, assembler]) {
		assert.doesNotMatch(policy, /stop and report a workflow\s+resolution failure/u);
		assert.match(policy, /optional repository workflow layer/u);
		assert.match(
			policy,
			/A source-backed composition must not\s+call Figma or edit product code/u,
		);
	}
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
