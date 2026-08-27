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

test("Compose frames stable section sources and requests exact section context", async () => {
	const [compose, intake, visualParity, focusPacket] = await Promise.all([
		readSkill("compose"),
		readSkill("compose", "references/source-intake.md"),
		readSkill("visual-parity"),
		readSkill("visual-parity", "references/focus-packet.md"),
	]);

	assert.match(
		compose,
		/Before any product edit,\s+materialize every authoritative source case/u,
	);
	assert.match(compose, /reference\/<case-id>\.png/u);
	assert.match(
		compose,
		/Call `get_design_context` with the active section frame's exact/u,
	);
	assert.match(
		compose,
		/page frame, containing page, accumulated\s+frame, or a sibling is not design context/u,
	);
	assert.match(intake, /page metadata only to decompose/u);
	assert.match(intake, /exact\s+authoritative section frame/u);
	assert.match(
		visualParity,
		/stable ignored reference\s+PNG before product implementation/u,
	);
	assert.match(
		focusPacket,
		/exact source frame node\/bounds → stable reference PNG/u,
	);
});

test("Compose has no hook-driven section continuation", async () => {
	const manifest = await fs.readFile(
		path.join(process.cwd(), "plugins/averlo/.codex-plugin/plugin.json"),
		"utf8",
	);
	await assert.rejects(
		fs.access(path.join(process.cwd(), "plugins/averlo/hooks/hooks.json")),
		{ code: "ENOENT" },
	);
	await assert.rejects(
		fs.access(
			path.join(process.cwd(), "plugins/averlo/hooks/compose-stop-hook.mjs"),
		),
		{ code: "ENOENT" },
	);
	assert.doesNotMatch(manifest, /"hooks"/u);
});

test("owning workflows load explicit-only subordinate contracts from sibling resources", async () => {
	for (const owner of ["compose", "systemize-composition", "animate"]) {
		const source = await readSkill(owner);
		assert.match(
			source,
			/\[Repository Workflows\]\(\.\.\/repository-workflows\/SKILL\.md\)/u,
		);
		assert.match(
			source,
			/\[Visual Parity\]\(\.\.\/visual-parity\/SKILL\.md\)/u,
		);
		assert.match(
			source,
			/explicit-only skill\s+is omitted from the active skill\s+catalogue/u,
		);
		assert.match(source, /Catalogue omission alone is not a\s+blocker/u);
		assert.match(source, /never authorizes a\s+substitute\s+workflow/u);
	}
});

test("Compose owns section-scoped native review without shared-owner mutation", async () => {
	const compose = await readSkill("compose");

	assert.match(
		compose,
		/Invoke the linked `\$averlo:repository-workflows` once/u,
	);
	assert.match(
		compose,
		/Invoke the linked `\$averlo:visual-parity` in `frame`/u,
	);
	assert.match(compose, /one authoritative source section at a time/u);
	assert.match(
		compose,
		/Do not create,\s+stub, style, or otherwise implement a later case/u,
	);
	assert.match(compose, /`changedPixels: 0` is the only `exact` result/u);
	assert.match(
		compose,
		/Every comparable nonzero result\s+remains `measured`/u,
	);
	assert.match(compose, /Improvement alone/u);
	assert.match(compose, /A later user request resumes the active unfinished/u);
	assert.match(compose, /Stop at a human review checkpoint/u);
	assert.match(
		compose,
		/does not decide or mutate shared design-system\s+owners/u,
	);
	assert.match(
		compose,
		/Do not add, extend, rename, merge, retire, retheme, or change defaults/u,
	);
	assert.match(
		compose,
		/`Logo`, Button, Text, Section, or another shared design-system owner/u,
	);
	assert.match(compose, /`native-invalid`\s+regardless of its pixel score/u);
	assert.match(compose, /existing Target header is immutable/u);
	assert.match(compose, /always exclude source-header pixels/u);
	assert.match(
		compose,
		/Do not propose, plan,\s+recommend, sequence, or describe/u,
	);
	assert.doesNotMatch(compose, /Defer header redesign/u);
	assert.doesNotMatch(compose, /unless the caller explicitly/u);
	assert.match(compose, /evidenced footer\s+work in scope/u);
	assert.match(compose, /accumulated in-scope gate/u);
	assert.match(
		compose,
		/one `MarketingPageDocument` block, one registered renderer/u,
	);
	assert.match(compose, /Use Preview `--review composition`/u);
	assert.doesNotMatch(
		compose,
		/create_goal|update_goal|active plane|stall counter/iu,
	);
	assert.match(
		compose,
		/Do not add a goal, composition\s+record, checklist file, app-server controller/u,
	);
});

