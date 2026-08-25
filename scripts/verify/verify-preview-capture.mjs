#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {
	buildCaptureUrls,
	captureRoute,
	parseArgs,
} from "../preview-capture.mjs";

const fixtureHtml = `<!doctype html>
<html>
	<head>
		<title>Preview capture fixture</title>
		<style>
			html, body { margin: 0; }
			body { min-height: 1800px; font-family: sans-serif; }
			header { position: sticky; top: 0; height: 80px; background: white; }
			.hidden { display: none; }
			main { min-height: 1500px; }
			#accessibility { margin-top: 900px; }
			footer { height: 220px; }
		</style>
	</head>
	<body>
		<header>Fixture header <span class="hidden">Terminal landmark</span></header>
		<main>
			<h1>Settings</h1>
			<section id="accessibility">Accessibility</section>
		</main>
		<footer>Terminal landmark</footer>
	</body>
</html>`;

async function listen() {
	const server = http.createServer((_request, response) => {
		response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		response.end(fixtureHtml);
	});
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	return {
		close: () => new Promise((resolve) => server.close(resolve)),
		url: `http://127.0.0.1:${address.port}`,
	};
}

const parsed = parseArgs([
	"--route",
	"/settings?tab=display#accessibility",
	"--expect",
	"Settings",
	"--expect",
	"Accessibility",
	"--expect",
	"Terminal landmark",
	"--review",
	"composition",
]);
assert.deepEqual(parsed.expects, [
	"Settings",
	"Accessibility",
	"Terminal landmark",
]);
assert.equal(parsed.width, 1440);
assert.equal(parsed.height, 900);
assert.equal(parsed.review, "composition");

const built = buildCaptureUrls({
	automationUrl: "http://localhost:3000?motion=off&reveal=off",
	baseUrl: "http://192.168.1.20:3000",
	localUrl: "http://localhost:3000",
	review: "composition",
	route: "/settings?tab=display#accessibility",
});
assert.equal(
	built.humanUrl,
	"http://192.168.1.20:3000/settings?tab=display#accessibility",
);
assert.equal(
	built.captureUrl,
	"http://192.168.1.20:3000/settings?tab=display&motion=off&reveal=off&loading=off&review=composition#accessibility",
);

const fixtureRoot = await fs.mkdtemp(
	path.join(os.tmpdir(), "averlo-preview-capture-"),
);
const server = await listen();

try {
	await fs.mkdir(path.join(fixtureRoot, ".codex"), { recursive: true });
	await fs.writeFile(
		path.join(fixtureRoot, ".codex", "preview.json"),
		`${JSON.stringify({
			automationUrl: `${server.url}?motion=off&reveal=off`,
			localUrl: server.url,
			pid: process.pid,
			root: fixtureRoot,
		})}\n`,
	);

	const result = await captureRoute(
		{
			...parsed,
			output: ".codex/preview-artifacts/fixture.png",
			settleMs: 50,
			timeoutMs: 10_000,
		},
		{ root: fixtureRoot },
	);

	assert.equal(result.human.status, 200);
	assert.equal(
		result.human.finalUrl,
		`${server.url}/settings?tab=display#accessibility`,
	);
	assert.deepEqual(result.human.landmarks, ["Settings"]);
	assert.equal(result.capture.scrollY, 0);
	assert.equal(result.capture.visibleBlockingOverlays, 0);
	assert.equal(result.screenshot.width, 1440);
	assert.equal(result.screenshot.height, result.capture.documentHeight);
	assert.ok(result.screenshot.height > 900);
	assert.deepEqual(result.capture.landmarks, [
		"Settings",
		"Accessibility",
		"Terminal landmark",
	]);
	await fs.access(result.outputPath);
} finally {
	await server.close();
	await fs.rm(fixtureRoot, { force: true, recursive: true });
}

console.log("Preview capture verification passed.");
