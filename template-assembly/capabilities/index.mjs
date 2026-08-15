export const ASSISTANT_CAPABILITY = "assistant";
export const supportedCapabilities = new Set([ASSISTANT_CAPABILITY]);

export function normalizeCapabilities(values = []) {
	const normalized = [...new Set(values)].sort();
	for (const capability of normalized) {
		if (!supportedCapabilities.has(capability)) {
			throw new Error(
				`Unknown capability: ${capability}. Supported capabilities: ${[...supportedCapabilities].join(", ")}.`,
			);
		}
	}
	return normalized;
}

export function normalizeReceiptCapabilities(receipt) {
	if (receipt.capabilities === undefined) return [];
	if (!Array.isArray(receipt.capabilities)) {
		throw new Error("Project receipt capabilities must be an array.");
	}
	return normalizeCapabilities(receipt.capabilities);
}

export function getCapabilitySurfaces(profile, capabilities = []) {
	const normalized = normalizeCapabilities(capabilities);
	if (
		normalized.includes(ASSISTANT_CAPABILITY) &&
		!profile.assembly?.surfaces?.includes("dashboard")
	) {
		throw new Error(
			`Capability assistant requires a dashboard-capable profile; ${profile.id} does not include the dashboard surface.`,
		);
	}
	return normalized.includes(ASSISTANT_CAPABILITY) ? ["assistant"] : [];
}

export function readEffectiveCapabilities(receipt) {
	return normalizeReceiptCapabilities(receipt);
}
