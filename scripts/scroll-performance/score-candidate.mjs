#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
	aggregateMetricSamples,
	appendJsonLine,
	buildBenchmarkFinalReport,
	compareBenchmarkEnvironments,
	evaluateScrollPerformanceComparison,
	getUnauthorizedPaths,
	parseScrollPerformanceCandidate,
	readJsonFile,
	resolveAutoresearchRuntimePaths,
	sanitizeTag,
	summarizeScrollPerformanceResult,
	TERMINAL_BENCHMARK_STATUSES,
	writeJsonFile,
} from "./lib/scroll-performance.mjs";

function printUsage() {
	console.log(`Usage: npm run score:scroll-performance -- --tag <tag> [options]

Options:
  --tag <tag>        Required runtime tag created by setup
  --label "note"     Optional candidate label; defaults to the current commit subject

The scorer owns the configured sample count. Candidate passes always run a
paired control/candidate block followed by an independently restarted
confirmation block.`);
}

function parseArgs(argv) {
	const flags = new Set();
	const values = new Map();
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith("--")) continue;
		if (!arg.includes("=") && (argv[index + 1]?.startsWith("--") ?? true)) {
			flags.add(arg.slice(2));
			continue;
		}
		const [rawKey, inlineValue] = arg.slice(2).split("=");
		const nextValue = inlineValue ?? argv[index + 1];
		if (inlineValue === undefined) index += 1;
		values.set(rawKey.trim(), nextValue);
	}
	return { flags, values };
}

function readString(values, key) {
	const value = values.get(key);
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function runCommand(command, args, { cwd, allowFailure = false } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 1024 * 1024 * 40,
	});
	if (result.status !== 0 && !allowFailure) {
		throw new Error(
			(result.stderr || result.stdout || `${command} ${args.join(" ")}`).trim(),
		);
	}
	return result;
}

function git(args, options = {}) {
	return runCommand("git", args, options);
}

function getRepoRoot(cwd) {
	return git(["rev-parse", "--show-toplevel"], { cwd }).stdout.trim();
}

function requireCleanWorkingTree(cwd) {
	const status = git(["status", "--short"], { cwd }).stdout.trim();
	if (status) {
		throw new Error(
			"Scoring requires a clean worktree state. Commit the candidate change first.",
		);
	}
}

async function runAndCapture(command, args, { cwd, label, logLines }) {
	const result = runCommand(command, args, { cwd });
	logLines.push(`$ ${label}`);
	logLines.push((result.stdout || "").trim());
	if (result.stderr?.trim()) logLines.push(result.stderr.trim());
	return result;
}

async function scoreMeasurement({
	cwd,
	label,
	logLines,
	outputPath,
	readySelector,
	runCount,
	targetPath,
}) {
	await runAndCapture("npm", ["run", "build"], {
		cwd,
		label: "npm run build",
		logLines,
	});
	const measureArgs = [
		"scripts/scroll-performance/measure.mjs",
		"--path",
		targetPath,
		"--runs",
		String(runCount),
		"--output",
		outputPath,
		"--notes",
		label,
	];
	if (readySelector) measureArgs.push("--ready-selector", readySelector);
	await runAndCapture(process.execPath, measureArgs, {
		cwd,
		label: `node ${measureArgs.join(" ")}`,
		logLines,
	});
	const payload = await readJsonFile(outputPath);
	parseScrollPerformanceCandidate(payload);
	return {
		...payload,
		environment: {
			...payload.environment,
			ownedProcessesCleaned: true,
		},
	};
}

async function measureRevision({
	branch,
	cwd,
	label,
	logLines,
	outputPath,
	readySelector,
	revision,
	runCount,
	targetPath,
}) {
	git(["switch", "--detach", revision], { cwd });
	try {
		return await scoreMeasurement({
			cwd,
			label,
			logLines,
			outputPath,
			readySelector,
			runCount,
			targetPath,
		});
	} finally {
		git(["switch", branch], { cwd });
	}
}

function runGuardScripts({ cwd, scripts }) {
	return Object.fromEntries(
		scripts.map((script) => {
			const result = runCommand("npm", ["run", script], {
				allowFailure: true,
				cwd,
			});
			return [
				`script:${script}`,
				{
					exitCode: result.status,
					pass: result.status === 0,
				},
			];
		}),
	);
}

