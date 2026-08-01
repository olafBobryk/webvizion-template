import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
	AssistantMessage,
	AssistantRuntimeAdapter,
	AssistantRuntimeEvent,
	AssistantToolName,
} from "./contracts";
import { isAssistantToolName, isAssistantWriteTool } from "./contracts";
import { executeRecordTool } from "./records.server";
import { streamAssistantToolInput } from "./tool-input-stream.server";

type CodexHarnessResult = {
	response: string;
	toolCall: { input: Record<string, unknown>; name: AssistantToolName } | null;
};

type CodexHarnessOutput = {
	response: string;
	toolCall: { inputJson: string; name: AssistantToolName } | null;
};

const MAX_CONTEXT_MESSAGES = 20;
const MAX_PROMPT_CHARACTERS = 20_000;
const MAX_PROCESS_OUTPUT_BYTES = 1_000_000;
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_LIFECYCLE_DELAY_MS = 90;
let activeHarnessRuns = 0;

const outputSchema = {
	additionalProperties: false,
	properties: {
		response: { type: "string" },
		toolCall: {
			anyOf: [
				{ type: "null" },
				{
					additionalProperties: false,
					properties: {
						inputJson: { type: "string" },
						name: {
							enum: [
								"records_list",
								"record_get",
								"record_create",
								"record_update",
								"record_archive",
								"record_delete",
							],
							type: "string",
						},
					},
					required: ["inputJson", "name"],
					type: "object",
				},
			],
		},
	},
	required: ["response", "toolCall"],
	type: "object",
} as const;

function allowedToolNames(
	toolMode: Parameters<AssistantRuntimeAdapter["stream"]>[0]["toolMode"],
) {
	if (toolMode === "off") return [];
	if (toolMode === "read_only") return ["records_list", "record_get"];
	return [
		"records_list",
		"record_get",
		"record_create",
		"record_update",
		"record_archive",
		"record_delete",
	];
}

function messageForHarness(message: AssistantMessage) {
	const content = message.parts.flatMap((part) => {
		switch (part.type) {
			case "text":
				return part.text ? [part.text] : [];
			case "file":
				return [`[Attached file: ${part.attachment.filename}]`];
			case "tool":
				return [
					`[Tool ${part.name} ${part.state}: ${JSON.stringify(part.output ?? part.error ?? part.input)}]`,
				];
		}

		part satisfies never;
		return [];
	});
	return `${message.role.toUpperCase()}: ${content.join("\n")}`;
}

export function buildCodexHarnessPrompt(
	input: Parameters<AssistantRuntimeAdapter["stream"]>[0],
) {
	const allowedTools = allowedToolNames(input.toolMode);
	const conversation = input.messages
		.slice(-MAX_CONTEXT_MESSAGES)
		.map(messageForHarness)
		.join("\n\n")
		.slice(-MAX_PROMPT_CHARACTERS);
	return [
		"You are the local development harness for the product Assistant.",
		"Respond concisely in Markdown and stay within the supplied conversation.",
		"You cannot inspect the filesystem, network, uploaded-file contents, or application state directly.",
		"Never claim a tool ran. Return one toolCall when application data or a Record action is required.",
		"When a completed or failed tool result is already present, summarize that result directly and do not request another tool.",
		"When returning a toolCall, leave response empty. The application owns execution and approval.",
		`Allowed tools: ${allowedTools.length > 0 ? allowedTools.join(", ") : "none"}.`,
		"Encode tool input as a JSON object string in inputJson.",
		"Tool inputs: records_list accepts query/includeArchived; record_get/archive/delete require id; create/update accept Record fields.",
		"Conversation:",
		conversation,
	].join("\n\n");
}

export function parseCodexHarnessJsonl(output: string): CodexHarnessResult {
	let finalMessage = "";
	for (const line of output.split("\n")) {
		if (!line.trim()) continue;
		const event = JSON.parse(line) as {
			item?: { text?: string; type?: string };
			type?: string;
		};
		if (
			event.type === "item.completed" &&
			event.item?.type === "agent_message" &&
			typeof event.item.text === "string"
		) {
			finalMessage = event.item.text;
		}
	}
	if (!finalMessage) throw new Error("Codex returned no Assistant response.");
	const parsed = JSON.parse(finalMessage) as Partial<CodexHarnessOutput>;
	if (typeof parsed.response !== "string") {
		throw new Error("Codex returned an invalid Assistant response.");
	}
	if (parsed.toolCall === null || parsed.toolCall === undefined) {
		return { response: parsed.response, toolCall: null };
	}
	if (
		typeof parsed.toolCall !== "object" ||
		!isAssistantToolName(parsed.toolCall.name) ||
		typeof parsed.toolCall.inputJson !== "string"
	) {
		throw new Error("Codex returned an invalid Record tool call.");
	}
	let input: unknown;
	try {
		input = JSON.parse(parsed.toolCall.inputJson);
	} catch {
		throw new Error("Codex returned invalid Record tool input.");
	}
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		throw new Error("Codex returned invalid Record tool input.");
	}
	return {
		response: parsed.response,
		toolCall: {
			input: input as Record<string, unknown>,
			name: parsed.toolCall.name,
		},
	};
}

