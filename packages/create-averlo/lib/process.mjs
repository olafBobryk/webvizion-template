import { spawn } from "node:child_process";

export function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const capture = options.capture === true;
		const child = spawn(command, args, {
			cwd: options.cwd,
			env: options.env,
			signal: options.signal,
			stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
		});
		let stdout = "";
		let stderr = "";
		if (capture) {
			child.stdout.setEncoding("utf8");
			child.stderr.setEncoding("utf8");
			child.stdout.on("data", (chunk) => {
				stdout += chunk;
			});
			child.stderr.on("data", (chunk) => {
				stderr += chunk;
			});
		}
		child.on("error", reject);
		child.on("exit", (code, signal) => {
			if (code === 0) {
				resolve({ stderr, stdout });
				return;
			}
			const detail = capture ? stderr.trim() || stdout.trim() : "";
			reject(
				new Error(
					`${command} ${args.join(" ")} failed${signal ? ` with ${signal}` : ` with exit code ${code}`}${detail ? `:\n${detail}` : "."}`,
				),
			);
		});
	});
}
