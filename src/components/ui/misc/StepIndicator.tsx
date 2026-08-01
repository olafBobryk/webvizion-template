import clsx from "clsx";
import type * as React from "react";
import { Button, type ButtonVariant } from "@/components/ui/primitives/Button";

export type StepIndicatorStep<TStep extends string = string> = {
	disabled?: boolean;
	id: TStep;
	label: React.ReactNode;
};

export type StepIndicatorProps<TStep extends string = string> = {
	"aria-label"?: string;
	className?: string;
	currentStep: TStep;
	onStepChange: (step: TStep) => void;
	steps: readonly StepIndicatorStep<TStep>[];
};

export function StepIndicator<TStep extends string = string>({
	"aria-label": ariaLabel = "Steps",
	className,
	currentStep,
	onStepChange,
	steps,
}: StepIndicatorProps<TStep>) {
	const foundCurrentIndex = steps.findIndex((step) => step.id === currentStep);
	const currentIndex = foundCurrentIndex >= 0 ? foundCurrentIndex : 0;

	return (
		<nav aria-label={ariaLabel} className={className}>
			<ol className="flex w-full items-center">
				{steps.map((step, index) => {
					const hasConnector = index < steps.length - 1;
					return (
						<li
							className={clsx(
								"flex min-w-0 items-center",
								hasConnector ? "flex-1" : "shrink-0",
							)}
							key={step.id}
						>
							<Button
								aria-current={index === currentIndex ? "step" : undefined}
								className={clsx(
									"h-8 px-2.5",
									index < currentIndex &&
										"bg-primary/10 text-primary-text hover:bg-primary/15",
								)}
								disabled={step.disabled}
								onClick={() => onStepChange(step.id)}
								size="sm"
								type="button"
								variant={getStepVariant(index, currentIndex)}
							>
								{step.label}
							</Button>
							{hasConnector ? (
								<span
									aria-hidden
									className={getConnectorClassName(index, currentIndex)}
								/>
							) : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

export function ModalStepIndicator<TStep extends string = string>({
	className,
	...props
}: StepIndicatorProps<TStep>) {
	return (
		<StepIndicator
			className={clsx("border-b border-border pb-3", className)}
			{...props}
		/>
	);
}

function getStepVariant(
	stepIndex: number,
	currentIndex: number,
): ButtonVariant {
	if (stepIndex < currentIndex) return "secondary";
	if (stepIndex === currentIndex) return "primary";
	return "ghost";
}

function getConnectorClassName(stepIndex: number, currentIndex: number) {
	return clsx(
		"mx-2 h-1 min-w-8 flex-1 rounded-full transition-colors",
		stepIndex < currentIndex ? "bg-primary/30" : "bg-muted",
	);
}
