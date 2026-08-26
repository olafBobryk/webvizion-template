#!/usr/bin/env node

import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const EMPTY_RESULT = "{}";
const MAX_CONSUMED_TOKENS = 500;

function field(source, label) {
	const match = source.match(new RegExp(`^${label}:\\s*(.+?)\\s*$`, "mu"));
	return match?.[1]?.trim() ?? null;
}

function isNone(value) {
	return !value || /^(?:none|not applicable)$/iu.test(value);
}

async function readInput() {
	let source = "";
	for await (const chunk of process.stdin) source += chunk;
	return JSON.parse(source || "{}");
}

async function newestFocusPacket(cwd, sessionId) {
	const root = path.join(cwd, ".codex", "visual-parity");
	let taskDirectories;
	try {
		taskDirectories = await readdir(root, { withFileTypes: true });
	} catch {
		return null;
	}

	const candidates = [];
	for (const entry of taskDirectories) {
		if (!entry.isDirectory()) continue;
		const packetPath = path.join(root, entry.name, "focus.md");
		try {
			const [source, details] = await Promise.all([
				readFile(packetPath, "utf8"),
				stat(packetPath),
			]);
			if (field(source, "Workflow owner") !== "compose") continue;
			if (field(source, "Thread identity") !== sessionId) continue;
			candidates.push({ packetPath, source, modifiedAt: details.mtimeMs });
		} catch {
			// A missing or unreadable packet cannot authorize continuation.
		}
	}

	candidates.sort((left, right) => right.modifiedAt - left.modifiedAt);
	return candidates[0] ?? null;
}

async function readConsumed(statePath) {
	try {
		const value = JSON.parse(await readFile(statePath, "utf8"));
		return value && typeof value === "object" && !Array.isArray(value)
			? value
			: {};
	} catch {
		return {};
	}
}

async function consumeToken(pluginData, key) {
	await mkdir(pluginData, { recursive: true });
	const statePath = path.join(pluginData, "compose-continuations.json");
	const consumed = await readConsumed(statePath);
	if (consumed[key]) return false;

	consumed[key] = new Date().toISOString();
	const entries = Object.entries(consumed).slice(-MAX_CONSUMED_TOKENS);
	const next = Object.fromEntries(entries);
	const temporaryPath = `${statePath}.${process.pid}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
	await rename(temporaryPath, statePath);
	return true;
}

async function main() {
	const input = await readInput();
	if (input.hook_event_name !== "Stop") return EMPTY_RESULT;

	const sessionId = input.session_id;
	const cwd = input.cwd;
	const pluginData = process.env.PLUGIN_DATA;
	if (!sessionId || !cwd || !pluginData) return EMPTY_RESULT;

	const packet = await newestFocusPacket(cwd, sessionId);
	if (!packet) return EMPTY_RESULT;

	const boundary = field(packet.source, "Section boundary");
	const nextCase = field(packet.source, "Next case");
	const token = field(packet.source, "Continuation token");
	const incompletion = field(packet.source, "- Incompletion");
	if (isNone(boundary) || isNone(nextCase) || isNone(token)) return EMPTY_RESULT;
	if (incompletion && !isNone(incompletion)) return EMPTY_RESULT;

	const consumed = await consumeToken(pluginData, `${sessionId}:${token}`);
	if (!consumed) return EMPTY_RESULT;

	return JSON.stringify({
		decision: "block",
		reason:
			`Continue $averlo:compose with case ${nextCase}. ` +
			`First make it active in ${packet.packetPath}, clear the consumed section boundary, ` +
			"then reload the focus packet, matrix row, Compose, and this case's routed references before editing.",
	});
}

try {
	process.stdout.write(await main());
} catch {
	// Hook failure must never continue an unrelated task or create a loop.
	process.stdout.write(EMPTY_RESULT);
}
