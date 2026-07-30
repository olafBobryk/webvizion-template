function hasControlCharacter(value: string) {
	return [...value].some((character) => {
		const code = character.charCodeAt(0);
		return code <= 31 || code === 127;
	});
}

export function getSafeContinuationPath(
	value: string | null | undefined,
	fallback = hrefFor("dashboard.overview"),
) {
	const candidate = value?.trim();
	if (
		!candidate?.startsWith("/") ||
		candidate.startsWith("//") ||
		candidate.includes("\\") ||
		hasControlCharacter(candidate)
	) {
		return fallback;
	}

	try {
		const parsed = new URL(candidate, "https://template.local");
		if (parsed.origin !== "https://template.local") return fallback;
		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return fallback;
	}
}

export function withSafeContinuation(path: string, next: string | null) {
	const safeNext = getSafeContinuationPath(next);
	const url = new URL(path, "https://template.local");
	url.searchParams.set("next", safeNext);
	const continuation = new URL(safeNext, "https://template.local");
	for (const reviewFlag of ["motion", "reveal"] as const) {
		if (continuation.searchParams.get(reviewFlag) === "off") {
			url.searchParams.set(reviewFlag, "off");
		}
	}
	return `${url.pathname}${url.search}`;
}

import { hrefFor } from "@/lib/routes";
