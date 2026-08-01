// components/ui/overlays/modal/useModal.tsx
"use client";

import { useCallback } from "react";
import { usePortalScopeId } from "@/components/ui/overlays/Portal";
import type { ModalRenderFn } from "@/lib/modal";
import {
	closeAllModals,
	closeModal,
	type OpenModalOptions,
	openModal,
} from "@/lib/modal";

export function useModal() {
	const scopeId = usePortalScopeId();
	const handleOpen = useCallback(
		(render: ModalRenderFn, options?: OpenModalOptions) =>
			openModal(render, options, scopeId),
		[scopeId],
	);

	const handleClose = useCallback((id: string) => closeModal(id), []);

	const handleCloseAll = useCallback(() => closeAllModals(), []);

	return {
		openModal: handleOpen,
		closeModal: handleClose,
		closeAll: handleCloseAll,
	};
}

// TODO: Add project-specific convenience wrappers here (e.g., standardized alert modals).
