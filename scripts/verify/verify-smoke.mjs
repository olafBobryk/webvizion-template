#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
	startLocalProductionServer,
	stopServer,
} from "../_lib/local-production-preview.mjs";

const REQUEST_TIMEOUT_MS = 10_000;

async function pathExists(relativePath) {
	try {
		await fs.access(path.join(process.cwd(), relativePath));
		return true;
	} catch {
		return false;
	}
}

async function getExpectations() {
	const hasMarketing = await pathExists(
		"src/app/(site)/(marketing)/(home)/page.tsx",
	);
	const hasDashboard = await pathExists("src/app/(site)/dashboard/page.tsx");
	const expectations = [
		{
			route: "/",
			statuses: hasMarketing ? new Set([200]) : new Set([307, 308]),
		},
		{ route: "/api/health", statuses: new Set([200, 503]) },
	];

	if (hasDashboard) {
		expectations.push({ route: "/login", statuses: new Set([200]) });
	}
	return expectations;
}

async function fetchWithTimeout(url) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		return await fetch(url, { redirect: "manual", signal: controller.signal });
	} finally {
		clearTimeout(timeout);
	}
}

async function validateResponse(baseUrl, expectation) {
	const response = await fetchWithTimeout(new URL(expectation.route, baseUrl));
	if (!expectation.statuses.has(response.status)) {
		throw new Error(
			`${expectation.route} returned HTTP ${response.status}; expected ${[...expectation.statuses].join(" or ")}.`,
		);
	}

	if (response.status >= 300 && response.status < 400) {
		const location = response.headers.get("location");
		if (!location) {
			throw new Error(
				`${expectation.route} redirected without a Location header.`,
			);
		}
		console.log(`ok ${expectation.route} ${response.status} -> ${location}`);
		return;
	}

	const body = await response.text();
	if (body.trim().length === 0) {
		throw new Error(`${expectation.route} returned an empty response body.`);
	}
	console.log(`ok ${expectation.route} ${response.status}`);
}

async function start() {
	const expectations = await getExpectations();
	const { baseUrl, child } = await startLocalProductionServer();
	try {
		console.log(`Starting smoke server at ${baseUrl}`);
		for (const expectation of expectations) {
			await validateResponse(baseUrl, expectation);
		}
		console.log("Smoke verification passed.");
	} finally {
		await stopServer(child);
	}
}

start().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
