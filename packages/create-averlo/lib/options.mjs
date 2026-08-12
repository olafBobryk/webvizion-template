import path from "node:path";

const CONTENT_MODES = new Set(["static", "payload-ready"]);

function takeValue(argv, index, flag) {
	const value = argv[index + 1];
	if (!value || value.startsWith("--")) {
		throw new Error(`${flag} requires a value.`);
	}
	return value;
}

export function parseCliArgs(argv) {
	const options = {
		content: undefined,
		help: false,
		install: true,
		profile: undefined,
		projectDirectory: undefined,
		version: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--profile") {
			options.profile = takeValue(argv, index, arg);
			index += 1;
		} else if (arg === "--content") {
			const value = takeValue(argv, index, arg);
			if (!CONTENT_MODES.has(value)) {
				throw new Error("--content requires static or payload-ready.");
			}
			options.content = value;
			index += 1;
		} else if (arg === "--no-install") {
			options.install = false;
		} else if (arg === "--help" || arg === "-h") {
			options.help = true;
		} else if (arg === "--version" || arg === "-v") {
			options.version = true;
		} else if (arg.startsWith("--")) {
			throw new Error(`Unknown option: ${arg}`);
		} else if (options.projectDirectory) {
			throw new Error("create-averlo accepts exactly one project directory.");
		} else {
			options.projectDirectory = arg;
		}
	}

	return options;
}

export function isValidProjectName(name) {
	return (
		typeof name === "string" &&
		name.length > 0 &&
		name.length <= 214 &&
		name !== "node_modules" &&
		name !== "favicon.ico" &&
		/^[a-z0-9][a-z0-9._-]*$/.test(name)
	);
}

export async function resolveCliOptions({
	parsed,
	metadata,
	cwd,
	interactive,
	prompt,
}) {
	let projectDirectory = parsed.projectDirectory;
	if (!projectDirectory) {
		if (!interactive) {
			throw new Error(
				"A project directory is required in non-interactive environments.",
			);
		}
		projectDirectory = await prompt.text("Project directory");
	}
	if (!projectDirectory) throw new Error("A project directory is required.");

	let profileId = parsed.profile;
	if (!profileId) {
		if (!interactive) {
			throw new Error("--profile is required in non-interactive environments.");
		}
		profileId = await prompt.select(
			"Profile",
			metadata.profiles.map((profile) => ({
				label: `${profile.id} — ${profile.description}`,
				value: profile.id,
			})),
		);
	}

	const profile = metadata.profiles.find(
		(candidate) => candidate.id === profileId,
	);
	if (!profile) {
		throw new Error(
			`Unknown profile: ${profileId}. Choose one of ${metadata.profiles.map((candidate) => candidate.id).join(", ")}.`,
		);
	}

	let content = parsed.content;
	if (!content && interactive && profile.content.supported.length > 1) {
		content = await prompt.select(
			"Content mode",
			profile.content.supported.map((mode) => ({ label: mode, value: mode })),
		);
	}
	content ??= profile.content.default;
	if (!profile.content.supported.includes(content)) {
		throw new Error(
			`Profile ${profile.id} does not support ${content} content. Choose one of ${profile.content.supported.join(", ")}.`,
		);
	}

	const targetRoot = path.resolve(cwd, projectDirectory);
	const projectName = path.basename(targetRoot);
	if (!isValidProjectName(projectName)) {
		throw new Error(
			`Project directory basename must be a valid lowercase npm package name: ${projectName}`,
		);
	}

	return {
		content,
		install: parsed.install,
		profile,
		projectDirectory,
		projectName,
		targetRoot,
	};
}
