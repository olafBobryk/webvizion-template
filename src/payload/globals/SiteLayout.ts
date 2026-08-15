import type { GlobalConfig } from "payload";
import { siteLinkFields } from "@/payload/fields/siteLinkFields";

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
	...siteLinkFields,
	{
		name: "sections",
		type: "array",
		fields: [
			...siteLinkFields,
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
		fields: siteLinkFields,
	},
	{
		name: "links",
		type: "array",
		fields: siteLinkFields,
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
					fields: siteLinkFields,
				},
				{
					name: "topNavLinks",
					type: "array",
					fields: siteLinkFields,
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
					fields: siteLinkFields,
				},
			],
		},
	],
};
