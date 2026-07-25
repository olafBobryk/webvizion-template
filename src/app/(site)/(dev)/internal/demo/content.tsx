"use client";

import { brandingDemoPage } from "./_content/pages/branding";
import { compositesDemoPage } from "./_content/pages/composites";
import { compositesMarkdownDemoPage } from "./_content/pages/composites-markdown";
import { libApiDemoPage } from "./_content/pages/lib-api";
import { testDemoPage } from "./_content/pages/test";
import { uiDemoPage } from "./_content/pages/ui";
import { uiFoundationsDemoPage } from "./_content/pages/ui-foundations";
import { uiHelpersDemoPage } from "./_content/pages/ui-helpers";
import { uiIconsDemoPage } from "./_content/pages/ui-icons";
import { uiInputDemoPage } from "./_content/pages/ui-input";
import { uiInputChoiceDemoPage } from "./_content/pages/ui-input-choice";
import { uiInputChoiceLabDemoPage } from "./_content/pages/ui-input-choice-lab";
import { uiInputFilesDemoPage } from "./_content/pages/ui-input-files";
import { uiMiscDemoPage } from "./_content/pages/ui-misc";
import { uiMiscStateDemoPage } from "./_content/pages/ui-misc-state";
import { uiMotionDemoPage } from "./_content/pages/ui-motion";
import { uiOverlaysDemoPage } from "./_content/pages/ui-overlays";
import { uiOverlaysModalDemoPage } from "./_content/pages/ui-overlays-modal";
import { uiOverlaysToastDemoPage } from "./_content/pages/ui-overlays-toast";
import { uiPrimitivesDemoPage } from "./_content/pages/ui-primitives";
import { uiTimeDemoPage } from "./_content/pages/ui-time";
import type { DemoPage } from "./_content/types";

export type {
	DemoComponentItem,
	DemoGroup,
	DemoItem,
	DemoItemBase,
	DemoPage,
	DemoSkeletonItem,
	RelatedInfo,
} from "./_content/types";

export const demoPages: DemoPage[] = [
	brandingDemoPage,
	compositesDemoPage,
	compositesMarkdownDemoPage,
	uiDemoPage,
	uiPrimitivesDemoPage,
	uiHelpersDemoPage,
	uiIconsDemoPage,
	uiInputDemoPage,
	uiInputChoiceDemoPage,
	uiInputChoiceLabDemoPage,
	uiInputFilesDemoPage,
	uiMiscDemoPage,
	uiMiscStateDemoPage,
	uiMotionDemoPage,
	uiOverlaysDemoPage,
	uiOverlaysModalDemoPage,
	uiOverlaysToastDemoPage,
	uiTimeDemoPage,
	uiFoundationsDemoPage,
	testDemoPage,
	libApiDemoPage,
];

export function getVisibleDemoPages() {
	const isProduction = process.env.NODE_ENV === "production";

	return demoPages.filter(
		(page) => page.visibility !== "dev-only" || !isProduction,
	);
}
