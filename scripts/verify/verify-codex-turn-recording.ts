#!/usr/bin/env tsx

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
	aggregateCodexHookEvents,
	type CodexHookEventV1,
} from "../../src/lib/template-intelligence/index";
import {
	appendCodexHookEvent,
	extractEditedPaths,
	normalizeHookPayload,
} from "../lib/codex-turn-recording.mjs";

const ROOT = process.cwd();
const SECRET_SENTINEL = "SECRET_SENTINEL_MUST_NOT_PERSIST";

async function main() {
	const temporaryRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "averlo-codex-recording-"),
	);
	const outputPath = path.join(temporaryRoot, "events.jsonl");

	function payload(eventName: string, overrides: Record<string, unknown> = {}) {
		return {
			session_id: "session-1",
			turn_id: "turn-1",
			hook_event_name: eventName,
			cwd: ROOT,
			model: "gpt-test",
			permission_mode: "default",
			transcript_path: `/private/${SECRET_SENTINEL}.jsonl`,
			...overrides,
		};
	}

	function event(
		eventName: string,
		seconds: number,
		overrides: Record<string, unknown> = {},
	) {
		return normalizeHookPayload(payload(eventName, overrides), {
			root: ROOT,
			now: new Date(
				`2026-07-23T10:00:${String(seconds).padStart(2, "0")}.000Z`,
			),
		}) as CodexHookEventV1;
	}

	try {
		const events = [
			event("SessionStart", 0, {
				turn_id: undefined,
				source: "startup",
			}),
			event("UserPromptSubmit", 1, { prompt: SECRET_SENTINEL }),
			event("PostToolUse", 2, {
				tool_name: "Bash",
				tool_use_id: "tool-hybrid",
				tool_input: {
					command: `npm run intelligence:hybrid -- --notes ${SECRET_SENTINEL}`,
				},
				tool_response: { output: SECRET_SENTINEL },
			}),
			event("PostToolUse", 3, {
				tool_name: "Bash",
				tool_use_id: "tool-graphify",
				tool_input: {
					command: `uvx --from graphifyy graphify query ${SECRET_SENTINEL}`,
				},
			}),
			event("PostToolUse", 4, {
				tool_name: "apply_patch",
				tool_use_id: "tool-edit",
				tool_input: {
					command: `*** Begin Patch\n*** Update File: src/example.ts\n@@\n-${SECRET_SENTINEL}\n+safe\n*** End Patch`,
				},
			}),
			event("SubagentStart", 5, {
				agent_id: "agent-1",
				agent_type: "worker",
			}),
			event("SubagentStop", 6, {
				agent_id: "agent-1",
				agent_type: "worker",
				agent_transcript_path: `/private/${SECRET_SENTINEL}.jsonl`,
				last_assistant_message: SECRET_SENTINEL,
			}),
			event("Stop", 9, { last_assistant_message: SECRET_SENTINEL }),
			event("UserPromptSubmit", 10, {
				turn_id: "turn-open",
				prompt: SECRET_SENTINEL,
			}),
			event("Stop", 11, {
				turn_id: "turn-partial",
				last_assistant_message: SECRET_SENTINEL,
			}),
		];

		assert.deepEqual(events[2]?.activitySignals, ["serena", "template-map"]);
		assert.deepEqual(events[3]?.activitySignals, ["graphify"]);
		assert.deepEqual(events[4]?.editedPaths, ["src/example.ts"]);
		assert.deepEqual(
			extractEditedPaths(ROOT, "apply_patch", {
				command: "*** Add File: ../outside.ts\n*** Add File: src/inside.ts",
			}),
			["src/inside.ts"],
		);

		process.env.CODEX_TURN_RECORDING_PATH = outputPath;
		await Promise.all(
			[...events, events[2]].map((recordedEvent) =>
				appendCodexHookEvent(recordedEvent, { root: ROOT }),
			),
		);
		delete process.env.CODEX_TURN_RECORDING_PATH;

		const raw = await fs.readFile(outputPath, "utf8");
		assert.equal(raw.includes(SECRET_SENTINEL), false);
		const recorded = raw
			.trim()
			.split(/\r?\n/)
			.map((line) => JSON.parse(line) as CodexHookEventV1);
		assert.equal(recorded.length, events.length + 1);
		const allowedEventKeys = new Set([
			"schemaVersion",
			"recordKind",
			"eventId",
			"recordedAt",
			"sessionId",
			"eventName",
			"turnId",
			"model",
			"permissionMode",
			"source",
			"toolCategory",
			"activitySignals",
			"editedPaths",
			"agentId",
			"agentType",
		]);
		assert.equal(
			recorded.every((recordedEvent) =>
				Object.keys(recordedEvent).every((key) => allowedEventKeys.has(key)),
			),
			true,
		);
		if (process.platform !== "win32") {
			const mode = (await fs.stat(outputPath)).mode & 0o777;
			assert.equal(mode, 0o600);
		}

		const aggregated = aggregateCodexHookEvents(recorded);
		assert.equal(aggregated.events.length, events.length);
		assert.equal(aggregated.sessions.length, 1);
		assert.equal(aggregated.turns.length, 3);
		const completed = aggregated.turns.find((turn) => turn.turnId === "turn-1");
		assert.equal(completed?.status, "complete");
		assert.equal(completed?.durationSeconds, 8);
		assert.equal(completed?.observedPath, "Mixed");
		assert.equal(completed?.toolCount, 3);
		assert.equal(completed?.subagentCount, 1);
		assert.deepEqual(completed?.editedPaths, ["src/example.ts"]);
		assert.equal(
			aggregated.turns.find((turn) => turn.turnId === "turn-open")?.status,
			"open",
		);
		assert.equal(
			aggregated.turns.find((turn) => turn.turnId === "turn-partial")?.status,
			"partial",
		);

		const hooks = JSON.parse(await fs.readFile(".codex/hooks.json", "utf8"));
		assert.deepEqual(Object.keys(hooks.hooks).sort(), [
			"PostToolUse",
			"SessionStart",
			"Stop",
			"SubagentStart",
			"SubagentStop",
			"UserPromptSubmit",
		]);

		const failOpen = spawnSync(
			process.execPath,
			["scripts/record-codex-turn-event.mjs"],
			{
				cwd: ROOT,
				encoding: "utf8",
				input: `{${SECRET_SENTINEL}`,
				env: {
					...process.env,
					CODEX_TURN_RECORDING_PATH: path.join(temporaryRoot, "invalid.jsonl"),
				},
			},
		);
		assert.equal(failOpen.status, 0);
		assert.equal(failOpen.stdout, "");
		assert.equal(failOpen.stderr.includes(SECRET_SENTINEL), false);
		assert.match(failOpen.stderr, /event could not be recorded/);

		const legacyRows = (
			await fs.readFile(
				"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.jsonl",
				"utf8",
			)
		)
			.trim()
			.split(/\r?\n/)
			.map((line) => JSON.parse(line));
		assert.equal(legacyRows.length, 34);
		assert.equal(
			new Set(
				legacyRows.map((row) =>
					JSON.stringify([
						row.date,
						row.project,
						row.taskId,
						row.taskName,
						row.strategy,
						row.shellCommands,
						row.semanticCalls,
						row.lookupActions,
						row.notes,
					]),
				),
			).size,
			34,
		);
		assert.equal(
			legacyRows.every(
				(row) =>
					row.evidenceClass === "legacy-observation" &&
					row.evidenceQuality === "historical-self-reported" &&
					row.sourceRepository === "averlo-next-template" &&
					/^[0-9a-f]{40}$/.test(row.sourceCommit),
			),
			true,
		);
		assert.equal(
			legacyRows.some((row) => row.strategy === "Graphify"),
			false,
		);
		assert.equal(
			legacyRows.filter(
				(row) =>
					row.sourceCommit === "c4f5771bcca9abc4daafb7d40eeb7b1c80226732",
			).length,
			8,
		);

		console.log(
			"Codex turn recording verification passed: lifecycle contracts, privacy, concurrent append, deduplication, aggregation, strategy signals, subagents, incomplete turns, fail-open behavior, and 34-row legacy provenance.",
		);
	} finally {
		delete process.env.CODEX_TURN_RECORDING_PATH;
		await fs.rm(temporaryRoot, { recursive: true, force: true });
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
