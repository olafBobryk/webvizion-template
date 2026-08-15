#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const templateRoot = process.cwd();
const packageRoot = path.join(templateRoot, "packages/create-averlo");
const sourceBin = path.join(packageRoot, "bin/create-averlo.mjs");
const integration = process.argv.includes("--integration");

function run(command, args, cwd, options = {}) {
	const result = spawnSync(command, args, {
		cwd,
		env: { ...process.env, ...options.env },
		encoding: options.silent ? "utf8" : undefined,
		stdio: options.silent ? ["ignore", "pipe", "pipe"] : "inherit",
	});
	if (result.error) throw result.error;
	if (!options.allowFailure && result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} exited ${result.status}.`);
	}
	return result;
}

async function readJson(filePath) {
	return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function exists(filePath) {
	return fs
		.access(filePath)
		.then(() => true)
		.catch(() => false);
}

function git(args, cwd) {
	return run("git", args, cwd, { silent: true }).stdout.trim();
}

async function verifyInterruptedCleanup(tempRoot) {
	const fakeTemplateRoot = path.join(tempRoot, "interrupt-template");
	const fakeCreator = path.join(
		fakeTemplateRoot,
		"scripts/create-template-profile.mjs",
	);
	await fs.mkdir(path.dirname(fakeCreator), { recursive: true });
	await fs.writeFile(fakeCreator, "setTimeout(() => {}, 30_000);\n");
	const interruptedRoot = path.join(tempRoot, "interrupted-project");
	const child = spawn(
		process.execPath,
		[
			sourceBin,
			interruptedRoot,
			"--profile",
			"thin-start",
			"--content",
			"static",
		],
		{
			cwd: templateRoot,
			env: {
				...process.env,
				CREATE_AVERLO_TEMPLATE_ROOT: fakeTemplateRoot,
			},
			stdio: "ignore",
		},
	);
	const exitPromise = new Promise((resolve, reject) => {
		child.once("error", reject);
		child.once("exit", resolve);
	});
	await new Promise((resolve) => setTimeout(resolve, 500));
	child.kill("SIGINT");
	const exitCode = await exitPromise;
	if (exitCode === 0 || (await exists(interruptedRoot))) {
		throw new Error("Interrupted initialization left a project destination.");
	}
	const stagingEntries = (await fs.readdir(tempRoot)).filter((entry) =>
		entry.startsWith(".create-averlo-interrupted-project-"),
	);
	if (stagingEntries.length > 0) {
		throw new Error("Interrupted initialization left a staging directory.");
	}
}

async function assertGeneratedProject(targetRoot, { installed }) {
	const pkg = await readJson(path.join(targetRoot, "package.json"));
	if (pkg.name !== path.basename(targetRoot)) {
		throw new Error(`Generated package name is ${pkg.name}.`);
	}
	const receipt = await readJson(
		path.join(targetRoot, ".template-profile.json"),
	);
	if (receipt.profile !== "thin-start" || receipt.content !== "static") {
		throw new Error("Generated profile receipt is incorrect.");
	}
	for (const requiredPath of [
		"PRODUCT.md",
		"docs/README.md",
		"package-lock.json",
	]) {
		if (!(await exists(path.join(targetRoot, requiredPath)))) {
			throw new Error(`Generated project is missing ${requiredPath}.`);
		}
	}
	for (const retiredPath of [
		"docs/project/README.md",
		"docs/project/source/README.md",
	]) {
		if (await exists(path.join(targetRoot, retiredPath))) {
			throw new Error(`Generated project retained ${retiredPath}.`);
		}
	}
	if ((await exists(path.join(targetRoot, "node_modules"))) !== installed) {
		throw new Error(
			`Generated dependency installation state does not match installed=${installed}.`,
		);
	}
	if (git(["branch", "--show-current"], targetRoot) !== "main") {
		throw new Error("Generated project is not on main.");
	}
	if (git(["rev-list", "--count", "HEAD"], targetRoot) !== "1") {
		throw new Error("Generated project does not have one initial commit.");
	}
	if (git(["remote"], targetRoot) !== "") {
		throw new Error("Generated project unexpectedly has a remote.");
	}
	if (git(["status", "--porcelain"], targetRoot) !== "") {
		throw new Error("Generated project is not clean.");
	}
}

async function main() {
	const tempRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "verify-create-averlo-"),
	);
	const resolvedTemp = path.resolve(tempRoot);
	if (!resolvedTemp.startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)) {
		throw new Error(`Unsafe verifier temp root: ${resolvedTemp}`);
	}
	try {
		run("npm", ["test"], packageRoot);
		run("npm", ["run", "build:metadata"], packageRoot, {
			env: { CREATE_AVERLO_ALLOW_DIRTY_PACK: "1" },
		});
		run("npm", ["pack", "--dry-run"], packageRoot, {
			env: { CREATE_AVERLO_ALLOW_DIRTY_PACK: "1" },
		});
		const packResult = run(
			"npm",
			["pack", "--pack-destination", tempRoot],
			packageRoot,
			{
				env: { CREATE_AVERLO_ALLOW_DIRTY_PACK: "1" },
				silent: true,
			},
		);
		const filename = packResult.stdout.trim().split("\n").at(-1);
		if (!filename?.endsWith(".tgz")) {
			throw new Error("npm pack did not report a tarball filename.");
		}
		const tarball = path.join(tempRoot, filename);
		const generatedRoot = path.join(tempRoot, "packed-smoke");
		run(
			"npm",
			[
				"exec",
				"--yes",
				"--package",
				tarball,
				"--",
				"create-averlo",
				generatedRoot,
				"--profile",
				"thin-start",
				"--content",
				"static",
				"--no-install",
			],
			templateRoot,
			{ env: { CREATE_AVERLO_TEMPLATE_ROOT: templateRoot } },
		);
		await assertGeneratedProject(generatedRoot, { installed: false });

		const existing = run(
			process.execPath,
			[
				sourceBin,
				generatedRoot,
				"--profile",
				"thin-start",
				"--content",
				"static",
				"--no-install",
			],
			templateRoot,
			{
				allowFailure: true,
				env: { CREATE_AVERLO_TEMPLATE_ROOT: templateRoot },
				silent: true,
			},
		);
		if (
			existing.status === 0 ||
			!existing.stderr.includes("Target already exists")
		) {
			throw new Error("Existing target was not rejected.");
		}
		await assertGeneratedProject(generatedRoot, { installed: false });

		const metadata = await readJson(
			path.join(packageRoot, "dist/template-metadata.json"),
		);
		metadata.sourceDirty = false;
		const failureMetadataPath = path.join(tempRoot, "failure-metadata.json");
		await fs.writeFile(
			failureMetadataPath,
			`${JSON.stringify(metadata, null, 2)}\n`,
		);
		const cloneFailureRoot = path.join(tempRoot, "clone-failure");
		const cloneFailure = run(
			process.execPath,
			[
				sourceBin,
				cloneFailureRoot,
				"--profile",
				"thin-start",
				"--content",
				"static",
				"--no-install",
			],
			templateRoot,
			{
				allowFailure: true,
				env: {
					CREATE_AVERLO_METADATA_PATH: failureMetadataPath,
					CREATE_AVERLO_TEMPLATE_REPOSITORY: path.join(tempRoot, "missing.git"),
				},
				silent: true,
			},
		);
		if (cloneFailure.status === 0 || (await exists(cloneFailureRoot))) {
			throw new Error("Clone failure left a project destination.");
		}

		const fakeBin = path.join(tempRoot, "fake-bin");
		await fs.mkdir(fakeBin);
		const fakeNpm = path.join(fakeBin, "npm");
		await fs.writeFile(fakeNpm, "#!/bin/sh\nexit 42\n");
		await fs.chmod(fakeNpm, 0o700);
		const installFailureRoot = path.join(tempRoot, "install-failure");
		const installFailure = run(
			process.execPath,
			[
				sourceBin,
				installFailureRoot,
				"--profile",
				"thin-start",
				"--content",
				"static",
			],
			templateRoot,
			{
				allowFailure: true,
				env: {
					CREATE_AVERLO_TEMPLATE_ROOT: templateRoot,
					PATH: `${fakeBin}${path.delimiter}${process.env.PATH ?? ""}`,
				},
				silent: true,
			},
		);
		if (installFailure.status === 0 || (await exists(installFailureRoot))) {
			throw new Error("Install failure left a project destination.");
		}
		await verifyInterruptedCleanup(tempRoot);

		if (integration) {
			const installedRoot = path.join(tempRoot, "installed-smoke");
			run(
				process.execPath,
				[
					sourceBin,
					installedRoot,
					"--profile",
					"thin-start",
					"--content",
					"static",
				],
				templateRoot,
				{ env: { CREATE_AVERLO_TEMPLATE_ROOT: templateRoot } },
			);
			await assertGeneratedProject(installedRoot, { installed: true });
		}

		console.log(
			integration
				? "create-averlo package and installed-project verification passed."
				: "create-averlo package verification passed.",
		);
	} finally {
		await fs.rm(resolvedTemp, { force: true, recursive: true });
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
