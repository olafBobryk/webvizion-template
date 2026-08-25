import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const skillsRoot = path.resolve(process.cwd(), "plugins/averlo/skills");

async function readSkill(name, relativePath = "SKILL.md") {
	return fs.readFile(path.join(skillsRoot, name, relativePath), "utf8");
}

async function assertMissingSkill(name) {
	await assert.rejects(fs.access(path.join(skillsRoot, name, "SKILL.md")), {
		code: "ENOENT",
	});
}

test("Compose is the only implicit composition workflow", async () => {
	const expected = {
		compose: true,
		"systemize-composition": false,
		animate: false,
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

	for (const retired of [
		"static-composition",
		"composition-realization",
		"composition-system-integration",
		"composition-convergence",
		"motion-composition",
	]) {
		await assertMissingSkill(retired);
	}
});

test("Compose owns one native measured review pass without shared-owner mutation", async () => {
	const compose = await readSkill("compose");

	assert.match(compose, /Invoke `\$averlo:repository-workflows` once/u);
	assert.match(compose, /Invoke `\$averlo:visual-parity` in `frame`/u);
	assert.match(compose, /one complete review pass/u);
	assert.match(compose, /one correction sweep in source order/u);
	assert.match(compose, /Stop at a human review checkpoint/u);
	assert.match(compose, /A later request to continue runs another complete/u);
	assert.match(
		compose,
		/does not decide or mutate shared design-system\s+owners/u,
	);
	assert.match(
		compose,
		/Do not add, extend, rename, merge, retire, retheme, or change defaults/u,
	);
	assert.match(compose, /`native-invalid` regardless of\s+its pixel score/u);
	assert.doesNotMatch(
		compose,
		/create_goal|update_goal|active plane|stall counter/iu,
	);
});

test("Systemize Composition routes confidence and accepts automatic work only at zero", async () => {
	const [systemize, confidence] = await Promise.all([
		readSkill("systemize-composition"),
		readSkill("systemize-composition", "references/confidence.md"),
	]);

	assert.match(systemize, /`integration-parity` cases/u);
	assert.match(systemize, /target-before capture and SHA-256/u);
	assert.match(
		systemize,
		/Classify the proposal as `high`, `medium`, or `low`/u,
	);
	assert.match(systemize, /\*\*High confidence:\*\* automatically attempt/u);
	assert.match(systemize, /`changedPixels: 0`/u);
	assert.match(systemize, /\*\*Medium confidence:\*\* do not edit/u);
	assert.match(systemize, /\*\*Low confidence:\*\* preserve/u);
	assert.match(systemize, /restore only\s+that attempt/u);
	for (const action of [
		"reuse",
		"extension",
		"new owner",
		"merge-retire",
		"token/default",
	]) {
		assert.match(confidence, new RegExp(action, "iu"));
	}
	assert.match(confidence, /lowest supported dimension/u);
	assert.match(confidence, /target-before\/target-after case is nonzero/u);
});

test("durable design-system documents contain human decisions, not lifecycle state", async () => {
	const systemize = await readSkill("systemize-composition");

	assert.match(systemize, /docs\/design-system\/decisions\/<focus-slug>\.md/u);
	assert.match(
		systemize,
		/only after the\s+human approves, rejects, or defers/u,
	);
	assert.match(systemize, /Do not write\s+proposed-but-undecided rows/u);
	assert.match(systemize, /workflow status, implementation status/u);
	assert.match(systemize, /Code, consumers, and Storybook remain\s+the truth/u);
});

test("Animate requires an accepted static target and keeps its endpoint exact", async () => {
	const animate = await readSkill("animate");

	assert.match(animate, /explicit user\s+request for animation/u);
	assert.match(animate, /current native static Target/u);
	assert.match(animate, /Preserve the accepted motion-off endpoint exactly/u);
	assert.match(animate, /`\$averlo:visual-parity`/u);
	assert.match(animate, /`\$averlo:repository-workflows` once/u);
	assert.doesNotMatch(animate, /active plane|handoff state/iu);
});

test("section construction is conditionally routed and remains repository-owned", async () => {
	const [router, concern, compose] = await Promise.all([
		readSkill("repository-workflows"),
		readSkill("repository-workflows", "references/section-construction.md"),
		readSkill("compose"),
	]);

	assert.match(router, /add \[section construction\]/u);
	assert.match(
		router,
		/when creating or restructuring registered marketing sections/u,
	);
	assert.match(router, /A shell-only change, copy-only content edit/u);
	for (const required of [
		"MarketingPageDocument",
		"renderMarketingSections",
		"Section.Background",
		"Storybook contract",
		"one registered renderer",
		"Tailwind-first",
		"repository media concern",
	]) {
		assert.ok(concern.includes(required), `missing section rule: ${required}`);
	}
	assert.match(compose, /section-construction concern is mandatory/u);
	assert.doesNotMatch(compose, /Section\.Background|renderMarketingSections/u);
});

test("Visual Parity stays mechanical across both composition workflows", async () => {
	const visualParity = await readSkill("visual-parity");

	for (const purpose of [
		"source-parity",
		"integration-parity",
		"responsive-system-fit",
		"static-endpoint",
	]) {
		assert.match(visualParity, new RegExp(`\`${purpose}\``, "u"));
	}
	assert.match(visualParity, /never edits product code/u);
	assert.match(visualParity, /never decides a verdict/u);
	assert.match(visualParity, /`native-invalid`/u);
	assert.doesNotMatch(visualParity, /active plane|peer skill|goal lifecycle/iu);
});

test("active composition workflows do not depend on a goal ledger", async () => {
	const sources = await Promise.all(
		["compose", "systemize-composition", "animate", "visual-parity"].map(
			(name) => readSkill(name),
		),
	);
	assert.doesNotMatch(
		sources.join("\n"),
		/goal-ledger-prep|goal ledger|workflow ledger|composition record|active plane|peer skill/iu,
	);
});
