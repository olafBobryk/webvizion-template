"use client";

import { useRouter } from "next/navigation";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import { showToast } from "@/lib/feedback/toast";
import type {
	DashboardEntityDeletionDefinition,
	DashboardEntityMutationResult,
} from "../../_lib/entity-lifecycle";

type EntityDeletionOptionProps = {
	completion?: EntityDeletionCompletion;
	deleteEntity: () => Promise<DashboardEntityMutationResult>;
	definition: DashboardEntityDeletionDefinition;
	onDeleted?: () => void;
	onOptimisticDelete?: () => void;
	onRollback?: () => void;
};

export type EntityDeletionCompletion =
	| { type: "refresh" }
	| { href: string; replace?: boolean; type: "navigate" };

export function useEntityDeletionOption({
	completion = { type: "refresh" },
	deleteEntity,
	definition,
	onDeleted,
	onOptimisticDelete,
	onRollback,
}: EntityDeletionOptionProps): DropdownMenuOption {
	const router = useRouter();
	const { openConfirmation } = useConfirmationModal();
	return Dropdown.menuOptions.delete({
		disabled: Boolean(definition.disabledReason),
		label: definition.disabledReason ?? "Delete",
		onSelect: (event) => {
			event.preventDefault();
			openConfirmation({
				confirmLabel: "Delete",
				confirmTone: "danger",
				description:
					definition.summary ??
					`This will delete the ${definition.entityTypeLabel.toLowerCase()} “${definition.entityLabel}”.`,
				details: definition.impacts,
				onConfirm: async () => {
					onOptimisticDelete?.();
					try {
						const result = await deleteEntity();
						if (!result.ok) {
							onRollback?.();
							showToast.error(result.message, {
								title: "Deletion failed",
							});
							return false;
						}
						showToast.success(result.message, { title: "Deleted" });
						onDeleted?.();
						if (completion.type === "navigate") {
							if (completion.replace) {
								router.replace(completion.href);
							} else {
								router.push(completion.href);
							}
						} else {
							router.refresh();
						}
						return true;
					} catch {
						onRollback?.();
						showToast.error(
							`${definition.entityTypeLabel} could not be deleted.`,
							{ title: "Deletion failed" },
						);
						return false;
					}
				},
				title: `Delete ${definition.entityLabel}?`,
				warning: definition.warning,
			});
		},
	});
}

export function EntityDeletionDetailMenu({
	ariaLabel,
	completion,
	deleteEntity,
	definition,
	onDeleted,
	onOptimisticDelete,
	onRollback,
}: EntityDeletionOptionProps & { ariaLabel?: string }) {
	const option = useEntityDeletionOption({
		completion,
		deleteEntity,
		definition,
		onDeleted,
		onOptimisticDelete,
		onRollback,
	});
	return (
		<Dropdown.Menu
			ariaLabel={ariaLabel ?? `Open actions for ${definition.entityLabel}`}
			openOnHover={false}
			options={[option]}
			positionStrategy="fixed"
		/>
	);
}