function codexHarnessError(output: string) {
	for (const line of output.split("\n").toReversed()) {
		if (!line.trim()) continue;
		try {
			const event = JSON.parse(line) as {
				item?: { message?: string; type?: string };
				message?: string;
				type?: string;
			};
			if (event.type === "error" && typeof event.message === "string") {
				return event.message;
			}
			if (
				event.item?.type === "error" &&
				typeof event.item.message === "string"
			) {
				return event.item.message;
			}
		} catch {}
	}
	return undefined;
}

function harnessEnvironment(): NodeJS.ProcessEnv {
	const environment: NodeJS.ProcessEnv = {
		NODE_ENV: process.env.NODE_ENV,
		TERM: "dumb",
	};
	const allowedNames = [
		"CODEX_HOME",
		"HOME",
		"HTTPS_PROXY",
		"HTTP_PROXY",
		"LANG",
		"LC_ALL",
		"NO_PROXY",
		"PATH",
		"SSL_CERT_FILE",
		"TMPDIR",
	];
	for (const name of allowedNames) {
		if (process.env[name]) environment[name] = process.env[name];
	}
	return environment;
}

function harnessTimeoutMs() {
	const configured = Number(process.env.ASSISTANT_CODEX_TIMEOUT_MS);
	return Number.isFinite(configured)
		? Math.min(120_000, Math.max(5_000, configured))
		: DEFAULT_TIMEOUT_MS;
}

function lifecycleDelayMs() {
	const configured = Number(process.env.ASSISTANT_CODEX_LIFECYCLE_DELAY_MS);
	return Number.isFinite(configured)
		? Math.min(500, Math.max(0, configured))
		: DEFAULT_LIFECYCLE_DELAY_MS;
}

async function lifecyclePause(delayMs: number, signal?: AbortSignal) {
	if (delayMs <= 0) return;
	if (signal?.aborted) throw new Error("Assistant run stopped.");
	await new Promise<void>((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timeout);
			reject(new Error("Assistant run stopped."));
		};
		const timeout = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, delayMs);
		signal?.addEventListener("abort", onAbort, { once: true });
	});
}

