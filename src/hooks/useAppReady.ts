"use client";

import { useEffect, useState } from "react";
import { isAppReady, subscribeAppReady } from "@/lib/appReadySignal";

/**
 * Returns true when the initial loading screen begins exiting, so deferred
 * entrances can establish their initial state before it becomes translucent.
 * Immediately returns true on any render after that (module-level singleton).
 */
export function useAppReady(): boolean {
	const [ready, setReady] = useState(isAppReady);
	useEffect(() => subscribeAppReady(() => setReady(true)), []);
	return ready;
}
