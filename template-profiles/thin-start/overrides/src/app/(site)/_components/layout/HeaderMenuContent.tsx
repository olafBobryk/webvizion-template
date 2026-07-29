"use client";

import clsx from "clsx";
import { useId } from "react";
import { Button } from "@/components/ui/primitives/Button";
import {
	InputFrame,
	inputTextClasses,
} from "@/components/ui/primitives/InputFrame";
import { Text } from "@/components/ui/primitives/Text";
import type { HeaderIconName, SiteLink, SiteMenuGroup } from "./siteLayout";
import { getSiteLinkHref } from "./siteLayout";

const HEADER_MENU_TITLE_LINE_HEIGHT = 24;
const HEADER_MENU_LINK_LINE_HEIGHT = 20;
const HEADER_MENU_TITLE_LINK_GAP = 12;
const HEADER_MENU_LINK_GAP = 10;
const HEADER_MENU_GRID_ROW_GAP = 32;
export const HEADER_MENU_DEFAULT_COLUMNS = 4;
export const HEADER_MENU_CAPPED_COLUMNS = 3;

function HeaderIcon({
	className,
	name,
}: {
	className?: string;
	name: HeaderIconName;
}) {
	if (name === "search") {
		return (
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				className={clsx("size-4", className)}
			>
				<path
					d="m20 20-4.5-4.5m2-5A7 7 0 1 1 3.5 10.5a7 7 0 0 1 14 0Z"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.8"
				/>
			</svg>
		);
	}

	if (name === "close") {
		return (
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				className={clsx("size-5", className)}
			>
				<path
					d="m6 6 12 12M18 6 6 18"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="1.9"
				/>
			</svg>
		);
	}

	if (name === "menu") {
		return (
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				className={clsx("size-5", className)}
			>
				<path
					d="M5 7h14M5 12h14M5 17h14"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="1.9"
				/>
			</svg>
		);
	}

	return (
		<span
			aria-hidden="true"
			className={clsx("size-2 rounded-full bg-current", className)}
		/>
	);
}

export function HeaderMenuIcon(props: {
	className?: string;
	name: HeaderIconName;
}) {
	return <HeaderIcon {...props} />;
}

function getLinkSearchText(link: SiteLink) {
	return `${link.label} ${getSiteLinkHref(link)}`.toLowerCase();
}

export function getHeaderSearchGroups(
	query: string,
	sourceGroups: readonly SiteMenuGroup[] = [],
): SiteMenuGroup[] {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) return [];

	const groups: SiteMenuGroup[] = [];

	for (const group of sourceGroups) {
		const groupLinkText = group.link ? getLinkSearchText(group.link) : "";
		const groupSearchText = `${group.label} ${groupLinkText}`.toLowerCase();
		const groupMatches = groupSearchText.includes(normalizedQuery);
		const links = (group.links ?? []).filter((link) =>
			getLinkSearchText(link).includes(normalizedQuery),
		);

		if (!groupMatches && links.length === 0) continue;

		groups.push({
			label: group.label,
			icon: group.icon,
			link: groupMatches ? group.link : undefined,
			links: links.length > 0 ? links : undefined,
		});
	}

	return groups;
}

function getMenuGroupHeight(group: SiteMenuGroup) {
	const linkCount = group.links?.length ?? 0;

	if (linkCount === 0) return HEADER_MENU_TITLE_LINE_HEIGHT;

	return (
		HEADER_MENU_TITLE_LINE_HEIGHT +
		HEADER_MENU_TITLE_LINK_GAP +
		linkCount * HEADER_MENU_LINK_LINE_HEIGHT +
		(linkCount - 1) * HEADER_MENU_LINK_GAP
	);
}

export function getMenuContentHeight(
	groups: readonly SiteMenuGroup[] = [],
	columnCount: number,
): number {
	if (groups.length === 0) {
		return HEADER_MENU_LINK_LINE_HEIGHT;
	}

	const columns = Math.max(1, Math.floor(columnCount));
	let contentHeight = 0;

	for (let index = 0; index < groups.length; index += columns) {
		const rowHeights = groups
			.slice(index, index + columns)
			.map(getMenuGroupHeight);
		const rowHeight = Math.max(HEADER_MENU_LINK_LINE_HEIGHT, ...rowHeights);

		contentHeight += rowHeight;

		if (index + columns < groups.length) {
			contentHeight += HEADER_MENU_GRID_ROW_GAP;
		}
	}

	return Math.ceil(contentHeight);
}

