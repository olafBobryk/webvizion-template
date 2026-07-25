#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const result = spawnSync(
	process.execPath,
	[
		path.join(process.cwd(), "scripts/create-template-profile.mjs"),
		"--profile",
		"thin-start",
		...process.argv.slice(2),
	],
	{ cwd: process.cwd(), stdio: "inherit" },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