test("Systemize Composition separates ownership confidence from visual outcomes", async () => {
	const [systemize, confidence] = await Promise.all([
		readSkill("systemize-composition"),
		readSkill("systemize-composition", "references/confidence.md"),
	]);

	assert.match(systemize, /Plan-only analysis does not require capture work/u);
	assert.match(systemize, /render-preserving/u);
	assert.match(systemize, /intentionally changing/u);
	assert.match(systemize, /uncertain/u);
	assert.match(systemize, /different between consumers/u);
	assert.match(systemize, /not a visual-effect status, schema/u);
	assert.match(
		systemize,
		/Classify the proposal as `high`, `medium`, or `low`/u,
	);
	assert.match(systemize, /\*\*High confidence:\*\* automatically attempt/u);
	assert.match(
		systemize,
		/pixel\s+difference alone neither accepts nor rejects/u,
	);
	assert.match(systemize, /\*\*Medium confidence:\*\* do not edit/u);
	assert.match(systemize, /\*\*Low confidence:\*\* preserve/u);
	assert.match(systemize, /fails its owner, consumer, API, Storybook/u);
	assert.doesNotMatch(systemize, /Freeze the accepted target/u);
	assert.doesNotMatch(systemize, /changedPixels:\s*0/u);
	assert.doesNotMatch(systemize, /visual contract|per-consumer table/iu);
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
	assert.match(confidence, /visual preservation is not assumed/u);
	assert.match(
		confidence,
		/pixel\s+difference is not an ownership-confidence verdict/u,
	);
	assert.doesNotMatch(confidence, /zero changed target-to-target pixels/u);
	assert.doesNotMatch(
		confidence,
		/target-before\/target-after case is nonzero/u,
	);
});

test("Systemize replaces inherited scaffolding while protecting prior product work", async () => {
	const [systemize, confidence] = await Promise.all([
		readSkill("systemize-composition"),
		readSkill("systemize-composition", "references/confidence.md"),
	]);

	assert.match(
		systemize,
		/inherited template visuals are replaceable scaffolding/u,
	);
	assert.match(
		systemize,
		/does not make that owner's visual\s+recipe a fidelity constraint/u,
	);
	assert.match(systemize, /reachable initialization commit/u);
	assert.match(
		systemize,
		/initial tree\s+with the current committed and working-tree state/u,
	);
	assert.match(systemize, /Never create a fresh template/u);
	assert.match(systemize, /unchanged\s+owner is inherited scaffolding/u);
	assert.match(
		systemize,
		/changed or newly added owner may contain\s+prior product systemization/u,
	);
	assert.match(systemize, /provenance uncertainty/u);
	assert.match(
		systemize,
		/Do not add provenance comments, annotations, or another ledger/u,
	);
	assert.match(confidence, /Instance provenance/u);
	assert.match(confidence, /initialization commit and path history/u);
	assert.match(confidence, /conflicting prior product work/u);
});

test("Systemize routes atoms through owner domains before proposing compounds", async () => {
	const [systemize, confidence] = await Promise.all([
		readSkill("systemize-composition"),
		readSkill("systemize-composition", "references/confidence.md"),
	]);

	assert.match(
		systemize,
		/Decompose each candidate before assigning ownership/u,
	);
	assert.match(systemize, /route each atom to the lowest existing owner/u);
	assert.match(
		systemize,
		/existing owner-domain match must resolve through reuse, extension, default\s+replacement, or merge-retire/u,
	);
	assert.match(
		systemize,
		/mismatching inherited visual\s+recipe is a replacement candidate/u,
	);
	assert.match(systemize, /Replace an inherited default/u);
	assert.match(systemize, /add an opt-in\s+variant/u);
	assert.match(systemize, /promote a token only for its exact/u);
	assert.match(systemize, /propose a compound owner only/u);
	assert.match(
		systemize,
		/One user\s+action remains one interactive root and one tab stop/u,
	);
	assert.match(systemize, /Button-owned visual segments/u);
	assert.match(
		systemize,
		/icon-only\s+action owner for a labelled primary action/u,
	);
	assert.match(confidence, /Default replacement/u);
	assert.match(confidence, /Compound/u);
	assert.match(
		confidence,
		/one\s+interactive root rather than duplicated controls/u,
	);
});