export function HeaderSearchInput({
	ariaLabel,
	className,
	clearLabel,
	onClear,
	onValueChange,
	placeholder,
	value,
}: {
	ariaLabel: string;
	className?: string;
	clearLabel: string;
	onClear: () => void;
	onValueChange: (value: string) => void;
	placeholder?: string;
	value: string;
}) {
	const searchId = useId();
	const hasValue = value.trim().length > 0;

	return (
		<InputFrame
			className={clsx(
				"group/header-search min-h-10 text-foreground",
				className ??
					"mr-3 w-[220px] min-w-[220px] max-w-[220px] flex-none basis-[220px]",
			)}
			start={<HeaderIcon name="search" className="text-muted-foreground" />}
			end={
				hasValue ? (
					<Button
						type="button"
						variant="ghost"
						size="none"
						className="min-h-8 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover/header-search:opacity-100 group-focus-within/header-search:opacity-100"
						aria-label={clearLabel}
						onMouseDown={(event) => event.preventDefault()}
						onClick={onClear}
					>
						{clearLabel}
					</Button>
				) : undefined
			}
		>
			<input
				id={searchId}
				type="search"
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
				aria-label={ariaLabel}
				placeholder={placeholder}
				autoComplete="off"
				className={clsx(
					inputTextClasses,
					"min-w-0 !pl-0 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
					hasValue && "!pr-0",
				)}
			/>
		</InputFrame>
	);
}

export function HeaderMenuNoResults({
	className,
	noResultsText,
}: {
	className?: string;
	noResultsText: string;
}) {
	return (
		<Text as="p" variant="support" tone="muted" className={className}>
			{noResultsText}
		</Text>
	);
}

export function HeaderSearchResults({
	columnCount,
	groups,
	noResultsText,
	onNavigate,
}: {
	columnCount: number;
	groups: readonly SiteMenuGroup[];
	noResultsText: string;
	onNavigate: () => void;
}) {
	if (groups.length === 0) {
		return <HeaderMenuNoResults noResultsText={noResultsText} />;
	}

	return (
		<HeaderMenuGrid
			groups={groups}
			onNavigate={onNavigate}
			columnCount={columnCount}
		/>
	);
}

export function HeaderMenuGroup({
	className,
	group,
	onNavigate,
}: {
	className?: string;
	group: SiteMenuGroup;
	onNavigate?: () => void;
}) {
	const hasLinks = Boolean(group.links?.length);
	const groupHref = group.link ? getSiteLinkHref(group.link) : undefined;

	return (
		<div className={clsx("flex min-w-0 flex-col items-start gap-3", className)}>
			{groupHref ? (
				<Button
					href={groupHref}
					variant="ghost"
					size="none"
					className="w-fit justify-start text-sm font-medium text-foreground"
					contentClassName="gap-2"
					leadingIcon={
						group.icon ? (
							<HeaderIcon name={group.icon} className="text-foreground" />
						) : undefined
					}
					onClick={onNavigate}
				>
					{group.label}
				</Button>
			) : (
				<span className="flex items-center gap-2 text-sm font-medium text-foreground">
					{group.icon ? (
						<HeaderIcon name={group.icon} className="text-foreground" />
					) : null}
					{group.label}
				</span>
			)}
			{hasLinks ? (
				<div className="flex min-w-0 flex-col items-start gap-2">
					{group.links?.map((item) => (
						<Button
							key={`${item.label}-${getSiteLinkHref(item)}`}
							href={getSiteLinkHref(item)}
							variant="ghost"
							size="none"
							className="w-fit justify-start text-sm font-normal text-muted hover:text-foreground"
							onClick={onNavigate}
						>
							{item.label}
						</Button>
					))}
				</div>
			) : null}
		</div>
	);
}

export function HeaderMenuGrid({
	className,
	columnCount,
	groups,
	onNavigate,
}: {
	className?: string;
	columnCount: number;
	groups: readonly SiteMenuGroup[];
	onNavigate?: () => void;
}) {
	const gridColumnClassName =
		columnCount === HEADER_MENU_CAPPED_COLUMNS
			? "md:grid-cols-3"
			: "lg:grid-cols-4";

	return (
		<div
			className={clsx(
				"grid w-full grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2",
				gridColumnClassName,
				className,
			)}
		>
			{groups.map((group) => (
				<HeaderMenuGroup
					key={group.label}
					group={group}
					onNavigate={onNavigate}
				/>
			))}
		</div>
	);
}
