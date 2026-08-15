import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { collectSkillReferenceErrors } from "./verify-skill-references.mjs";

const workflowRows = Array.from(
	{ length: 14 },
	(_, index) =>
		`| Workflow ${index + 1} | Signal | [owner](references/owner.md) |`,
).join("\n");

async function createFixture({ context, extraSkillText = "", scripts = {} }) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "skill-references-"));
	const router = path.join(root, "plugins/averlo/skills/repository-workflows");
	await fs.mkdir(path.join(router, "references"), { recursive: true });
	await fs.mkdir(path.join(root, "src/components/ui/input/text"), {
		recursive: true,
	});
	await fs.writeFile(
		path.join(root, "package.json"),
		JSON.stringify({ scripts: { "verify:known": "true", ...scripts } }),
	);
	await fs.writeFile(
		path.join(root, "src/components/AGENTS.md"),
		"# Components\n",
	);
	await fs.writeFile(
		path.join(root, "src/components/ui/input/text/AGENTS.md"),
		"# Text input\n",
	);
	await fs.writeFile(
		path.join(router, "SKILL.md"),
		`# Skill\n\n## Route the work\n\nRoute first.\n\n## Orient through selected concerns\n\n| Entry workflow | Signal | Concern |\n| --- | --- | --- |\n${workflowRows}\n\n## Apply repository-mode overlays\n\n${extraSkillText}\n`,
	);
	await fs.writeFile(
		path.join(router, "references/owner.md"),
		`# Owner\n\n[local](../SKILL.md) [web](https://example.com)\n\n## Repository context\n\n${context}\n\n## Verification\n\nRun npm run verify:known.\n`,
	);
	return root;
}

test("accepts existing files, directories, globs, scripts, and external URLs", async () => {
	const root = await createFixture({
		context:
			"- `src/components/AGENTS.md`\n- `src/components`\n- `src/components/ui/input/**/AGENTS.md`",
	});
	assert.deepEqual(collectSkillReferenceErrors(root), []);
});

test("reports a broken local Markdown link", async () => {
	const root = await createFixture({
		context: "- `src/components/AGENTS.md`",
		extraSkillText: "[missing](references/missing.md)",
	});
	assert.match(
		collectSkillReferenceErrors(root).join("\n"),
		/missing Markdown link/u,
	);
});

test("reports a missing repository path", async () => {
	const root = await createFixture({
		context: "- `src/components/missing.ts`",
	});
	assert.match(
		collectSkillReferenceErrors(root).join("\n"),
		/missing repository path/u,
	);
});

test("reports an unmatched repository glob", async () => {
	const root = await createFixture({ context: "- `src/missing/**/AGENTS.md`" });
	assert.match(
		collectSkillReferenceErrors(root).join("\n"),
		/missing repository path/u,
	);
});

test("reports an unknown npm script", async () => {
	const root = await createFixture({ context: "Run npm run verify:missing." });
	assert.match(
		collectSkillReferenceErrors(root).join("\n"),
		/unknown npm script/u,
	);
});

test("rejects retired guide and compatibility-skill sources in the router", async () => {
	const root = await createFixture({
		context:
			"- `docs/guides/components/forms-and-submission.md`\n- `plugins/averlo/skills/design-system/SKILL.md`",
	});
	assert.match(
		collectSkillReferenceErrors(root).join("\n"),
		/retired router source/u,
	);
});