test("Systemize audits every domain and makes non-automatic recommendations actionable", async () => {
	const systemize = await readSkill("systemize-composition");

	for (const domain of [
		"typography signatures",
		"controls",
		"links",
		"identity and contextual marks",
		"media treatments",
		"shell and footer presentation",
		"repeated layout roles",
		"tokens",
		"defaults",
		"temporary visual wrappers",
	]) {
		assert.match(
			systemize,
			new RegExp(domain.replaceAll(" ", "\\s+"), "u"),
			`missing inventory domain: ${domain}`,
		);
	}
	assert.match(systemize, /Account for\s+every domain in the final audit/u);
	assert.match(systemize, /Do not\s+silently omit a domain/u);
	assert.match(
		systemize,
		/explicitly non-automatic invocation recommends candidates at\s+every confidence level but applies none/u,
	);
	assert.match(
		systemize,
		/recommended owner\/default\/variant\/token\/compound action/u,
	);
	assert.match(
		systemize,
		/superseded inherited and\s+local recipes to retire/u,
	);
	assert.match(systemize, /concrete central migration/u);
	assert.match(
		systemize,
		/Existing owner overlap cannot resolve as\s+local solely because/u,
	);
	assert.doesNotMatch(
		systemize,
		/per-consumer table|visual-effect table|composition record/iu,
	);
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
	assert.match(animate, /linked `\$averlo:visual-parity`/u);
	assert.match(animate, /linked `\$averlo:repository-workflows` once/u);
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
		"separate source or parity cases",
		"a header, or a footer",
		"shell case and shell selector",
		"Do not count or describe a shell case as a content block",
		"exactly one shared `Section` root",
	]) {
		assert.ok(concern.includes(required), `missing section rule: ${required}`);
	}
	assert.match(concern, /stable case\s+ID/u);
	assert.match(concern, /meaningful source-neutral content or\s+media fields/u);
	assert.match(compose, /Section construction is mandatory/u);
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
	assert.match(sections, /sectionRootCounts/u);
	assert.match(sections, /exactly one shared Section root/u);
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

test("marketing media policy is composed, deterministic, and narrowly exemptable", async () => {
	const [media, verifier, surface] = await Promise.all([
		readSkill("repository-workflows", "references/media-delivery.md"),
		fs.readFile(
			path.resolve(
				process.cwd(),
				"scripts/verify/verify-marketing-media-policy.mjs",
			),
			"utf8",
		),
		fs.readFile(
			path.resolve(process.cwd(), "template-surfaces/marketing.mjs"),
			"utf8",
		),
	]);

	assert.match(
		media,
		/averlo-media-exception-next-line <rule> -- <rationale>/u,
	);
	assert.match(media, /One annotation exempts one reported rule once/u);
	assert.match(media, /non-waivable/u);
	assert.match(media, /npm run verify:marketing-media/u);
	assert.match(media, /npm run verify:marketing/u);
	assert.match(verifier, /exemptableMarketingMediaRules/u);
	assert.match(verifier, /temporary-media-url/u);
	assert.match(verifier, /reference-capture/u);
	assert.match(surface, /"verify:marketing"/u);
	assert.match(surface, /"verify:marketing-media"/u);
});

test("composition review preserves the excluded header and types every authority region", async () => {
	const [compose, focusPacket, marketing] = await Promise.all([
		readSkill("compose"),
		readSkill("visual-parity", "references/focus-packet.md"),
		readSkill("repository-workflows", "references/marketing-architecture.md"),
	]);

	assert.match(compose, /header remains unchanged in\s+the shared shell/u);
	assert.match(
		compose,
		/an evidenced footer is implemented only through its shell/u,
	);
	assert.match(focusPacket, /Authority boundaries:/u);
	assert.match(focusPacket, /Authority locks:/u);
	for (const field of [
		"Content cases:",
		"Shell cases:",
		"Excluded regions:",
		"Accumulated gate:",
	]) {
		assert.ok(
			focusPacket.includes(field),
			`missing typed focus field: ${field}`,
		);
	}
	assert.match(
		compose,
		/Each content\s+case must name one authoritative Figma section frame/u,
	);
	assert.match(compose, /evidenced footer shell cases/u);
	assert.match(compose, /accumulated page is a\s+comparison gate/u);
	assert.match(focusPacket, /never for the untouched whole frame/u);
	assert.match(marketing, /content-plus-footer composition frame/u);
	assert.match(marketing, /approved header is immutable and always excluded/u);
	assert.match(marketing, /never route CSS/u);
});

test("Compose uses one identity-verified capability-complete Figma connector", async () => {
	const [intake, focusPacket] = await Promise.all([
		readSkill("compose", "references/source-intake.md"),
		readSkill("visual-parity", "references/focus-packet.md"),
	]);

	assert.match(intake, /configured primary official Figma connector/u);
	assert.match(intake, /require\s+`webvizionagency@gmail\.com`/u);
	assert.match(intake, /Do not combine identity proof\s+from one connector/u);
	assert.match(intake, /read-only operations never require\s+an Agent Space/u);
	assert.match(intake, /one reusable generic Figma scratch location/u);
	assert.match(
		intake,
		/Never create a target-, route-, task-, or source-page-/u,
	);
	assert.match(
		intake,
		/absence of a clone\s+or dedicated cloning operation must not block/u,
	);
	assert.match(focusPacket, /Agent Space: <reused generic file\/page/u);
	assert.doesNotMatch(intake, /installed Figma app connector by default/u);
});

