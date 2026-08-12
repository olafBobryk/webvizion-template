import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { templateProfiles } from "../../../template-profiles/index.mjs";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = path.resolve(packageRoot, "../..");
const status = execFileSync(
	"git",
	["status", "--porcelain", "--untracked-files=all"],
	{ cwd: repositoryRoot, encoding: "utf8" },
).trim();
const sourceDirty = status.length > 0;
if (sourceDirty && process.env.CREATE_AVERLO_ALLOW_DIRTY_PACK !== "1") {
	throw new Error(
		"Refusing to package create-averlo from a dirty template checkout.",
	);
}

const pkg = JSON.parse(
	await fs.readFile(path.join(packageRoot, "package.json"), "utf8"),
);
const metadata = {
	schemaVersion: 1,
	packageVersion: pkg.version,
	profiles: Object.values(templateProfiles).map((profile) => ({
		content: profile.content,
		description: profile.description,
		id: profile.id,
	})),
	repository: "https://github.com/olafBobryk/averlo-next-template.git",
	sourceDirty,
	templateCommit: execFileSync("git", ["rev-parse", "HEAD"], {
		cwd: repositoryRoot,
		encoding: "utf8",
	}).trim(),
};
await fs.mkdir(path.join(packageRoot, "dist"), { recursive: true });
await fs.writeFile(
	path.join(packageRoot, "dist/template-metadata.json"),
	`${JSON.stringify(metadata, null, 2)}\n`,
);
console.log(
	`Generated create-averlo metadata for ${metadata.templateCommit}${sourceDirty ? " (dirty development build)" : ""}.`,
);
