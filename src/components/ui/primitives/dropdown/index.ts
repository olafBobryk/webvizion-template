"use client";

import {
	DropdownListbox,
	DropdownMenu,
	dropdownMenuOptions,
} from "./DropdownMenu";
import { DropdownRoot } from "./DropdownRoot";
import { DropdownSurface } from "./DropdownSurface";

export type {
	DropdownListboxProps,
	DropdownMenuOption,
	DropdownMenuProps,
	DropdownNavigableOption,
	DropdownPositionStrategy,
	DropdownProps,
	DropdownSurfaceProps,
	DropdownTriggerRenderProps,
} from "./types";
export { useDropdownListNavigation } from "./useDropdownListNavigation";
export { dropdownMenuOptions };

export const Dropdown = Object.assign(DropdownRoot, {
	Listbox: DropdownListbox,
	Menu: DropdownMenu,
	Panel: DropdownSurface,
	menuOptions: dropdownMenuOptions,
});
