import { createInterface } from "node:readline/promises";

export function createPrompt(input, output) {
	const readline = createInterface({ input, output });
	return {
		close() {
			readline.close();
		},
		async select(label, choices) {
			for (const [index, choice] of choices.entries()) {
				output.write(`${index + 1}. ${choice.label}\n`);
			}
			while (true) {
				const answer = (
					await readline.question(`${label} [1-${choices.length}]: `)
				).trim();
				const selected = Number.parseInt(answer, 10);
				if (selected >= 1 && selected <= choices.length) {
					return choices[selected - 1].value;
				}
				output.write("Choose one of the listed numbers.\n");
			}
		},
		async text(label) {
			return (await readline.question(`${label}: `)).trim();
		},
	};
}
