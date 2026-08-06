// Lightweight module-level singleton that flips when the initial loading screen
// starts its exit transition. Deferred entrances reset before that overlay can
// expose them, then play through the exit. It stays true after first fire so
// client-side navigation is never blocked.

let ready = false;
const subscribers = new Set<() => void>();

export function markAppReady(): void {
	if (ready) return;
	ready = true;
	for (const fn of subscribers) fn();
	subscribers.clear();
}

export function isAppReady(): boolean {
	return ready;
}

export function subscribeAppReady(fn: () => void): () => void {
	if (ready) {
		fn();
		return () => {};
	}
	subscribers.add(fn);
	return () => {
		subscribers.delete(fn);
	};
}
