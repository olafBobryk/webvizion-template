import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(
	await fs.readFile(path.join(packageRoot, "package.json"), "utf8"),
);
const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;
const expected = `create-averlo-v${pkg.version}`;
if (tag !== expected) {
	throw new Error(
		`Release tag must be ${expected}, received ${tag ?? "nothing"}.`,
	);
}
console.log(`Release tag matches create-averlo ${pkg.version}.`);
