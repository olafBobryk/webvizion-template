// components/ui/icons/iconRegistry.tsx
"use client";

import type { IconWeight } from "@phosphor-icons/react";
import * as React from "react";
import {
	type CustomIconName,
	customRegistry,
} from "@/components/ui/icons/customRegistry";

export type IconRenderProps = {
	className?: string;
	title?: string;
	"aria-hidden"?: boolean;
	weight?: IconWeight;
};

export type IconName = CustomIconName | (string & {});
export type IconRegistry = Record<string, React.ComponentType<IconRenderProps>>;

const createLocalRegistry = (): IconRegistry => {
	const entries = (Object.keys(customRegistry) as CustomIconName[]).map(
		(name) => {
			const LocalIcon: React.FC<IconRenderProps> = ({ className }) => {
				const icon = customRegistry[name];
				if (React.isValidElement<{ className?: string }>(icon)) {
					const mergedClassName = [icon.props.className, className]
						.filter(Boolean)
						.join(" ");
					return React.cloneElement(
						icon as React.ReactElement<{ className?: string }>,
						{ className: mergedClassName },
					);
				}
				return icon;
			};
			LocalIcon.displayName = `LocalIcon(${name})`;
			return [name, LocalIcon] as const;
		},
	);

	return Object.fromEntries(entries) as IconRegistry;
};

const localIconRegistry = createLocalRegistry();

export const createIconRegistry = (
	overrides: Partial<IconRegistry>,
): IconRegistry => {
	const merged: Record<
		string,
		React.ComponentType<IconRenderProps> | undefined
	> = {
		...localIconRegistry,
		...overrides,
	};

	return Object.fromEntries(
		Object.entries(merged).filter(([, value]) => Boolean(value)),
	) as IconRegistry;
};

const IconRegistryContext = React.createContext<IconRegistry | null>(null);

type IconProviderProps = {
	registry: IconRegistry;
	children: React.ReactNode;
};

export function IconProvider({ registry, children }: IconProviderProps) {
	return (
		<IconRegistryContext.Provider value={registry}>
			{children}
		</IconRegistryContext.Provider>
	);
}

export function useIconRegistry() {
	return React.useContext(IconRegistryContext) ?? localIconRegistry;
}
