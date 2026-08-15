import type {
	Field,
	SelectFieldSingleValidation,
	TextFieldSingleValidation,
} from "payload";
import { appSurfaceRegistry } from "@/config/surfaces";
import { isStaticAppSurfaceId } from "@/lib/routes";

const surfaceOptions = appSurfaceRegistry
	.filter((surface) => surface.match === "exact")
	.map((surface) => ({ label: surface.id, value: surface.id }));

const validateSurfaceId: SelectFieldSingleValidation = (
	value,
	{ siblingData },
) => {
	const kind = (siblingData as { kind?: unknown }).kind;
	if (kind === "surface") {
		return (
			(typeof value === "string" && isStaticAppSurfaceId(value)) ||
			"Select an installed static app surface."
		);
	}
	return !value || "A direct URL cannot also define a surface ID.";
};

const validateDirectHref: TextFieldSingleValidation = (
	value,
	{ siblingData },
) => {
	const kind = (siblingData as { kind?: unknown }).kind;
	if (kind === "href") {
		return (
			(typeof value === "string" && value.trim().length > 0) ||
			"Enter a direct or external URL."
		);
	}
	return !value || "An app surface link cannot also define a direct URL.";
};

export const siteLinkFields = [
	{
		name: "label",
		type: "text",
		required: true,
	},
	{
		name: "kind",
		type: "radio",
		defaultValue: "surface",
		required: true,
		options: [
			{ label: "Installed app surface", value: "surface" },
			{ label: "Direct or external URL", value: "href" },
		],
	},
	{
		name: "surfaceId",
		type: "select",
		options: surfaceOptions,
		admin: {
			condition: (_data, siblingData) => siblingData?.kind === "surface",
			description:
				"The installed route registry remains the source of truth for this destination's href.",
		},
		validate: validateSurfaceId,
	},
	{
		name: "href",
		type: "text",
		admin: {
			condition: (_data, siblingData) => siblingData?.kind === "href",
			description:
				"Use only for fragments, external URLs, or destinations outside the installed route registry.",
		},
		validate: validateDirectHref,
	},
] satisfies Field[];
