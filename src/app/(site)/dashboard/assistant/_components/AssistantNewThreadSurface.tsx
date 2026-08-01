"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { ErrorState } from "@/components/ui/misc/state/ErrorState";
import { AssistantThreadSurfaceSkeleton } from "../[threadId]/_components/AssistantThreadSurface";

export function AssistantNewThreadSurface() {
	const router = useRouter();
	const requestRef = React.useRef<Promise<string> | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (error) return;
		let active = true;
		requestRef.current ??= fetch("/api/assistant/threads", {
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		}).then(async (response) => {
			const body = (await response.json().catch(() => ({}))) as {
				error?: string;
				thread?: { id?: string };
			};
			if (!response.ok || typeof body.thread?.id !== "string") {
				throw new Error(body.error ?? "Could not start a conversation.");
			}
			return body.thread.id;
		});

		void requestRef.current
			.then((threadId) => {
				if (!active) return;
				router.replace(`/dashboard/assistant/${encodeURIComponent(threadId)}`);
			})
			.catch((caughtError: unknown) => {
				if (!active) return;
				setError(
					caughtError instanceof Error
						? caughtError.message
						: "Could not start a conversation.",
				);
			});

		return () => {
			active = false;
		};
	}, [error, router]);

	if (error) {
		return (
			<div className="grid h-full place-items-center px-6">
				<ErrorState
					align="center"
					description={error}
					layout="stacked"
					onAction={() => {
						requestRef.current = null;
						setError(null);
					}}
					title="Could not start a conversation"
				/>
			</div>
		);
	}

	return <AssistantNewThreadSurfaceSkeleton />;
}

export function AssistantNewThreadSurfaceSkeleton() {
	return <AssistantThreadSurfaceSkeleton />;
}
