import assert from "node:assert/strict";
import test from "node:test";
import { parseCliArgs, resolveCliOptions } from "../lib/options.mjs";

const metadata = {
	profiles: [
		{
			content: {
				default: "payload-ready",
				supported: ["static", "payload-ready"],
			},
			description: "Minimal marketing project",
			id: "thin-start",
		},
		{
			content: { default: "static", supported: ["static"] },
			description: "Application project",
			id: "app-only",
		},
	],
};

test("parses the public command contract", () => {
	assert.deepEqual(
		parseCliArgs([
			"example",
			"--profile",
			"thin-start",
			"--content",
			"static",
			"--no-install",
		]),
		{
			content: "static",
			help: false,
			install: false,
			profile: "thin-start",
			projectDirectory: "example",
			version: false,
		},
	);
});

test("rejects unsupported and dangerous public options", () => {
	assert.throws(() => parseCliArgs(["example", "--force"]), /Unknown option/);
	assert.throws(
		() => parseCliArgs(["example", "--with", "assistant"]),
		/Unknown option/,
	);
	assert.throws(
		() => parseCliArgs(["example", "--content", "unknown"]),
		/static or payload-ready/,
	);
});

test("requires directory and profile non-interactively", async () => {
	await assert.rejects(
		resolveCliOptions({
			cwd: "/tmp",
			interactive: false,
			metadata,
			parsed: parseCliArgs([]),
			prompt: null,
		}),
		/project directory is required/,
	);
	await assert.rejects(
		resolveCliOptions({
			cwd: "/tmp",
			interactive: false,
			metadata,
			parsed: parseCliArgs(["example"]),
			prompt: null,
		}),
		/--profile is required/,
	);
});

test("uses the profile content default for non-interactive callers", async () => {
	const resolved = await resolveCliOptions({
		cwd: "/tmp",
		interactive: false,
		metadata,
		parsed: parseCliArgs(["example", "--profile", "thin-start"]),
		prompt: null,
	});
	assert.equal(resolved.content, "payload-ready");
	assert.equal(resolved.projectName, "example");
});

test("rejects invalid names and unsupported profile content", async () => {
	await assert.rejects(
		resolveCliOptions({
			cwd: "/tmp",
			interactive: false,
			metadata,
			parsed: parseCliArgs(["Bad Name", "--profile", "thin-start"]),
			prompt: null,
		}),
		/valid lowercase npm package name/,
	);
	await assert.rejects(
		resolveCliOptions({
			cwd: "/tmp",
			interactive: false,
			metadata,
			parsed: parseCliArgs([
				"example",
				"--profile",
				"app-only",
				"--content",
				"payload-ready",
			]),
			prompt: null,
		}),
		/does not support payload-ready/,
	);
});

test("interactive resolution asks for missing values", async () => {
	const answers = ["interactive-project", "thin-start", "static"];
	const prompt = {
		async select() {
			return answers.shift();
		},
		async text() {
			return answers.shift();
		},
	};
	const resolved = await resolveCliOptions({
		cwd: "/tmp",
		interactive: true,
		metadata,
		parsed: parseCliArgs([]),
		prompt,
	});
	assert.equal(resolved.projectName, "interactive-project");
	assert.equal(resolved.profile.id, "thin-start");
	assert.equal(resolved.content, "static");
});
