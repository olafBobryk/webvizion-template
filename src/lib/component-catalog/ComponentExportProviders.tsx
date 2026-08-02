"use client";

import { type ReactNode, useEffect } from "react";
import FormValidationClientMount from "@/components/mount/FormValidationClientMount";
import { MotionProvider } from "@/components/ui/foundations/MotionProvider";
import { SettingsProvider } from "@/components/ui/foundations/settingsContext";
import { IconProvider } from "@/components/ui/icons/iconRegistry";
import { phosphorIconRegistry } from "@/components/ui/icons/phosphorRegistry";
import { markAppReady } from "@/lib/appReadySignal";

export function ComponentExportProviders({
	children,
}: {
	children: ReactNode;
}) {
	useEffect(() => {
		markAppReady();
	}, []);

	return (
		<SettingsProvider
			defaultAppearance="light"
			defaultMotionDisabled
			defaultSmoothScrollDisabled
			storageKey={null}
		>
			<MotionProvider expressive={0}>
				<IconProvider registry={phosphorIconRegistry}>
					{children}
					<FormValidationClientMount />
				</IconProvider>
			</MotionProvider>
		</SettingsProvider>
	);
}
