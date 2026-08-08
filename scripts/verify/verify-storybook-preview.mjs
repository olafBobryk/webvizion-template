#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { promises as fs } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

import {
	ensureStorybookPreview,
	inspectStorybookPreview,
	stopManagedStorybookPreview,
} from "../storybook-preview.mjs";

async function writeJson(filePath, value) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function listen(handler) {
	const server = http.createServer(handler);
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const address = server.address();
	return {
		close: () => {
			server.closeAllConnections();
			return new Promise((resolve) => server.close(resolve));
		},
		url: `http://127.0.0.1:${address.port}`,
	};
}

async function waitForUrl(url) {
	for (let attempts = 0; attempts < 80; attempts += 1) {
		try {
			if ((await fetch(url)).ok) return;
		} catch {
			// The child has not started listening yet.
		}
		await new Promise((resolve) => setTimeout(resolve, 25));
	}
	throw new Error(`Timed out waiting for ${url}.`);
}

async function stopChild(child) {
	if (child.exitCode !== null) return;
	const exited = once(child, "exit");
	child.kill("SIGTERM");
	await exited;
}

async function createFixture() {
	const root = await fs.realpath(
		await fs.mkdtemp(path.join(os.tmpdir(), "averlo-storybook-preview-")),
	);
	const next = await listen((_request, response) => response.end("next"));
	await writeJson(path.join(root, ".codex", "preview.json"), {
		localUrl: next.url,
		pid: process.pid,
		root,
	});
	const serverPath = path.join(root, "fake-storybook.mjs");
	await fs.writeFile(
		serverPath,
		[
			'import http from "node:http";',
			"const port = Number(process.env.PORT);",
			"http.createServer((request, response) => {",
			'  if (request.url === "/index.json") {',
			'    if (process.env.HEALTHY_INDEX === "false") { response.writeHead(500); response.end("index failed"); return; }',
			'    response.writeHead(200, { "content-type": "application/json" }); response.end(JSON.stringify({ entries: {} })); return;',
			"  }",
			'  response.end("storybook");',
			'}).listen(port, "127.0.0.1");',
		].join("\n"),
	);
	return { next, root, serverPath };
}

async function startFakeStorybook({
	root,
	serverPath,
	port,
	healthyIndex = true,
}) {
	const child = spawn(
		process.execPath,
		[serverPath, "storybook", "dev", "--port", String(port)],
		{
			cwd: root,
			env: {
				...process.env,
				HEALTHY_INDEX: healthyIndex ? "true" : "false",
				PORT: String(port),
			},
			stdio: "ignore",
		},
	);
	await waitForUrl(`http://127.0.0.1:${port}`);
	return child;
}

async function availablePort() {
	const reservation = await listen((_request, response) => response.end());
	const port = Number(new URL(reservation.url).port);
	await reservation.close();
	return port;
}

async function withFixture(run) {
	const fixture = await createFixture();
	try {
		await run(fixture);
	} finally {
		await fixture.next.close();
		await fs.rm(fixture.root, { force: true, recursive: true });
	}
}

async function expectReject(action, expected) {
	await assert.rejects(action, expected);
}

const missingRoot = await fs.realpath(
	await fs.mkdtemp(path.join(os.tmpdir(), "averlo-storybook-missing-")),
);
try {
	await expectReject(
		() => ensureStorybookPreview({ root: missingRoot }),
		/No isolated Next preview/,
	);
} finally {
	await fs.rm(missingRoot, { force: true, recursive: true });
}

await withFixture(async ({ root }) => {
	await writeJson(path.join(root, ".codex", "storybook-preview.json"), {
		pid: process.pid,
		root: `${root}-other`,
	});
	await expectReject(
		() => inspectStorybookPreview({ root }),
		/belongs to another checkout/,
	);
});

await withFixture(async ({ root }) => {
	await writeJson(path.join(root, ".codex", "storybook-preview.json"), {
		localUrl: "http://127.0.0.1:1",
		pid: 999_999,
		root,
	});
	const inspected = await inspectStorybookPreview({ root });
	assert.equal(inspected.status, "stale");
	assert.equal(inspected.state, null);
});

await withFixture(async ({ root, serverPath }) => {
	const port = await availablePort();
	const child = await startFakeStorybook({
		healthyIndex: false,
		port,
		root,
		serverPath,
	});
	try {
		await writeJson(path.join(root, ".codex", "storybook-preview.json"), {
			localUrl: `http://localhost:${port}`,
			pid: child.pid,
			root,
		});
		const inspected = await inspectStorybookPreview({ root });
		assert.equal(inspected.status, "stale");
		assert.equal(inspected.state, null);
	} finally {
		await stopChild(child);
	}
});

await withFixture(async ({ root, serverPath }) => {
	const port = await availablePort();
	const child = await startFakeStorybook({ port, root, serverPath });
	try {
		const adopted = await ensureStorybookPreview({ root });
		assert.equal(adopted.ownership, "adopted");
		assert.equal(adopted.pid, child.pid);
		const reused = await ensureStorybookPreview({ root });
		assert.equal(reused.pid, child.pid);
		await expectReject(() => stopManagedStorybookPreview({ root }), /adopted/);
	} finally {
		await stopChild(child);
	}
});

await withFixture(async ({ root, serverPath }) => {
	const first = await startFakeStorybook({
		port: await availablePort(),
		root,
		serverPath,
	});
	const second = await startFakeStorybook({
		port: await availablePort(),
		root,
		serverPath,
	});
	try {
		await expectReject(
			() => ensureStorybookPreview({ root }),
			/Multiple unmanaged Storybook instances/,
		);
	} finally {
		await Promise.all([stopChild(first), stopChild(second)]);
	}
});

await withFixture(async ({ root, serverPath }) => {
	const child = await startFakeStorybook({
		port: await availablePort(),
		root,
		serverPath,
	});
	try {
		const results = await Promise.allSettled([
			ensureStorybookPreview({ root }),
			ensureStorybookPreview({ root }),
		]);
		assert.equal(
			results.filter((result) => result.status === "fulfilled").length,
			1,
		);
		assert.equal(
			results.filter((result) => result.status === "rejected").length,
			1,
		);
		const inspected = await inspectStorybookPreview({ root });
		assert.equal(inspected.state?.pid, child.pid);
	} finally {
		await stopChild(child);
	}
});

await withFixture(async ({ root, serverPath }) => {
	const child = await startFakeStorybook({
		port: await availablePort(),
		root,
		serverPath,
	});
	await writeJson(path.join(root, ".codex", "storybook-preview.json"), {
		ownership: "managed",
		pid: child.pid,
		root,
	});
	const exited = once(child, "exit");
	await stopManagedStorybookPreview({ root });
	await exited;
	await assert.rejects(
		fs.access(path.join(root, ".codex", "storybook-preview.json")),
	);
});

console.log("Storybook preview coordinator verification passed.");
