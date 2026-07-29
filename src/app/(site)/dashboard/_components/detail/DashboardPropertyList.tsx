"use client";

import clsx from "clsx";
import type * as React from "react";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import { Text } from "@/components/ui/primitives/Text";

export type DashboardPropertyOption = {
	disabled?: boolean;
	icon?: Exclude<React.ReactNode, string | number>;
	id: string;
	label: React.ReactNode;
};

function DashboardPropertyListRoot({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<section className={clsx("grid gap-2", className)}>{children}</section>
	);
}

function DashboardPropertyListHeader({
	actions,
	onAdd,
	options = [],
	title = "Properties",
}: {
	actions?: React.ReactNode;
	onAdd?: (id: string) => void;
	options?: readonly DashboardPropertyOption[];
	title?: React.ReactNode;
}) {
	const addOptions: DropdownMenuOption[] = options.map((option) => ({
		disabled: option.disabled,
		id: option.id,
		label: option.label,
		leadingIcon: option.icon,
		onSelect: () => onAdd?.(option.id),
	}));
	return (
		<div className="flex min-h-8 items-center justify-between gap-3">
			<Text as="h3" className="font-medium" variant="support">
				{title}
			</Text>
			{actions ??
				(addOptions.length > 0 ? (
					<Dropdown.Menu
						ariaLabel="Add property"
						openOnHover={false}
						options={addOptions}
						positionStrategy="fixed"
						triggerButtonProps={{
							className: "text-muted-foreground hover:text-foreground",
							size: "sm",
							variant: "ghost",
						}}
						triggerContent="+ Add"
					/>
				) : null)}
		</div>
	);
}

function DashboardPropertyListRows({
	children,
}: {
	children?: React.ReactNode;
}) {
	return children ? (
		<div className="divide-y divide-border/70 border-y border-border/70">
			{children}
		</div>
	) : null;
}

function DashboardPropertyRow({
	action,
	children,
	icon,
	label,
	menuOptions,
}: {
	action?: React.ReactNode;
	children: React.ReactNode;
	icon: React.ReactNode;
	label: string;
	menuOptions?: DropdownMenuOption[];
}) {
	return (
		<div className="grid min-h-12 grid-cols-[minmax(8rem,.6fr)_minmax(0,1fr)_auto] items-center gap-4 py-2 max-sm:grid-cols-[1fr_auto]">
			<div className="flex min-w-0 items-center gap-3 text-muted-foreground">
				<span className="inline-flex size-5 shrink-0 items-center justify-center">
					{icon}
				</span>
				<Text as="span" className="truncate font-medium" variant="support">
					{label}
				</Text>
			</div>
			<div className="min-w-0 text-sm max-sm:col-span-2 max-sm:row-start-2">
				{children}
			</div>
			<div className="flex justify-end">
				{action ??
					(menuOptions ? (
						<Dropdown.Menu
							ariaLabel={`Manage ${label.toLowerCase()}`}
							options={menuOptions}
							positionStrategy="fixed"
						/>
					) : null)}
			</div>
		</div>
	);
}

function DashboardPropertyListSkeleton({
	action,
	items,
	title = "Properties",
}: {
	action?: React.ReactNode;
	items: readonly {
		icon: React.ReactNode;
		id: string;
		label: string;
		value: string;
	}[];
	title?: React.ReactNode;
}) {
	return (
		<DashboardPropertyListRoot>
			<DashboardPropertyListHeader actions={action} title={title} />
			<DashboardPropertyListRows>
				{items.map((item) => (
					<DashboardPropertyRow
						action={<Button.Skeleton size="icon-sm" variant="secondary" />}
						icon={item.icon}
						key={item.id}
						label={item.label}
					>
						<Text.Skeleton
							as="span"
							className="max-w-48 text-sm text-foreground"
							tone={null}
							variant={null}
						>
							{item.value}
						</Text.Skeleton>
					</DashboardPropertyRow>
				))}
			</DashboardPropertyListRows>
		</DashboardPropertyListRoot>
	);
}

export const DashboardPropertyList = Object.assign(DashboardPropertyListRoot, {
	Header: DashboardPropertyListHeader,
	Row: DashboardPropertyRow,
	Rows: DashboardPropertyListRows,
	Skeleton: DashboardPropertyListSkeleton,
});
