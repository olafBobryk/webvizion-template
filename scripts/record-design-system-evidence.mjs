import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const RECEIPT_SCHEMA_VERSION = 1;

function usage() {
	return [
		"Usage:",
		"  npm run design-system:evidence -- --target <source> --owner <story> [--target ...] [--owner ...] [--quiet]",
		"",
		"The command reads governing AGENTS.md files, then owner stories, then target",
		"implementation sources. It writes a privacy-safe local receipt of that order.",
	].join("\n");
}

function parseArgs(argv) {
	const targets = [];
	const owners = [];
	let quiet = false;

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--quiet") {
			quiet = true;
			continue;
		}
		if (argument !== "--target" && argument !== "--owner") {
			throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
		}
		const value = argv[index + 1];
		if (!value || value.startsWith("--")) {
			throw new Error(`Missing value for ${argument}.\n\n${usage()}`);
		}
		(argument === "--target" ? targets : owners).push(value);
		index += 1;
	}

	if (targets.length === 0 || owners.length === 0) {
		throw new Error(
			`At least one --target and one --owner are required.\n\n${usage()}`,
		);
	}

	return { targets, owners, quiet };
}

function normalizeRepoPath(candidate) {
	const absolute = path.resolve(ROOT, candidate);
	const relative = path.relative(ROOT, absolute);
	if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`)) {
		throw new Error(`Path must resolve inside the repository: ${candidate}`);
	}
	return relative.split(path.sep).join("/");
}

async function assertFile(relativePath, description) {
	const stat = await fs
		.stat(path.join(ROOT, relativePath))
		.catch(() => undefined);
	if (!stat?.isFile()) {
		throw new Error(`${description} does not exist: ${relativePath}`);
	}
}

function digest(content) {
	return crypto.createHash("sha256").update(content).digest("hex");
}

async function governingPolicies(targets) {
	const policies = new Set();
	const rootPolicy = path.join(ROOT, "AGENTS.md");
	if ((await fs.stat(rootPolicy).catch(() => undefined))?.isFile()) {
		policies.add("AGENTS.md");
	}

	for (const target of targets) {
		let directory = path.dirname(path.join(ROOT, target));
		while (directory.startsWith(ROOT) && directory !== ROOT) {
			const policyPath = path.join(directory, "AGENTS.md");
			if ((await fs.stat(policyPath).catch(() => undefined))?.isFile()) {
				policies.add(path.relative(ROOT, policyPath).split(path.sep).join("/"));
			}
			directory = path.dirname(directory);
		}
	}

	return [...policies].sort((left, right) => {
		const depthDifference = left.split("/").length - right.split("/").length;
		return depthDifference || left.localeCompare(right);
	});
}

async function inspectFile(kind, relativePath, quiet) {
	const content = await fs.readFile(path.join(ROOT, relativePath), "utf8");
	if (!quiet) {
		process.stdout.write(
			`\n===== ${kind.toUpperCase()}: ${relativePath} =====\n`,
		);
		process.stdout.write(content);
		if (!content.endsWith("\n")) process.stdout.write("\n");
	}
	return {
		kind,
		path: relativePath,
		sha256: digest(content),
		bytes: Buffer.byteLength(content),
	};
}

export async function recordDesignSystemEvidence(argv = process.argv.slice(2)) {
	const { targets: rawTargets, owners: rawOwners, quiet } = parseArgs(argv);
	const targets = [...new Set(rawTargets.map(normalizeRepoPath))];
	const owners = [...new Set(rawOwners.map(normalizeRepoPath))];

	for (const target of targets) {
		if (
			!target.startsWith("src/app/") &&
			!target.startsWith("src/components/")
		) {
			throw new Error(
				`UI target must live under src/app or src/components: ${target}`,
			);
		}
		await assertFile(target, "UI target");
	}
	for (const owner of owners) {
		if (!/\.stories\.[cm]?[jt]sx?$/.test(owner)) {
			throw new Error(
				`Owner evidence must be a colocated Storybook story: ${owner}`,
			);
		}
		await assertFile(owner, "Owner story");
	}

	const policies = await governingPolicies(targets);
	const inspectionOrder = [];
	for (const policy of policies) {
		inspectionOrder.push(await inspectFile("policy", policy, quiet));
	}
	for (const owner of owners) {
		inspectionOrder.push(await inspectFile("owner-story", owner, quiet));
	}
	for (const target of targets) {
		inspectionOrder.push(
			await inspectFile("implementation-source", target, quiet),
		);
	}

	const receipt = {
		schemaVersion: RECEIPT_SCHEMA_VERSION,
		recordKind: "design-system-evidence",
		recordedAt: new Date().toISOString(),
		invocationId: crypto.randomUUID(),
		codexThreadId: process.env.CODEX_THREAD_ID || undefined,
		repositoryRoot: ROOT,
		targets,
		owners,
		inspectionOrder,
	};
	const outputDirectory = process.env.DESIGN_SYSTEM_EVIDENCE_DIR
		? path.resolve(process.env.DESIGN_SYSTEM_EVIDENCE_DIR)
		: path.join(ROOT, ".codex/design-system-evidence");
	await fs.mkdir(outputDirectory, { recursive: true });
	const receiptPath = path.join(
		outputDirectory,
		`${receipt.recordedAt.replaceAll(":", "-")}-${process.pid}.json`,
	);
	await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, {
		mode: 0o600,
	});
	await fs.chmod(receiptPath, 0o600);

	process.stdout.write(`\nDesign-system evidence receipt: ${receiptPath}\n`);
	return { receipt, receiptPath };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	recordDesignSystemEvidence().catch((error) => {
		process.stderr.write(
			`${error instanceof Error ? error.message : String(error)}\n`,
		);
		process.exitCode = 1;
	});
}