async function runCodexHarness(
	input: Parameters<AssistantRuntimeAdapter["stream"]>[0],
) {
	if (activeHarnessRuns >= 1) {
		throw new Error("The local Codex harness is already running.");
	}
	activeHarnessRuns += 1;
	const workingDirectory = await mkdtemp(
		join(tmpdir(), "averlo-assistant-codex-"),
	);
	const schemaPath = join(workingDirectory, "output-schema.json");
	try {
		await writeFile(schemaPath, JSON.stringify(outputSchema), "utf8");
		const args = [
			"--ask-for-approval",
			"never",
			"--disable",
			"apps",
			"--disable",
			"browser_use",
			"--disable",
			"computer_use",
			"--disable",
			"image_generation",
			"--disable",
			"multi_agent",
			"--disable",
			"plugins",
			"--disable",
			"shell_tool",
			"exec",
			"--ephemeral",
			"--ignore-user-config",
			"--ignore-rules",
			"--skip-git-repo-check",
			"--sandbox",
			"read-only",
			"--json",
			"--output-schema",
			schemaPath,
			"-C",
			workingDirectory,
		];
		if (process.env.ASSISTANT_CODEX_MODEL) {
			args.push("--model", process.env.ASSISTANT_CODEX_MODEL);
		}
		args.push("-");
		const child = spawn(process.env.ASSISTANT_CODEX_BINARY ?? "codex", args, {
			cwd: workingDirectory,
			env: harnessEnvironment(),
			stdio: ["pipe", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		let timedOut = false;
		let outputExceeded = false;
		let forceKillTimeout: ReturnType<typeof setTimeout> | undefined;
		const stop = () => {
			if (child.exitCode !== null || child.signalCode !== null) return;
			child.kill("SIGTERM");
			forceKillTimeout ??= setTimeout(() => {
				if (child.exitCode === null && child.signalCode === null) {
					child.kill("SIGKILL");
				}
			}, 2_000);
		};
		const onAbort = () => stop();
		input.signal?.addEventListener("abort", onAbort, { once: true });
		const timeout = setTimeout(() => {
			timedOut = true;
			stop();
		}, harnessTimeoutMs());
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (chunk: string) => {
			stdout += chunk;
			if (Buffer.byteLength(stdout) > MAX_PROCESS_OUTPUT_BYTES) {
				outputExceeded = true;
				stop();
			}
		});
		child.stderr.on("data", (chunk: string) => {
			stderr = `${stderr}${chunk}`.slice(-8_000);
		});
		child.stdin.on("error", () => {});
		child.stdin.end(buildCodexHarnessPrompt(input));
		const result = await new Promise<{
			code: number | null;
			error?: Error;
			signal: NodeJS.Signals | null;
		}>((resolve) => {
			child.once("error", (error) =>
				resolve({ code: null, error, signal: null }),
			);
			child.once("close", (code, signal) => resolve({ code, signal }));
		});
		clearTimeout(timeout);
		if (forceKillTimeout) clearTimeout(forceKillTimeout);
		input.signal?.removeEventListener("abort", onAbort);
		if (input.signal?.aborted) throw new Error("Assistant run stopped.");
		if (timedOut) throw new Error("The local Codex harness timed out.");
		if (outputExceeded) {
			throw new Error("The local Codex harness returned too much output.");
		}
		if (result.error) {
			throw new Error(
				`Could not start the local Codex harness: ${result.error.message}`,
			);
		}
		if (result.code !== 0) {
			const detail =
				codexHarnessError(stdout) ??
				stderr
					.split("\n")
					.map((line) => line.trim())
					.filter(Boolean)
					.at(-1);
			throw new Error(
				detail
					? `The local Codex harness failed: ${detail}`
					: `The local Codex harness exited with code ${result.code ?? result.signal ?? "unknown"}.`,
			);
		}
		return parseCodexHarnessJsonl(stdout);
	} finally {
		activeHarnessRuns -= 1;
		await rm(workingDirectory, { force: true, recursive: true });
	}
}

async function* streamHarnessText(
	text: string,
	delayMs: number,
	signal?: AbortSignal,
): AsyncGenerator<AssistantRuntimeEvent> {
	for (const delta of text.match(/.{1,24}(?:\s|$)|.{1,24}/gu) ?? []) {
		yield { delta, type: "text-delta" };
		await lifecyclePause(delayMs, signal);
	}
}

async function* codexToolFollowUp(
	input: Parameters<AssistantRuntimeAdapter["stream"]>[0],
	toolCall: NonNullable<CodexHarnessResult["toolCall"]>,
	toolCallId: string,
	delayMs: number,
	result: { error?: string; output?: unknown },
): AsyncGenerator<AssistantRuntimeEvent> {
	const followUp = await runCodexHarness({
		...input,
		fixtureScenario: undefined,
		messages: [
			...input.messages,
			{
				createdAt: new Date().toISOString(),
				id: crypto.randomUUID(),
				parts: [
					{
						approvalId: null,
						error: result.error ?? null,
						id: toolCallId,
						input: toolCall.input,
						name: toolCall.name,
						output: result.output ?? null,
						state: result.error ? ("error" as const) : ("completed" as const),
						type: "tool" as const,
					},
				],
				role: "assistant",
			},
		],
		toolMode: "off",
	});
	if (followUp.toolCall) {
		throw new Error(
			"The local Codex harness requested a tool during synthesis.",
		);
	}
	yield* streamHarnessText(followUp.response, delayMs, input.signal);
}

export async function* codexHarnessResponse(
	input: Parameters<AssistantRuntimeAdapter["stream"]>[0],
): AsyncGenerator<AssistantRuntimeEvent> {
	const result = await runCodexHarness(input);
	const delayMs = lifecycleDelayMs();
	if (result.response) {
		yield* streamHarnessText(result.response, delayMs, input.signal);
	}
	if (!result.toolCall) return;
	const allowed = allowedToolNames(input.toolMode);
	if (!allowed.includes(result.toolCall.name)) {
		throw new Error(
			"The local Codex harness requested a disabled Record tool.",
		);
	}
	const toolCallId = crypto.randomUUID();
	yield* streamAssistantToolInput({
		delayMs,
		input: result.toolCall.input,
		name: result.toolCall.name,
		signal: input.signal,
		toolCallId,
	});
	if (isAssistantWriteTool(result.toolCall.name)) return;
	const toolResult: { error?: string; output?: unknown } = {};
	try {
		toolResult.output = await executeRecordTool(
			result.toolCall.name,
			result.toolCall.input,
			{
				canWrite: input.canWrite,
				organizationId: input.actor.organizationId,
			},
		);
	} catch (error) {
		toolResult.error =
			error instanceof Error ? error.message : "Record tool failed.";
	}
	await lifecyclePause(Math.max(700, delayMs * 8), input.signal);
	yield { ...toolResult, toolCallId, type: "tool-result" };
	yield* codexToolFollowUp(
		input,
		result.toolCall,
		toolCallId,
		delayMs,
		toolResult,
	);
}
