import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { runCommand } from "./process.mjs";

const DEFAULT_TEMPLATE_REPOSITORY =
	"https://github.com/olafBobryk/averlo-next-template.git";

async function pathExists(targetPath) {
	return fs
		.access(targetPath)
		.then(() => true)
		.catch(() => false);
}

async function assertTemplateRoot(templateRoot) {
	const creator = path.join(
		templateRoot,
		"scripts/create-template-profile.mjs",
	);
	if (!(await pathExists(creator))) {
		throw new Error(`Template creator was not found at ${creator}.`);
	}
}

async function fetchTemplate({ metadata, tempRoot, env, run }) {
	const configuredRoot = env.CREATE_AVERLO_TEMPLATE_ROOT;
	if (configuredRoot) {
		const templateRoot = path.resolve(configuredRoot);
		await assertTemplateRoot(templateRoot);
		return templateRoot;
	}
	if (metadata.sourceDirty || !/^[0-9a-f]{40}$/.test(metadata.templateCommit)) {
		throw new Error(
			"This create-averlo package was not built from a clean pinned template commit.",
		);
	}
	const templateRoot = path.join(tempRoot, "template");
	await fs.mkdir(templateRoot, { recursive: true });
	await run("git", ["init"], { cwd: templateRoot, env });
	await run(
		"git",
		[
			"remote",
			"add",
			"origin",
			env.CREATE_AVERLO_TEMPLATE_REPOSITORY ??
				metadata.repository ??
				DEFAULT_TEMPLATE_REPOSITORY,
		],
		{ cwd: templateRoot, env },
	);
	await run(
		"git",
		["fetch", "--depth", "1", "origin", metadata.templateCommit],
		{
			cwd: templateRoot,
			env,
		},
	);
	await run("git", ["checkout", "--detach", "FETCH_HEAD"], {
		cwd: templateRoot,
		env,
	});
	await assertTemplateRoot(templateRoot);
	return templateRoot;
}

async function verifyInitializedRepository(workspaceRoot, env, run) {
	const [
		{ stdout: branch },
		{ stdout: remotes },
		{ stdout: status },
		{ stdout: commits },
	] = await Promise.all([
		run("git", ["branch", "--show-current"], {
			capture: true,
			cwd: workspaceRoot,
			env,
		}),
		run("git", ["remote"], {
			capture: true,
			cwd: workspaceRoot,
			env,
		}),
		run("git", ["status", "--porcelain"], {
			capture: true,
			cwd: workspaceRoot,
			env,
		}),
		run("git", ["rev-list", "--count", "HEAD"], {
			capture: true,
			cwd: workspaceRoot,
			env,
		}),
	]);
	if (branch.trim() !== "main")
		throw new Error("Initialized branch is not main.");
	if (remotes.trim())
		throw new Error("Initialized project unexpectedly has a Git remote.");
	if (status.trim())
		throw new Error("Initialized project has uncommitted files.");
	if (commits.trim() !== "1")
		throw new Error("Initialized project must have one commit.");
}

export async function createProject(options, metadata, dependencies = {}) {
	const baseRun = dependencies.run ?? runCommand;
	const env = dependencies.env ?? process.env;
	const abortController = new AbortController();
	const handleSignal = (signal) => {
		abortController.abort(new Error(`Interrupted by ${signal}.`));
	};
	const signalHandlers = ["SIGINT", "SIGTERM"].map((signal) => {
		const handler = () => handleSignal(signal);
		process.once(signal, handler);
		return [signal, handler];
	});
	const run = (command, args, commandOptions = {}) =>
		baseRun(command, args, {
			...commandOptions,
			signal: abortController.signal,
		});
	const throwIfAborted = () => abortController.signal.throwIfAborted();

	try {
		throwIfAborted();
		if (await pathExists(options.targetRoot)) {
			throw new Error(`Target already exists: ${options.targetRoot}`);
		}
		await run("git", ["--version"], { capture: true, env });
		await run("git", ["var", "GIT_AUTHOR_IDENT"], { capture: true, env });

		const targetParent = path.dirname(options.targetRoot);
		await fs.mkdir(targetParent, { recursive: true });
		const stagingContainer = await fs.mkdtemp(
			path.join(targetParent, `.create-averlo-${options.projectName}-`),
		);
		const workspaceRoot = path.join(stagingContainer, "workspace");
		const templateTempRoot = await fs.mkdtemp(
			path.join(os.tmpdir(), "create-averlo-template-"),
		);

		try {
			throwIfAborted();
			const templateRoot = await fetchTemplate({
				env,
				metadata,
				run,
				tempRoot: templateTempRoot,
			});
			const creatorArgs = [
				path.join(templateRoot, "scripts/create-template-profile.mjs"),
				"--profile",
				options.profile.id,
				"--content",
				options.content,
				"--output",
				workspaceRoot,
				"--project-name",
				options.projectName,
				"--finalize",
				options.install ? "install" : "lockfile-only",
			];
			await run(process.execPath, creatorArgs, {
				cwd: templateRoot,
				env,
			});
			throwIfAborted();

			await run("git", ["init", "-b", "main"], {
				cwd: workspaceRoot,
				env,
			});
			await run("git", ["add", "-A"], { cwd: workspaceRoot, env });
			await run("git", ["commit", "-m", "Initial project from Averlo"], {
				cwd: workspaceRoot,
				env,
			});
			await verifyInitializedRepository(workspaceRoot, env, run);
			throwIfAborted();
			if (await pathExists(options.targetRoot)) {
				throw new Error(
					`Target appeared during initialization: ${options.targetRoot}`,
				);
			}
			await fs.rename(workspaceRoot, options.targetRoot);
			return {
				branch: "main",
				content: options.content,
				installed: options.install,
				profile: options.profile.id,
				targetRoot: options.targetRoot,
				templateCommit: metadata.templateCommit,
			};
		} finally {
			await fs.rm(templateTempRoot, { force: true, recursive: true });
			await fs.rm(stagingContainer, { force: true, recursive: true });
		}
	} finally {
		for (const [signal, handler] of signalHandlers) {
			process.removeListener(signal, handler);
		}
	}
}
