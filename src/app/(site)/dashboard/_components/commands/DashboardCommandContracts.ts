import type { IconName } from "@/components/ui/icons/Icon";
import type { DashboardCapability } from "../../_registry/surfaceRegistry";

export type DashboardContextualCommand = {
	capability?: DashboardCapability;
	description: string;
	href?: string;
	icon?: IconName;
	id: string;
	keywords?: readonly string[];
	label: string;
	parentId?: string;
	run?: () => void;
};
