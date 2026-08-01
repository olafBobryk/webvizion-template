import type {
	GlobalConfig,
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

const linkFields = [
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
] satisfies GlobalConfig["fields"];

const directLinkFields = [
	{
		name: "label",
		type: "text",
		required: true,
	},
	{
		name: "href",
		type: "text",
		required: true,
	},
] satisfies GlobalConfig["fields"];

const navLinkFields = [
	...linkFields,
	{
		name: "sections",
		type: "array",
		fields: [
			...linkFields,
			{
				name: "description",
				type: "textarea",
			},
			{
				name: "icon",
				type: "text",
			},
		],
	},
] satisfies GlobalConfig["fields"];

const menuGroupFields = [
	{
		name: "label",
		type: "text",
		required: true,
	},
	{
		name: "icon",
		type: "text",
	},
	{
		name: "link",
		type: "group",
		fields: linkFields,
	},
	{
		name: "links",
		type: "array",
		fields: linkFields,
	},
] satisfies GlobalConfig["fields"];

const socialLinkFields = [
	...directLinkFields,
	{
		name: "icon",
		type: "text",
		required: true,
	},
] satisfies GlobalConfig["fields"];

export const SiteLayout: GlobalConfig = {
	slug: "site-layout",
	label: "Site layout",
	admin: {
		group: "Site",
		description:
			"Published header, footer, navigation, and social content for the marketing shell when MARKETING_CONTENT_SOURCE=payload.",
	},
	versions: {
		drafts: true,
	},
	fields: [
		{
			name: "header",
			type: "group",
			required: true,
			fields: [
				{
					name: "cta",
					type: "group",
					required: true,
					fields: linkFields,
				},
				{
					name: "topNavLinks",
					type: "array",
					fields: linkFields,
				},
				{
					name: "navLinks",
					type: "array",
					fields: navLinkFields,
				},
				{
					name: "menuGroups",
					type: "array",
					fields: menuGroupFields,
				},
				{
					name: "searchGroups",
					type: "array",
					fields: menuGroupFields,
				},
				{
					name: "search",
					type: "group",
					fields: [
						{
							name: "ariaLabel",
							type: "text",
							required: true,
						},
						{
							name: "clearLabel",
							type: "text",
							required: true,
						},
						{
							name: "noResultsText",
							type: "text",
							required: true,
						},
					],
				},
				{
					name: "mobile",
					type: "group",
					fields: [
						{
							name: "menuLabel",
							type: "text",
							required: true,
						},
						{
							name: "openAriaLabel",
							type: "text",
							required: true,
						},
						{
							name: "closeAriaLabel",
							type: "text",
							required: true,
						},
					],
				},
			],
		},
		{
			name: "socialLinks",
			type: "array",
			fields: socialLinkFields,
		},
		{
			name: "footer",
			type: "group",
			required: true,
			fields: [
				{
					name: "navLinks",
					type: "array",
					fields: linkFields,
				},
			],
		},
	],
};
