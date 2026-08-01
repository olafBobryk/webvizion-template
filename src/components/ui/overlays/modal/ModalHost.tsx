// components/ui/overlays/modal/ModalHost.tsx
"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePortalScopeId } from "@/components/ui/overlays/Portal";
import {
	closeModal as dispatchClose,
	MODAL_CLOSE_ALL_EVENT,
	MODAL_CLOSE_EVENT,
	MODAL_OPEN_EVENT,
	type ModalRenderFn,
	type OpenModalOptions,
} from "@/lib/modal";
import { ModalCard } from "./ModalCard";
import { ModalShell } from "./ModalShell";

type ActiveModal = {
	closeDisabled: boolean;
	id: string;
	render: ModalRenderFn;
	options?: OpenModalOptions;
	scopeId?: string | null;
};

const modalHostBaseLayerIndex = 80;

export function ModalHost() {
	const [modals, setModals] = useState<ActiveModal[]>([]);
	const scopeId = usePortalScopeId();

	const removeModal = useCallback((id: string) => {
		setModals((prev) => prev.filter((modal) => modal.id !== id));
	}, []);
	const setModalCloseDisabled = useCallback(
		(id: string, closeDisabled: boolean) => {
			setModals((current) =>
				current.map((modal) =>
					modal.id === id ? { ...modal, closeDisabled } : modal,
				),
			);
		},
		[],
	);

	useEffect(() => {
		const handleOpen = (event: Event) => {
			const {
				id,
				render,
				options,
				scopeId: eventScopeId,
			} = (event as CustomEvent<ActiveModal>).detail;
			if ((eventScopeId ?? null) !== scopeId) return;
			setModals((prev) => [
				...prev,
				{ closeDisabled: false, id, render, options, scopeId: eventScopeId },
			]);
		};

		const handleClose = (event: Event) => {
			const { id } = (event as CustomEvent<{ id: string }>).detail;
			removeModal(id);
		};

		const handleCloseAll = () => setModals([]);

		window.addEventListener(MODAL_OPEN_EVENT, handleOpen as EventListener);
		window.addEventListener(MODAL_CLOSE_EVENT, handleClose as EventListener);
		window.addEventListener(MODAL_CLOSE_ALL_EVENT, handleCloseAll);

		return () => {
			window.removeEventListener(MODAL_OPEN_EVENT, handleOpen as EventListener);
			window.removeEventListener(
				MODAL_CLOSE_EVENT,
				handleClose as EventListener,
			);
			window.removeEventListener(MODAL_CLOSE_ALL_EVENT, handleCloseAll);
		};
	}, [removeModal, scopeId]);

	return (
		<AnimatePresence>
			{modals.map((modal, index) => (
				<HostedModal
					isTopMost={index === modals.length - 1}
					key={modal.id}
					layerIndex={modalHostBaseLayerIndex + index * 10}
					modal={modal}
					onClose={removeModal}
					onCloseDisabledChange={setModalCloseDisabled}
				/>
			))}
		</AnimatePresence>
	);
}

function HostedModal({
	isTopMost,
	layerIndex,
	modal,
	onClose,
	onCloseDisabledChange,
}: {
	isTopMost: boolean;
	layerIndex: number;
	modal: ActiveModal;
	onClose: (id: string) => void;
	onCloseDisabledChange: (id: string, disabled: boolean) => void;
}) {
	const { closeDisabled, id, options, render } = modal;
	const closeDisabledRef = useRef(closeDisabled);
	closeDisabledRef.current = closeDisabled;
	const close = useCallback(() => {
		if (closeDisabledRef.current) return;
		onClose(id);
		dispatchClose(id);
	}, [id, onClose]);
	const setCloseDisabled = useCallback(
		(disabled: boolean) => {
			closeDisabledRef.current = disabled;
			onCloseDisabledChange(id, disabled);
		},
		[id, onCloseDisabledChange],
	);

	return (
		<ModalShell
			ariaLabel={options?.ariaLabel}
			isTopMost={isTopMost}
			layerIndex={layerIndex}
			onClose={close}
			placement={options?.placement}
			portalTargetId={options?.portalTargetId}
		>
			<ModalCard {...options?.cardProps}>
				{render({ close, setCloseDisabled })}
			</ModalCard>
		</ModalShell>
	);
}

// TODO: If your project wants global modal shortcuts (e.g., close on route change), hook them up via the event helpers in lib/modal.
