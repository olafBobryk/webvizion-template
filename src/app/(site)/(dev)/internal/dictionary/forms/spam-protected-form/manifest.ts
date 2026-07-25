import type { DictionaryManifest } from "../../_lib/types";

export const manifest = {
	id: "spam-protected-form",
	family: "forms",
	title: "Spam-Protected Form",
	summary:
		"Reference form pattern that combines a honeypot field, a 60-second cooldown cookie, and strict server-side file validation.",
	copyTargets: [
		"src/components/ui/input/text/SpamProtectionFields.tsx",
		"src/lib/forms/guard.ts",
		"src/app/api/internal/forms/spam-protected-example/route.ts",
	],
	adaptationPoints: [
		"honeypot field name",
		"cooldown cookie name and duration",
		"file type policy",
		"success and error copy",
	],
	notes: [
		"The preview submits to a real internal route handler and sets a real HttpOnly cooldown cookie.",
		"Server-side validation is the source of truth for file rules, even though the client hints PDF-only uploads.",
		"Honeypot hits return a normal success response and stop downstream work.",
	],
} satisfies DictionaryManifest;
