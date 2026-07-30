#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import {
	appendExecutedBenchmarkRun,
	createExecutedBenchmarkRun,
} from "./lib/template-intelligence-benchmark.mjs";
import {
	ensureSerenaService,
	getWarmSerenaState,
	main as runSerenaService,
} from "./template-intelligence-serena-service.mjs";

const ROOT = process.cwd();
const BOOLEAN_FLAGS = new Set([
	"debug-port-discovery",
	"ensure-serena",
	"require-serena",
]);

function parseArgs(argv) {
	const values = new Map();

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith("--")) continue;

		const [key, inlineValue] = arg.slice(2).split("=");
		if (BOOLEAN_FLAGS.has(key)) {
			values.set(key, true);
			continue;
		}

		const nextValue = inlineValue ?? argv[index + 1];
		if (inlineValue === undefined) index += 1;
		values.set(key, nextValue);
	}

	return values;
}

function readString(values, key) {
	const value = values.get(key);
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(values, key, fallback) {
	const value = values.get(key);
	if (value === undefined) return fallback;

	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		throw new Error(`--${key} must be a non-negative number.`);
	}

	return parsed;
}

function readTopics(values) {
	const topics = readString(values, "topics");
	if (!topics) return [];
	return topics
		.split(",")
		.map((topic) => topic.trim())
		.filter(Boolean);
}

function printUsage() {
	console.log(`Usage: npm run intelligence:hybrid -- \\
  --task-id T1 \\
  --task-name "Route architecture" \\
  --topics route-architecture,dev-server \\
  --serena-file src/config/surfaces.ts \\
  --serena-symbol appSurfaceRegistry

Optional:
  --ensure-serena
  --require-serena
  --serena-port 9121
  --port-range-start 9121
  --port-range-count 50
  --scenario-id route-architecture
  --run-group-id route-bakeoff
  --benchmark-mode live-passive
  --task-class implementation
  --output tmp/intelligence-benchmark-smoke.jsonl
  --correctness 3
  --wrong-turns 0
  --generated-artifact-mistakes 0
  --notes "Short note"
`);
}

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: ROOT,
		encoding: "utf8",
		stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
	});

	if (result.status !== 0) {
		const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
		throw new Error(
			`${command} ${args.join(" ")} failed${output ? `:\n${output}` : "."}`,
		);
	}

	return result;
}

async function querySerena(state, toolName, toolParams) {
	const response = await fetch(`http://127.0.0.1:${state.port}/query_project`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			project_name: state.projectName,
			tool_name: toolName,
			tool_params_json: JSON.stringify(toolParams),
		}),
	});

	const text = await response.text();
	if (!response.ok) {
		throw new Error(`Serena ${toolName} query failed: ${text}`);
	}

	if (!text.trim() || text.includes("Error executing tool:")) {
		throw new Error(`Serena ${toolName} query returned an error: ${text}`);
	}

	return text;
}

function templateOnly(message, requireSerena) {
	const formatted = `Template Intelligence only; no TemplateSerena row recorded: ${message}`;
	if (requireSerena) {
		throw new Error(formatted);
	}

	console.warn(formatted);
}