async function runPairBlock({
	acceptedHead,
	benchmark,
	branch,
	candidateHead,
	cwd,
	label,
	logLines,
	phase,
	readySelector,
	runtimePaths,
	targetPath,
}) {
	const controlPath = path.join(runtimePaths.baseDir, `${phase}-control.json`);
	const candidatePath = path.join(
		runtimePaths.baseDir,
		`${phase}-candidate.json`,
	);
	const common = {
		branch,
		cwd,
		logLines,
		readySelector,
		runCount: benchmark.pairedSampleCount,
		targetPath,
	};
	const controlPayload = await measureRevision({
		...common,
		label: `${label} ${phase} control`,
		outputPath: controlPath,
		revision: acceptedHead,
	});
	const candidatePayload = await measureRevision({
		...common,
		label: `${label} ${phase} candidate`,
		outputPath: candidatePath,
		revision: candidateHead,
	});
	const guardResults = runGuardScripts({
		cwd,
		scripts: benchmark.guardScripts ?? [],
	});
	const environmentFingerprint = compareBenchmarkEnvironments(
		controlPayload,
		candidatePayload,
	);
	const evaluation = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload,
		controlPayload,
		guardResults,
	});
	const evidence = {
		artifacts: { candidate: candidatePath, control: controlPath },
		candidate: {
			environment: candidatePayload.environment,
			samples: evaluation.candidateSamples,
		},
		control: {
			environment: controlPayload.environment,
			samples: evaluation.controlSamples,
		},
		environmentFingerprint,
		evaluation,
		phase,
		recordedAt: new Date().toISOString(),
		schemaVersion: 2,
	};
	await appendJsonLine(runtimePaths.benchmarkRunsPath, evidence);
	return { candidatePayload, controlPayload, evaluation, evidence };
}

async function writeRunLog(runtimePaths, logLines) {
	await fs.mkdir(path.dirname(runtimePaths.runLogPath), { recursive: true });
	await fs.writeFile(
		runtimePaths.runLogPath,
		`${logLines.filter(Boolean).join("\n\n")}\n`,
		"utf8",
	);
}

async function writeStateAndReport(runtimePaths, state) {
	await writeJsonFile(runtimePaths.statePath, state);
	if (TERMINAL_BENCHMARK_STATUSES.has(state.status)) {
		await fs.writeFile(
			runtimePaths.finalReportPath,
			buildBenchmarkFinalReport(state),
			"utf8",
		);
		return;
	}
	await fs.rm(runtimePaths.finalReportPath, { force: true });
}

function decisionReason(evaluation) {
	if (!evaluation.guardsPass) {
		return `Hard guard failure: ${evaluation.failedGuards.join(", ")}.`;
	}
	if (!evaluation.primaryPass) {
		return `Median p95 improved by ${evaluation.absoluteDelta}ms; required ${evaluation.minimumDeltaMs}ms.`;
	}
	return `Median p95 improved by ${evaluation.absoluteDelta}ms (${(
		evaluation.relativeDelta * 100
	).toFixed(2)}%) with every guard passing.`;
}

