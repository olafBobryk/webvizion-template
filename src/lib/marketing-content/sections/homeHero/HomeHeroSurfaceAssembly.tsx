"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useId, useMemo, useState } from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import {
	instantTransition,
	resolveMotionTransition,
} from "@/components/ui/foundations/motionTiming";
import { Skeleton } from "@/components/ui/misc";
import {
	ActiveStageHost,
	useActiveStage,
} from "@/components/ui/motion/ActiveStageHost";
import { Button } from "@/components/ui/primitives/Button";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { useIsSmUp } from "@/hooks/useTailwindBreakpoints";
import type {
	HomeHeroServiceItem,
	TemplateServiceSurfaceId,
} from "../../types";

type RenderedSurface = {
	height: number;
	name: string;
	src: string;
	width: number;
};

const renderedSurfaces = {
	demo: {
		name: "Demo Index",
		src: "/template-services/demo.png",
		width: 1280,
		height: 1596,
	},
	demoPrimitives: {
		name: "UI Primitives",
		src: "/template-services/demo-primitives.png",
		width: 1280,
		height: 2183,
	},
	intelligence: {
		name: "Template Intelligence",
		src: "/template-services/intelligence.png",
		width: 1280,
		height: 643,
	},
	playground: {
		name: "Playground",
		src: "/template-services/playground.png",
		width: 1280,
		height: 590,
	},
	assembly: {
		name: "Positive assembly plan",
		src: "/template-services/assembly.png",
		width: 920,
		height: 1200,
	},
	thinStart: {
		name: "Thin start homepage hero",
		src: "/template-services/thin-start.png",
		width: 1280,
		height: 930,
	},
	fullStart: {
		name: "Full start dashboard",
		src: "/template-services/full-start.png",
		width: 1020,
		height: 900,
	},
} satisfies Record<TemplateServiceSurfaceId, RenderedSurface>;

type SurfaceGroupProps = {
	calloutId?: string;
	registerHitbox?: (index: number, node: HTMLElement | null) => void;
	services: HomeHeroServiceItem[];
	skeleton?: boolean;
	surfaceIds: readonly TemplateServiceSurfaceId[];
};

const assemblyHostClassName =
	"pointer-events-none absolute inset-0 z-10 overflow-visible";
const serviceContentTransition = resolveMotionTransition("ambient", {
	intensity: "subtle",
	surface: "flat",
});

function RealSurface({ surfaceId }: { surfaceId: TemplateServiceSurfaceId }) {
	const surface = renderedSurfaces[surfaceId];

	return (
		<div
			className="rounded-lg ring-1 ring-foreground/10"
			data-surface={surface.name}
		>
			<Image
				alt=""
				className="h-auto w-full rounded-lg"
				height={surface.height}
				loading="eager"
				sizes="(min-width: 1280px) 220px, 150px"
				src={surface.src}
				width={surface.width}
			/>
		</div>
	);
}

function SurfaceSkeleton({
	surfaceId,
}: {
	surfaceId: TemplateServiceSurfaceId;
}) {
	const surface = renderedSurfaces[surfaceId];

	return (
		<Skeleton
			className="w-full rounded-lg ring-1 ring-foreground/10"
			style={{ aspectRatio: `${surface.width} / ${surface.height}` }}
		/>
	);
}

function InteractiveSurfaceHitbox({
	calloutId,
	registerHitbox,
	service,
	serviceIndex,
	surfaceIds,
}: {
	calloutId: string;
	registerHitbox: (index: number, node: HTMLElement | null) => void;
	service: HomeHeroServiceItem;
	serviceIndex: number;
	surfaceIds: readonly TemplateServiceSurfaceId[];
}) {
	const { getItemProps, hasInteraction, isActive } = useActiveStage();
	const active = hasInteraction && isActive(serviceIndex);
	const itemProps = getItemProps(serviceIndex);
	const surfaceNames = surfaceIds.map(
		(surfaceId) => renderedSurfaces[surfaceId].name,
	);
	const setTriggerRef = useCallback(
		(node: HTMLElement | null) => {
			registerHitbox(serviceIndex, node);
		},
		[registerHitbox, serviceIndex],
	);

	return (
		<div className="pointer-events-auto min-w-0">
			<Button
				ref={setTriggerRef}
				type="button"
				variant="ghost"
				size="none"
				align="left"
				radius="sm"
				aria-describedby={active ? calloutId : undefined}
				aria-label={`Show ${service.title} details for ${surfaceNames.join(" and ")}`}
				className="!block w-full !whitespace-normal !rounded-lg !border-0 !bg-transparent p-0 hover:!opacity-100 active:!translate-y-0 data-[active=true]:[filter:brightness(1.015)]"
				contentClassName="!block w-full"
				data-service-id={service.id}
				data-surface-hitbox={surfaceIds.join(",")}
				{...itemProps}
				data-active={active}
			>
				<span className="grid w-full gap-4">
					{surfaceIds.map((surfaceId) => (
						<RealSurface key={surfaceId} surfaceId={surfaceId} />
					))}
				</span>
			</Button>
		</div>
	);
}

