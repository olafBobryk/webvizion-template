"use client";

import { useRouter } from "next/navigation";

export function BenchmarkRunToggle({ isExample }: { isExample: boolean }) {
	const router = useRouter();

	return (
		<button
			type="button"
			className="rounded-md border border-border px-3 py-2 text-sm"
			onClick={() =>
				router.push(
					isExample
						? "/internal/intelligence?view=benchmarks"
						: "/internal/intelligence?view=benchmarks&example=on",
				)
			}
		>
			{isExample ? "Show local turns" : "Show visual fixture"}
		</button>
	);
}