async function main() {
	const argv = process.argv.slice(2);
	const values = parseArgs(argv);

	if (values.has("debug-port-discovery")) {
		const forwarded = argv.filter((arg) => arg !== "--debug-port-discovery");
		await runSerenaService(["debug", ...forwarded]);
		return;
	}

	const taskId = readString(values, "task-id");
	const taskName = readString(values, "task-name");
	const topics = readTopics(values);
	const serenaFile = readString(values, "serena-file");
	const serenaSymbol = readString(values, "serena-symbol");
	const ensureSerena = values.has("ensure-serena");
	const requireSerena = values.has("require-serena");
	const serenaPort = readNumber(values, "serena-port", 0);
	const portRangeStart = readNumber(values, "port-range-start", 9121);
	const portRangeCount = readNumber(values, "port-range-count", 50);
	const correctness = readNumber(values, "correctness", undefined);
	const wrongTurns = readNumber(values, "wrong-turns", undefined);
	const generatedArtifactMistakes = readNumber(
		values,
		"generated-artifact-mistakes",
		undefined,
	);
	const extraNotes = readString(values, "notes");
	const outputPath = readString(values, "output");
	const benchmarkMode = readString(values, "benchmark-mode") ?? "live-passive";
	const startedAt = performance.now();

	if (!taskId || !taskName || topics.length === 0 || !serenaFile) {
		printUsage();
		process.exit(1);
	}

	let semanticCalls = 0;
	let outputBytes = 0;

	try {
		run("npm", ["run", "intelligence:generate"]);
		for (const topic of topics) {
			run("npm", ["run", "intelligence:query", "--", topic]);
		}

		const state = ensureSerena
			? await ensureSerenaService({
					installMissing: true,
					runIndex: true,
					requestedPort: serenaPort,
					portRangeStart,
					portRangeCount,
				})
			: await getWarmSerenaState();

		if (!state) {
			templateOnly(
				"no warm Serena service is available. Run `npm run intelligence:serena:ensure` or retry with `--ensure-serena` for an intentional TemplateSerena benchmark.",
				requireSerena,
			);
			return;
		}

		try {
			const overview = await querySerena(state, "get_symbols_overview", {
				relative_path: serenaFile,
			});
			semanticCalls += 1;
			outputBytes += Buffer.byteLength(overview);
			console.log(
				`Serena get_symbols_overview returned ${overview.length} bytes.`,
			);

			if (serenaSymbol) {
				const symbolResult = await querySerena(state, "find_symbol", {
					name_path_pattern: serenaSymbol,
					relative_path: serenaFile,
					depth: 1,
				});
				semanticCalls += 1;
				outputBytes += Buffer.byteLength(symbolResult);
				console.log(
					`Serena find_symbol returned ${symbolResult.length} bytes.`,
				);
			}
		} catch (error) {
			templateOnly(
				`Serena semantic lookup failed. ${error instanceof Error ? error.message : String(error)}`,
				requireSerena,
			);
			return;
		}

		if (semanticCalls === 0) {
			throw new Error("No successful Serena semantic calls were made.");
		}

		const shellCommands = 1 + topics.length + (ensureSerena ? 3 : 0);
		const notes = [
			`Warm optional TemplateSerena benchmark: generated Template Intelligence, queried topics ${topics.join(", ")}, used Serena service ${state.projectName} on port ${state.port}, and queried ${serenaFile}${serenaSymbol ? ` / ${serenaSymbol}` : ""}.`,
			extraNotes,
		]
			.filter(Boolean)
			.join(" ");

		const benchmarkRun = createExecutedBenchmarkRun({
			taskId,
			taskName,
			strategy: "TemplateSerena",
			benchmarkMode,
			measurementSource: "command",
			sourceCommand: "intelligence:hybrid",
			scenarioId: readString(values, "scenario-id"),
			runGroupId: readString(values, "run-group-id"),
			taskClass: readString(values, "task-class"),
			date: readString(values, "date"),
			shellCommands,
			semanticCalls,
			outputBytes,
			elapsedSeconds: (performance.now() - startedAt) / 1000,
			correctness,
			wrongTurns,
			generatedArtifactMistakes,
			resolution: readString(values, "resolution"),
			notes,
		});
		if (outputPath) {
			const result = await appendExecutedBenchmarkRun(benchmarkRun, {
				root: ROOT,
				outputPath,
			});
			console.log(
				`${result.status === "duplicate" ? "Already recorded" : "Recorded"} ${benchmarkRun.strategy} ${benchmarkRun.taskId} in ${path.relative(ROOT, result.path)} (${benchmarkRun.runId}).`,
			);
		} else {
			console.log(
				`Completed ${benchmarkRun.strategy} ${benchmarkRun.taskId}. No explicit run file was written; trusted Codex hooks record the surrounding turn automatically. Pass --output for an intentional standalone record.`,
			);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.warn(`TemplateSerena benchmark not recorded: ${message}`);
		process.exitCode = 2;
	}
}

await main();