test("Systemize reviews accepted local renderer boundaries without redefining Compose success", async () => {
	const [compose, sections, systemize] = await Promise.all([
		readSkill("compose"),
		readSkill("repository-workflows", "references/section-construction.md"),
		readSkill("systemize-composition"),
	]);

	assert.match(compose, /support one honest comparison case/u);
	assert.match(sections, /human-reviewed Systemize Composition question/u);
	assert.match(
		systemize,
		/renderer or section-boundary split\/merge as `medium` by default/u,
	);
	assert.match(systemize, /focused route\s+and marketing-section checks/u);
	assert.match(systemize, /purely local renderer-boundary decision/u);
	assert.match(
		systemize,
		/unless it also decides a shared design-system owner/u,
	);
});

test("Compose maintains section recovery evidence without a second workflow record", async () => {
	const [compose, focusPacket] = await Promise.all([
		readSkill("compose"),
		readSkill("visual-parity", "references/focus-packet.md"),
	]);

	assert.match(focusPacket, /Active case:/u);
	for (const retiredField of [
		"Thread identity:",
		"Section boundary:",
		"Next case:",
		"Continuation token:",
	]) {
		assert.ok(
			!focusPacket.includes(retiredField),
			`retired continuation field remains: ${retiredField}`,
		);
	}
	assert.match(compose, /reload the focus packet, its matrix row/u);
	assert.match(
		compose,
		/immediately continue within\s+the same model response/u,
	);
	assert.match(
		compose,
		/A closed section with another ordered\s+case is never a terminal condition/u,
	);
	assert.match(compose, /Do not stop for user input, end the response/u);
	assert.doesNotMatch(compose, /plugin's scoped Stop hook/u);
	assert.doesNotMatch(compose, /unique continuation token/u);
	assert.match(
		compose,
		/Do not add a goal, composition\s+record, checklist file/u,
	);
	assert.match(compose, /request `\/compact`/u);
	assert.match(focusPacket, /recovery evidence/u);
	assert.match(focusPacket, /not lifecycle status, a workflow ledger/u);
	await assert.rejects(
		fs.access(path.join(skillsRoot, "compose", "references", "checklist.md")),
		{ code: "ENOENT" },
	);
});

test("Compose cannot self-accept review or leave a correctable nonzero case", async () => {
	const [compose, focusPacket] = await Promise.all([
		readSkill("compose"),
		readSkill("visual-parity", "references/focus-packet.md"),
	]);

	assert.match(compose, /run a compare-correct-\s*compare loop/u);
	assert.match(
		compose,
		/If any concrete Target-owned mismatch remains, continue the same case/u,
	);
	assert.match(compose, /Write `Human review:\s+pending`/u);
	assert.match(compose, /only the user's explicit\s+response/u);
	assert.match(focusPacket, /agent must not infer either state/u);
	assert.match(
		focusPacket,
		/classify it as incomparable if they\s+remain visible/u,
	);
});

test("Compose repairs comparability and proves symmetric authority before measuring", async () => {
	const [compose, focusPacket] = await Promise.all([
		readSkill("compose"),
		readSkill("visual-parity", "references/focus-packet.md"),
	]);

	assert.match(
		compose,
		/Reject a\s+capture containing excluded pixels or unequal authority regions/u,
	);
	assert.match(
		compose,
		/repair its crop, selector, review state, or Target-owned\s+dimensions/u,
	);
	assert.match(compose, /symmetrically included\s+source and Target regions/u);
	assert.match(
		compose,
		/full source frame compared with a\s+header-hidden Target is invalid/u,
	);
	assert.match(focusPacket, /Authority equivalence:/u);
	assert.match(
		focusPacket,
		/Verify region membership and order, not dimensions alone/u,
	);
});

test("Compose rejects nonzero rationalizations", async () => {
	const compose = await readSkill("compose");

	assert.match(compose, /`changedPixels: 0` is the only `exact` result/u);
	assert.match(
		compose,
		/Every comparable nonzero result\s+remains `measured`/u,
	);
	assert.match(compose, /layout geometry, spacing, alignment/u);
	assert.match(compose, /suspected antialiasing/u);
	assert.match(compose, /generic renderer-noise claim cannot close a case/u);
	assert.match(compose, /asset identity, crop, scale/u);
	assert.match(
		compose,
		/If any concrete Target-owned mismatch remains, continue/u,
	);
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
	assert.match(visualParity, /Zero changed pixels reports identical captures/u);
	assert.match(
		visualParity,
		/without deciding whether it was\s+intended or acceptable/u,
	);
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