function SurfaceGroup({
	calloutId,
	registerHitbox,
	services,
	skeleton = false,
	surfaceIds,
}: SurfaceGroupProps) {
	const serviceIndex = services.findIndex((service) =>
		surfaceIds.some((surfaceId) => service.surfaceIds.includes(surfaceId)),
	);
	const service = services[serviceIndex];

	if (!service) return null;

	if (skeleton) {
		return (
			<div className="grid gap-4">
				{surfaceIds.map((surfaceId) => (
					<SurfaceSkeleton key={surfaceId} surfaceId={surfaceId} />
				))}
			</div>
		);
	}
	if (!calloutId || !registerHitbox) return null;

	return (
		<InteractiveSurfaceHitbox
			calloutId={calloutId}
			registerHitbox={registerHitbox}
			service={service}
			serviceIndex={serviceIndex}
			surfaceIds={surfaceIds}
		/>
	);
}

function SurfaceAssemblyGrid({
	calloutId,
	registerHitbox,
	services,
	skeleton = false,
}: {
	calloutId?: string;
	registerHitbox?: (index: number, node: HTMLElement | null) => void;
	services: HomeHeroServiceItem[];
	skeleton?: boolean;
}) {
	return (
		<div
			aria-hidden={skeleton || undefined}
			data-fidelity-assembly="real-template-surfaces"
			className="absolute inset-x-0 top-[60%] h-[34rem] -translate-y-1/2 overflow-visible sm:h-[40rem] xl:left-[61%] xl:right-auto xl:top-[55%] xl:h-[42rem] xl:w-[42rem] xl:-translate-x-1/2"
		>
			<div className="pointer-events-none absolute inset-x-[4%] bottom-[10%] h-28 rounded-[50%] bg-primary/10 blur-3xl" />
			<div
				className="absolute left-1/2 top-[40%] h-[40rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 scale-[0.35] sm:scale-[0.68] xl:scale-[0.88]"
				style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
			>
				<div
					className="grid h-[40rem] w-[52rem] grid-cols-[repeat(4,12rem)] items-start gap-4 [filter:drop-shadow(0_24px_20px_rgb(var(--color-foreground-rgb)/0.16))]"
					style={{
						transform: "rotateX(54deg) rotateZ(-30deg)",
						transformStyle: "preserve-3d",
					}}
				>
					<div className="mt-28 grid gap-4">
						<SurfaceGroup
							calloutId={calloutId}
							registerHitbox={registerHitbox}
							services={services}
							skeleton={skeleton}
							surfaceIds={["assembly"]}
						/>
					</div>
					<div className="grid gap-4">
						<SurfaceGroup
							calloutId={calloutId}
							registerHitbox={registerHitbox}
							services={services}
							skeleton={skeleton}
							surfaceIds={["demo", "demoPrimitives"]}
						/>
					</div>
					<div className="mt-16 grid gap-y-[12rem]">
						<SurfaceGroup
							calloutId={calloutId}
							registerHitbox={registerHitbox}
							services={services}
							skeleton={skeleton}
							surfaceIds={["intelligence"]}
						/>
						<SurfaceGroup
							calloutId={calloutId}
							registerHitbox={registerHitbox}
							services={services}
							skeleton={skeleton}
							surfaceIds={["thinStart"]}
						/>
					</div>
					<div className="mt-28 grid gap-y-[8rem]">
						<SurfaceGroup
							calloutId={calloutId}
							registerHitbox={registerHitbox}
							services={services}
							skeleton={skeleton}
							surfaceIds={["playground"]}
						/>
						<SurfaceGroup
							calloutId={calloutId}
							registerHitbox={registerHitbox}
							services={services}
							skeleton={skeleton}
							surfaceIds={["fullStart"]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function ActiveServiceCallout({
	anchorRef,
	calloutId,
	service,
}: {
	anchorRef: { current: Element | null };
	calloutId: string;
	service: HomeHeroServiceItem;
}) {
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const isSmUp = useIsSmUp();
	const contentTransition =
		motionAllowed && !motionDisabled
			? serviceContentTransition
			: instantTransition;
	const alignsEnd = service.surfaceIds.some((surfaceId) =>
		["fullStart", "playground", "thinStart"].includes(surfaceId),
	);
	const prefersBottom = service.surfaceIds.some((surfaceId) =>
		["demo", "demoPrimitives", "intelligence", "playground"].includes(
			surfaceId,
		),
	);

	const content = (
		<motion.div layout className="grid gap-2" transition={contentTransition}>
			<Text
				as="p"
				variant="headingMd"
				interactive={false}
				className="text-pretty"
			>
				{service.title}
			</Text>
			<Text
				as="p"
				variant="support"
				tone="muted"
				interactive={false}
				className="text-pretty"
			>
				{service.description}
			</Text>
		</motion.div>
	);

	if (!isSmUp) {
		return (
			<Panel
				id={calloutId}
				background="background"
				border="subtle"
				padding="sm"
				radius="sm"
				shadow="sm"
				className="pointer-events-none absolute left-1/2 top-[60%] z-30 w-[calc(100vw-2rem)] -translate-x-1/2 !border-border/70 !bg-background/95 backdrop-blur-sm"
				data-service-callout={service.id}
			>
				{content}
			</Panel>
		);
	}

	return (
		<Dropdown.Panel
			id={calloutId}
			align={alignsEnd ? "end" : "start"}
			anchorRef={anchorRef}
			background="background"
			border="subtle"
			collisionPadding={16}
			offset={14}
			padding="sm"
			positionStrategy="fixed"
			radius="sm"
			shadow="sm"
			side={prefersBottom ? "bottom" : "top"}
			className="motion-macro !w-[16.25rem] max-w-[calc(100vw-2rem)] !border-border/70 !bg-background/95 transition-[left,top] backdrop-blur-sm"
			data-service-callout={service.id}
		>
			{content}
		</Dropdown.Panel>
	);
}

function LiveSurfaceAssemblyGrid({
	services,
}: {
	services: HomeHeroServiceItem[];
}) {
	const { activeIndex, hasInteraction } = useActiveStage();
	const calloutId = useId();
	const [hitboxNodes, setHitboxNodes] = useState<Array<HTMLElement | null>>([]);
	const registerHitbox = useCallback(
		(index: number, node: HTMLElement | null) => {
			setHitboxNodes((current) => {
				if (current[index] === node) return current;
				const next = [...current];
				next[index] = node;
				return next;
			});
		},
		[],
	);
	const activeAnchorRef = useMemo(
		() => ({ current: hitboxNodes[activeIndex] ?? null }),
		[activeIndex, hitboxNodes],
	);
	const activeService = hasInteraction ? services[activeIndex] : undefined;

	return (
		<>
			<SurfaceAssemblyGrid
				calloutId={calloutId}
				registerHitbox={registerHitbox}
				services={services}
			/>
			{activeService && activeAnchorRef.current ? (
				<ActiveServiceCallout
					anchorRef={activeAnchorRef}
					calloutId={calloutId}
					service={activeService}
				/>
			) : null}
		</>
	);
}

export function HomeHeroSurfaceAssembly({
	services,
}: {
	services: HomeHeroServiceItem[];
}) {
	if (services.length === 0) return null;

	return (
		<ActiveStageHost
			autoCycle={false}
			count={services.length}
			initialIndex={0}
			className={assemblyHostClassName}
		>
			<LiveSurfaceAssemblyGrid services={services} />
		</ActiveStageHost>
	);
}

export function HomeHeroSurfaceAssemblySkeleton({
	services,
}: {
	services: HomeHeroServiceItem[];
}) {
	if (services.length === 0) return null;

	return (
		<div className={assemblyHostClassName}>
			<SurfaceAssemblyGrid services={services} skeleton />
		</div>
	);
}