function resetToAccepted(cwd, acceptedHead) {
	git(["reset", "--hard", acceptedHead], { cwd });
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.flags.has("help")) {
		printUsage();
		return;
	}

	const tag = sanitizeTag(readString(args.values, "tag"));
	const repoRoot = getRepoRoot(process.cwd());
	const runtimePaths = resolveAutoresearchRuntimePaths({ cwd: repoRoot, tag });
	const state = await readJsonFile(runtimePaths.statePath);
	const currentBranch = git(["branch", "--show-current"], {
		cwd: repoRoot,
	}).stdout.trim();
	if (currentBranch !== state.branch) {
		throw new Error(
			`This worktree is on ${currentBranch || "detached HEAD"}, but state expects ${state.branch}.`,
		);
	}
	if (TERMINAL_BENCHMARK_STATUSES.has(state.status)) {
		throw new Error(`Benchmark is already terminal: ${state.status}.`);
	}
	requireCleanWorkingTree(repoRoot);

	const currentHead = git(["rev-parse", "HEAD"], {
		cwd: repoRoot,
	}).stdout.trim();
	const currentCommit = git(["rev-parse", "--short", "HEAD"], {
		cwd: repoRoot,
	}).stdout.trim();
	const commitLabel =
		readString(args.values, "label") ??
		git(["log", "-1", "--pretty=%s"], { cwd: repoRoot }).stdout.trim() ??
		currentCommit;
	const logLines = [
		`# ${new Date().toISOString()} paired scroll benchmark`,
		`tag: ${tag}`,
		`branch: ${currentBranch}`,
		`head: ${currentHead}`,
		`target_path: ${state.targetPath}`,
	];

	if (state.accepted.metrics === null) {
		if (currentHead !== state.accepted.head) {
			throw new Error(
				"Baseline scoring must run at the accepted setup commit before candidate commits.",
			);
		}
		const payload = await scoreMeasurement({
			cwd: repoRoot,
			label: `${commitLabel} baseline`,
			logLines,
			outputPath: runtimePaths.latestMeasurementPath,
			readySelector: state.readySelector,
			runCount: state.benchmark.pairedSampleCount,
			targetPath: state.targetPath,
		});
		const samples = payload.runs.map(
			(run) => run[state.benchmark.primaryMetric],
		);
		const baselineValue = aggregateMetricSamples(
			samples,
			state.benchmark.aggregation,
		);
		const recordedAt = new Date().toISOString();
		state.accepted = {
			...state.accepted,
			establishedAt: recordedAt,
			label: commitLabel,
			metrics: payload.aggregate,
		};
		state.initialBaseline = {
			environmentFingerprint: payload.environment.fingerprint,
			metric: state.benchmark.primaryMetric,
			samples,
			value: baselineValue,
		};
		state.lastDecision = {
			at: recordedAt,
			decision: "baseline",
			value: baselineValue,
		};
		await appendJsonLine(runtimePaths.resultsPath, {
			decision: "baseline",
			head: currentHead,
			metric: state.benchmark.primaryMetric,
			recordedAt,
			runs: samples,
			value: baselineValue,
		});
		await writeStateAndReport(runtimePaths, state);
		await writeRunLog(runtimePaths, logLines);
		console.log(
			`Established ${samples.length}-sample baseline ${currentCommit}: ${summarizeScrollPerformanceResult(payload.aggregate)}.`,
		);
		return;
	}

	const nextPass = Number(state.completedPasses ?? 0) + 1;
	if (nextPass > Number(state.passLimit ?? 0)) {
		state.status = "exhausted";
		await writeStateAndReport(runtimePaths, state);
		throw new Error(`Pass limit reached (${state.passLimit}).`);
	}
	const commitsAhead = Number.parseInt(
		git(["rev-list", "--count", `${state.accepted.head}..HEAD`], {
			cwd: repoRoot,
		}).stdout.trim(),
		10,
	);
	if (commitsAhead !== 1) {
		throw new Error(
			`Expected exactly one candidate commit ahead of ${state.accepted.commit}; found ${commitsAhead}.`,
		);
	}
	const changedFiles = git(
		["diff", "--name-only", `${state.accepted.head}..HEAD`],
		{ cwd: repoRoot },
	)
		.stdout.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const unauthorizedPaths = getUnauthorizedPaths(
		changedFiles,
		state.mutableScopeAllowlist ?? [],
	);
	if (unauthorizedPaths.length > 0) {
		throw new Error(
			`Candidate touched files outside the mutable allowlist:\n${unauthorizedPaths.join("\n")}`,
		);
	}

	let measurement;
	try {
		measurement = await runPairBlock({
			acceptedHead: state.accepted.head,
			benchmark: state.benchmark,
			branch: currentBranch,
			candidateHead: currentHead,
			cwd: repoRoot,
			label: commitLabel,
			logLines,
			phase: "measurement",
			readySelector: state.readySelector,
			runtimePaths,
			targetPath: state.targetPath,
		});
	} catch (error) {
		state.status = "blocked";
		state.invalidationReason =
			error instanceof Error ? error.message : String(error);
		resetToAccepted(repoRoot, state.accepted.head);
		await writeStateAndReport(runtimePaths, state);
		throw error;
	}

	state.completedPasses = nextPass;
	if (!measurement.evaluation.keep) {
		const reason = decisionReason(measurement.evaluation);
		const decision = measurement.evaluation.guardsPass ? "discard" : "gate";
		state.lastDecision = { at: new Date().toISOString(), decision, reason };
		state.status = nextPass >= state.passLimit ? "exhausted" : "running";
		resetToAccepted(repoRoot, state.accepted.head);
		await appendJsonLine(runtimePaths.resultsPath, {
			changedFiles,
			decision,
			evaluation: measurement.evaluation,
			pass: nextPass,
			reason,
		});
		await writeStateAndReport(runtimePaths, state);
		await writeRunLog(runtimePaths, logLines);
		console.log(`${decision.toUpperCase()} ${currentCommit}: ${reason}`);
		return;
	}

	state.status = "provisional";
	state.provisionalCandidate = {
		head: currentHead,
		label: commitLabel,
		measurement: measurement.evaluation,
		pass: nextPass,
	};
	state.invalidationReason = null;
	await writeStateAndReport(runtimePaths, state);

	let confirmation;
	try {
		confirmation = await runPairBlock({
			acceptedHead: state.accepted.head,
			benchmark: state.benchmark,
			branch: currentBranch,
			candidateHead: currentHead,
			cwd: repoRoot,
			label: commitLabel,
			logLines,
			phase: "confirmation",
			readySelector: state.readySelector,
			runtimePaths,
			targetPath: state.targetPath,
		});
		compareBenchmarkEnvironments(
			measurement.controlPayload,
			measurement.candidatePayload,
			confirmation.controlPayload,
			confirmation.candidatePayload,
		);
	} catch (error) {
		state.status = "blocked";
		state.provisionalCandidate = null;
		state.invalidationReason =
			error instanceof Error ? error.message : String(error);
		resetToAccepted(repoRoot, state.accepted.head);
		await writeStateAndReport(runtimePaths, state);
		throw error;
	}

	if (!confirmation.evaluation.keep) {
		const reason = `Independent confirmation failed: ${decisionReason(
			confirmation.evaluation,
		)}`;
		state.invalidationReason = reason;
		state.lastDecision = {
			at: new Date().toISOString(),
			decision: "invalidated",
			reason,
		};
		state.provisionalCandidate = null;
		state.status = nextPass >= state.passLimit ? "exhausted" : "running";
		resetToAccepted(repoRoot, state.accepted.head);
		await appendJsonLine(runtimePaths.resultsPath, {
			changedFiles,
			confirmation: confirmation.evaluation,
			decision: "invalidated",
			measurement: measurement.evaluation,
			pass: nextPass,
			reason,
		});
		await writeStateAndReport(runtimePaths, state);
		await writeRunLog(runtimePaths, logLines);
		console.log(`INVALIDATED ${currentCommit}: ${reason}`);
		return;
	}

	const recordedAt = new Date().toISOString();
	const initialValue = state.initialBaseline.value;
	const confirmedValue = confirmation.evaluation.candidate;
	const relativeImprovement =
		initialValue > 0 ? (initialValue - confirmedValue) / initialValue : 0;
	state.accepted = {
		commit: currentCommit,
		establishedAt: recordedAt,
		head: currentHead,
		label: commitLabel,
		metrics: confirmation.candidatePayload.aggregate,
	};
	state.confirmedMetric = {
		metric: state.benchmark.primaryMetric,
		relativeImprovement,
		value: confirmedValue,
	};
	state.invalidationReason = null;
	state.lastDecision = {
		at: recordedAt,
		decision: "keep",
		reason: decisionReason(confirmation.evaluation),
	};
	state.provisionalCandidate = null;
	const targetMet =
		typeof state.benchmark.targetP95Ms === "number" &&
		confirmedValue <= state.benchmark.targetP95Ms;
	state.status = targetMet
		? "succeeded"
		: nextPass >= state.passLimit
			? "exhausted"
			: "running";
	await appendJsonLine(runtimePaths.resultsPath, {
		changedFiles,
		confirmation: confirmation.evaluation,
		decision: "keep",
		measurement: measurement.evaluation,
		pass: nextPass,
		recordedAt,
		status: state.status,
	});
	await writeStateAndReport(runtimePaths, state);
	await writeRunLog(runtimePaths, logLines);
	console.log(
		`KEPT ${currentCommit}: ${decisionReason(confirmation.evaluation)}`,
	);
	console.log(`Benchmark status: ${state.status}.`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
