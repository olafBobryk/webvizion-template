import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));

function resolved(name) {
	const entry = lock.packages?.[`node_modules/${name}`];
	return entry?.version;
}

["dependencies", "devDependencies"].forEach((field) => {
	if (!pkg[field]) return;
	for (const name of Object.keys(pkg[field])) {
		const v = resolved(name);
		if (v && pkg[field][name] === "latest") {
			pkg[field][name] = `^${v}`; // 👈 caret pin instead of exact
		}
	}
});

writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
