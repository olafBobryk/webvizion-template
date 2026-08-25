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
	assert.match(compose, /does\s+not by itself authorize replacement/u);
	assert.match(compose, /exclude its source pixels/u);
	assert.match(compose, /source-backed footer work in\s+scope/u);
	assert.match(compose, /accumulated in-scope gate/u);
	assert.match(compose, /one registered block, one renderer/u);
	assert.match(
		compose,
		/repository-owned Preview `--review composition` mode/u,
	);
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
		/whenever the requested change creates or restructures a public marketing page/u,
	);
	assert.match(
		router,
		/cannot avoid the concern by choosing a\s+route-local page/u,
	);
	assert.match(router, /a shell-only change,\s+copy-only content edit/iu);
	for (const required of [
		"MarketingPageDocument",
		"renderMarketingSections",
		"Section.Background",
		"Storybook contract",
		"one registered renderer",
		"Tailwind-first",
		"repository media concern",
		"one independently reviewable semantic/source section",
		"meaningful source-neutral content or media fields",
		"a header, or a footer",
	]) {
		assert.ok(concern.includes(required), `missing section rule: ${required}`);
	}
	assert.match(compose, /section-construction concern is\s+mandatory/u);
	assert.doesNotMatch(compose, /Section\.Background|renderMarketingSections/u);
});

test("route and marketing verifiers reject implementation-shape bypasses", async () => {
	const [routes, sections] = await Promise.all([
		fs.readFile(
			path.resolve(process.cwd(), "scripts/verify/verify-route-surfaces.ts"),
			"utf8",
		),
		fs.readFile(
			path.resolve(
				process.cwd(),
				"scripts/verify/verify-marketing-section-policy.ts",
			),
			"utf8",
		),
	]);

	assert.match(routes, /for \(const pagePath of collectPages\(appRoot\)\)/u);
	assert.match(routes, /Page bypasses route-family ownership/u);
	assert.match(sections, /documentArchitectureExemptions/u);
	assert.match(sections, /must resolve a MarketingPageDocument/u);
	assert.match(
		sections,
		/cannot use route-local JSX as an alternate architecture/u,
	);
});

test("Compose calibrates font faces and requires exact exported vector identity", async () => {
	const [intake, media] = await Promise.all([
		readSkill("compose", "references/source-intake.md"),
		readSkill("repository-workflows", "references/media-delivery.md"),
	]);

	assert.match(intake, /Figma weight labels/u);
	assert.match(intake, /separate evidence/u);
	assert.match(intake, /glyph shape, measured width, line\s+breaks/u);
	assert.match(
		intake,
		/Do not map one physical face to a broad\s+weight range/u,
	);
	assert.match(intake, /Disable font synthesis/u);
	assert.match(intake, /export that exact logo or mark as SVG/u);
	assert.match(intake, /never redraw it, replace it with text or a glyph/u);
	assert.match(media, /Commit exact SVG marks and icons/u);
});

test("composition review excludes only the deferred header and retains honest authority", async () => {
	const [compose, focusPacket, marketing] = await Promise.all([
		readSkill("compose"),
		readSkill("visual-parity", "references/focus-packet.md"),
		readSkill("repository-workflows", "references/marketing-architecture.md"),
	]);

	assert.match(
		compose,
		/Preserve an excluded header through the shared\s+shell/u,
	);
	assert.match(
		compose,
		/implement an evidenced footer only through that shell/u,
	);
	assert.match(focusPacket, /Authority boundaries:/u);
	assert.match(focusPacket, /never for the untouched whole frame/u);
	assert.match(marketing, /content-plus-footer composition frame/u);
	assert.match(marketing, /never route CSS/u);
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
