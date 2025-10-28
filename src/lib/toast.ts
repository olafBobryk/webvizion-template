// lib/toast.ts
export type ToastType = "success" | "error" | "info";

type ShowToastArgs = {
	message: string;
	type?: ToastType;
	durationMs?: number; // default 3000
};

const EVENT_NAME = "app-toast";

export function showToast({
	message,
	type = "info",
	durationMs = 3000,
}: ShowToastArgs) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent(EVENT_NAME, {
			detail: { message, type, durationMs },
		}),
	);
}
