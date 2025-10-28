"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppError({
	error,
	reset,
}: {
	error: globalThis.Error & { digest?: string };
	reset: () => void;
}) {
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		console.error(error);
	}, [error]);

	// Optional: lock scroll while overlay is visible
	useEffect(() => {
		const original = document.documentElement.style.overflow;
		document.documentElement.style.overflow = "hidden";
		return () => {
			document.documentElement.style.overflow = original;
		};
	}, []);

	return (
		<div
			aria-live="assertive"
			className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black"
		>
			<div className="mx-4 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl">
				<div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/90 text-black">
					<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M1 21h22L12 2 1 21z" fill="currentColor" />
						<rect x="11" y="8" width="2" height="7" fill="#000" />
						<rect x="11" y="17" width="2" height="2" fill="#000" />
					</svg>
				</div>

				<h1 className="text-center text-2xl font-semibold tracking-tight">
					Something went wrong
				</h1>

				<p className="mt-2 text-center text-sm text-white/70">
					The page failed to render. You can try again or go back.
				</p>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					<button
						type="button"
						onClick={() => reset()}
						className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition active:translate-y-px"
					>
						Try again
					</button>
					<Link
						href="/"
						type="button"
						className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 hover:border-white/40 transition"
					>
						Go home
					</Link>
					<button
						type="button"
						onClick={() => setShowDetails((v) => !v)}
						className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/70 hover:border-white/40 transition"
					>
						{showDetails ? "Hide details" : "Show details"}
					</button>
				</div>

				{showDetails && (
					<pre className="mt-6 max-h-48 overflow-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-white/80">
						{String(error.message || "Unknown error")}
						{error.digest ? `\n\nDigest: ${error.digest}` : ""}
					</pre>
				)}
			</div>
		</div>
	);
}
