"use client";

import * as React from "react";

const storagePrefix = "averlo.dashboard.sidebar.disclosure.v1";

export function usePersistentSidebarDisclosure(
	id: string,
	defaultOpen: boolean,
) {
	const [open, setOpen] = React.useState(defaultOpen);

	React.useEffect(() => {
		try {
			const stored = window.localStorage.getItem(`${storagePrefix}.${id}`);
			if (stored !== null) setOpen(stored === "true");
		} catch {
			// Storage can be unavailable in hardened browsing contexts.
		}
	}, [id]);

	const updateOpen = React.useCallback(
		(nextOpen: boolean) => {
			setOpen(nextOpen);
			try {
				window.localStorage.setItem(`${storagePrefix}.${id}`, String(nextOpen));
			} catch {
				// The in-memory state still keeps the disclosure functional.
			}
		},
		[id],
	);

	return [open, updateOpen] as const;
}
