"use client";

import Image from "next/image";
import { Skeleton, Tooltip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
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
	services: HomeHeroServiceItem[];
	skeleton?: boolean;
	surfaceIds: readonly TemplateServiceSurfaceId[];
};

const assemblyHostClassName =
	"pointer-events-none absolute inset-0 z-10 overflow-visible";
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
	service,
	surfaceIds,
}: {
	service: HomeHeroServiceItem;
	surfaceIds: readonly TemplateServiceSurfaceId[];
}) {
	const surfaceNames = surfaceIds.map(
		(surfaceId) => renderedSurfaces[surfaceId].name,
	);
	const alignsEnd = service.surfaceIds.some((surfaceId) =>
		["fullStart", "playground", "thinStart"].includes(surfaceId),
	);

	return (
		<div className="pointer-events-auto min-w-0">
			<Tooltip
				align={alignsEnd ? "end" : "start"}
				className="w-full"
				content={
					<div className="grid gap-2" data-service-tooltip={service.id}>
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
					</div>
				}
				offset={14}
				width={260}
			>
				<Button
					type="button"
					variant="ghost"
					size="none"
					align="left"
					radius="sm"
					aria-label={`Show ${service.title} details for ${surfaceNames.join(" and ")}`}
					className="!block w-full !whitespace-normal !rounded-lg !border-0 !bg-transparent p-0 hover:!opacity-100 active:!translate-y-0"
					contentClassName="!block w-full"
					data-service-id={service.id}
					data-surface-hitbox={surfaceIds.join(",")}
				>
					<span className="grid w-full gap-4">
						{surfaceIds.map((surfaceId) => (
							<RealSurface key={surfaceId} surfaceId={surfaceId} />
						))}
					</span>
				</Button>
			</Tooltip>
		</div>
	);
}

function SurfaceGroup({
	services,
	skeleton = false,
	surfaceIds,
}: SurfaceGroupProps) {
	const service = services.find((service) =>
		surfaceIds.some((surfaceId) => service.surfaceIds.includes(surfaceId)),
	);

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
	return <InteractiveSurfaceHitbox service={service} surfaceIds={surfaceIds} />;
}

function SurfaceAssemblyGrid({
	services,
	skeleton = false,
}: {
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
							services={services}
							skeleton={skeleton}
							surfaceIds={["assembly"]}
						/>
					</div>
					<div className="grid gap-4">
						<SurfaceGroup
							services={services}
							skeleton={skeleton}
							surfaceIds={["demo", "demoPrimitives"]}
						/>
					</div>
					<div className="mt-16 grid gap-y-[12rem]">
						<SurfaceGroup
							services={services}
							skeleton={skeleton}
							surfaceIds={["intelligence"]}
						/>
						<SurfaceGroup
							services={services}
							skeleton={skeleton}
							surfaceIds={["thinStart"]}
						/>
					</div>
					<div className="mt-28 grid gap-y-[8rem]">
						<SurfaceGroup
							services={services}
							skeleton={skeleton}
							surfaceIds={["playground"]}
						/>
						<SurfaceGroup
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

export function HomeHeroSurfaceAssembly({
	services,
}: {
	services: HomeHeroServiceItem[];
}) {
	if (services.length === 0) return null;

	return (
		<div className={assemblyHostClassName}>
			<SurfaceAssemblyGrid services={services} />
		</div>
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
