import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
	preflightProject,
	readConfig,
	validateConfig,
} from "../scripts/publish-project.mjs";

const validConfig = {
	schemaVersion: 1,
	gitlab: {
		host: "gitlab.com",
		namespace: "averloco",
		visibility: "private",
		protocol: "https",
		remote: "origin",
	},
	vercel: { team: "averloco", deployment: "production" },
	confirmBeforePublish: true,
};

async function writeConfig(tempRoot, config = validConfig) {
	const configPath = path.join(tempRoot, "publish-project.json");
	await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, {
		mode: 0o600,
	});
	await fs.chmod(configPath, 0o600);
	return configPath;
}

async function createProject(tempRoot) {
	const projectRoot = path.join(tempRoot, "sample-project");
	for (const relativePath of ["PRODUCT.md", "docs/README.md"]) {
		const target = path.join(projectRoot, relativePath);
		await fs.mkdir(path.dirname(target), { recursive: true });
		await fs.writeFile(target, "# Test\n");
	}
	await fs.writeFile(
		path.join(projectRoot, "package.json"),
		'{"name":"sample-project"}\n',
	);
	await fs.writeFile(
		path.join(projectRoot, ".template-profile.json"),
		'{"schemaVersion":2,"profile":"thin-start","content":"static"}\n',
	);
	execFileSync("git", ["init", "-b", "main"], { cwd: projectRoot });
	execFileSync("git", ["config", "user.name", "Test User"], {
		cwd: projectRoot,
	});
	execFileSync("git", ["config", "user.email", "test@example.com"], {
		cwd: projectRoot,
	});
	execFileSync("git", ["add", "-A"], { cwd: projectRoot });
	execFileSync("git", ["commit", "-m", "Initial project"], {
		cwd: projectRoot,
	});
	return projectRoot;
}

test("validates private production configuration", () => {
	assert.deepEqual(validateConfig(validConfig), validConfig);
	assert.throws(
		() =>
			validateConfig({
				...validConfig,
				gitlab: { ...validConfig.gitlab, visibility: "public" },
			}),
		/gitlab\.visibility must be private/,
	);
	assert.throws(
		() => validateConfig({ ...validConfig, confirmBeforePublish: false }),
		/confirmBeforePublish must be true/,
	);
	assert.throws(
		() =>
			validateConfig({
				...validConfig,
				gitlab: { ...validConfig.gitlab, namespace: "averloco/../personal" },
			}),
		/gitlab\.namespace is invalid/,
	);
});

test("requires owner-only configuration permissions", async () => {
	const tempRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "publish-config-test-"),
	);
	try {
		const configPath = await writeConfig(tempRoot);
		assert.deepEqual((await readConfig(configPath)).config, validConfig);
		if (process.platform !== "win32") {
			await fs.chmod(configPath, 0o644);
			await assert.rejects(readConfig(configPath), /owner-only/);
		}
	} finally {
		await fs.rm(tempRoot, { recursive: true, force: true });
	}
});

test("preflights an unlinked clean Averlo project", async () => {
	const tempRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "publish-project-test-"),
	);
	try {
		const configPath = await writeConfig(tempRoot);
		const projectRoot = await createProject(tempRoot);
		const result = await preflightProject({ projectRoot, configPath });
		assert.equal(result.projectName, "sample-project");
		assert.equal(result.gitlab.repository, "averloco/sample-project");
		assert.equal(
			result.gitlab.repositoryUrl,
			"https://gitlab.com/averloco/sample-project.git",
		);
		assert.equal(result.vercel.team, "averloco");
		assert.equal(result.vercel.deployment, "production");
		assert.equal(result.confirmationRequired, true);
	} finally {
		await fs.rm(tempRoot, { recursive: true, force: true });
	}
});

test("rejects existing remotes and dirty projects", async () => {
	const tempRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "publish-project-reject-"),
	);
	try {
		const configPath = await writeConfig(tempRoot);
		const projectRoot = await createProject(tempRoot);
		execFileSync(
			"git",
			["remote", "add", "origin", "https://example.com/existing.git"],
			{
				cwd: projectRoot,
			},
		);
		await assert.rejects(
			preflightProject({ projectRoot, configPath }),
			/already has a Git remote/,
		);
		execFileSync("git", ["remote", "remove", "origin"], { cwd: projectRoot });
		await fs.writeFile(path.join(projectRoot, "uncommitted.txt"), "dirty\n");
		await assert.rejects(
			preflightProject({ projectRoot, configPath }),
			/must be clean/,
		);
	} finally {
		await fs.rm(tempRoot, { recursive: true, force: true });
	}
});
