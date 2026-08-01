"use client";

import clsx from "clsx";
import { Toaster, type ToasterProps } from "sonner";
import { focusRing } from "@/components/ui/foundations/focus";

type ToastHostProps = {
	position?: ToasterProps["position"];
};

const toastBaseClassName = clsx(
	"group/card flex w-[var(--width)] items-center gap-2 rounded-md border p-4 text-sm shadow-md",
	"border-border bg-card text-card-foreground",
	focusRing.visibleDefault,
);

const toastIconClassName = clsx(
	"relative flex size-4 shrink-0 items-center justify-start text-muted-foreground",
	"group-data-[type=error]/card:text-danger",
	"group-data-[type=info]/card:text-primary",
	"group-data-[type=success]/card:text-success",
	"group-data-[type=warning]/card:text-warning",
);

const toastCloseButtonClassName = clsx(
	"static order-last ml-auto flex size-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-transparent text-muted-foreground transition-colors",
	"hover:!bg-transparent hover:text-foreground",
	focusRing.visibleDefault,
);

const toastActionButtonClassName = clsx(
	"ml-auto flex h-6 shrink-0 items-center rounded-sm bg-foreground px-2 text-xs font-medium text-background transition-opacity hover:opacity-85",
	focusRing.visibleDefault,
);

const toastCancelButtonClassName = clsx(
	"ml-auto flex h-6 shrink-0 items-center rounded-sm bg-muted px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground",
	focusRing.visibleDefault,
);

export default function ToastHost({
	position = "bottom-right",
}: ToastHostProps) {
	return (
		<Toaster
			closeButton
			position={position}
			toastOptions={{
				classNames: {
					actionButton: toastActionButtonClassName,
					cancelButton: toastCancelButtonClassName,
					closeButton: toastCloseButtonClassName,
					content: "grid min-w-0 flex-1 gap-0.5",
					description: "text-muted-foreground",
					icon: toastIconClassName,
					loader: "text-muted-foreground",
					title: "font-medium leading-5",
					toast: toastBaseClassName,
				},
				unstyled: true,
			}}
		/>
	);
}
