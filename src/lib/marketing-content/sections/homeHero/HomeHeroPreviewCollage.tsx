"use client";

import Image, { type StaticImageData } from "next/image";
import { Skeleton, Tooltip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
import assemblyPreview from "../../../../../public/template-services/assembly.png";
import demoPreview from "../../../../../public/template-services/demo.png";
import demoPrimitivesPreview from "../../../../../public/template-services/demo-primitives.png";
import fullStartPreview from "../../../../../public/template-services/full-start.png";
import repositoryFootprintPreview from "../../../../../public/template-services/repository-footprint.png";
import thinStartPreview from "../../../../../public/template-services/thin-start.png";
import type {
	HomeHeroServiceItem,
	TemplateServiceSurfaceId,
} from "../../types";

type RenderedSurface = {
	height: number;
	name: string;
	src?: StaticImageData;
	width: number;
};

const renderedSurfaces: Record<TemplateServiceSurfaceId, RenderedSurface> = {
	demo: {
		name: "Demo Index",
		src: demoPreview,
		width: 1280,
		height: 1596,
	},
	demoPrimitives: {
		name: "UI Primitives",
		src: demoPrimitivesPreview,
		width: 1280,
		height: 2183,
	},
	assembly: {
		name: "Positive assembly plan",
		src: assemblyPreview,
		width: 920,
		height: 1200,
	},
	skillsPack: {
		name: "Averlo skills pack",
		width: 920,
		height: 900,
	},
	thinStart: {
		name: "Thin start homepage hero",
		src: thinStartPreview,
		width: 1280,
		height: 930,
	},
	repositoryFootprint: {
		name: "Repository footprint",
		src: repositoryFootprintPreview,
		width: 1280,
		height: 900,
	},
	fullStart: {
		name: "Full start dashboard",
		src: fullStartPreview,
		width: 1020,
		height: 900,
	},
} satisfies Record<TemplateServiceSurfaceId, RenderedSurface>;

type SurfaceGroupProps = {
	services: HomeHeroServiceItem[];
	skeleton?: boolean;
	surfaceIds: readonly TemplateServiceSurfaceId[];
};

const previewCollageHostClassName =
	"pointer-events-none absolute inset-0 z-10 overflow-x-clip overflow-y-visible";
function RealSurface({ surfaceId }: { surfaceId: TemplateServiceSurfaceId }) {
	const surface = renderedSurfaces[surfaceId];
	if (surfaceId === "skillsPack") {
		return <SkillsPackSurface />;
	}
	if (!surface.src) return null;

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
				placeholder="blur"
				sizes="(min-width: 1280px) 220px, 150px"
				src={surface.src}
				width={surface.width}
			/>
		</div>
	);
}

function SkillsPackSurface() {
	return (
		<div
			className="grid aspect-[46/45] gap-4 rounded-lg bg-background p-4 ring-1 ring-foreground/10"
			data-surface="Averlo skills pack"
		>
			<div className="grid gap-1">
				<Text as="p" variant="caption" tone="muted" interactive={false}>
					Averlo
				</Text>
				<Text as="p" variant="headingXs" interactive={false}>
					Skills pack
				</Text>
			</div>
			<div className="grid content-start gap-2 border-t border-foreground/10 pt-3">
				{[
					"Visual parity",
					"Static composition",
					"Motion composition",
					"Compose",
				].map((skill) => (
					<div className="flex items-center gap-2" key={skill}>
						<span className="size-1.5 rounded-full bg-primary" />
						<Text as="span" variant="caption" interactive={false}>
							{skill}
						</Text>
					</div>
				))}
			</div>
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
		["fullStart", "thinStart"].includes(surfaceId),
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

	const availableSurfaceIds = surfaceIds.filter((surfaceId) =>
		service.surfaceIds.includes(surfaceId),
	);

	if (skeleton) {
		return (
			<div className="grid gap-4">
				{availableSurfaceIds.map((surfaceId) => (
					<SurfaceSkeleton key={surfaceId} surfaceId={surfaceId} />
				))}
			</div>
		);
	}
	return (
		<InteractiveSurfaceHitbox
			service={service}
			surfaceIds={availableSurfaceIds}
		/>
	);
}

function PreviewCollageGrid({
	services,
	skeleton = false,
}: {
	services: HomeHeroServiceItem[];
	skeleton?: boolean;
}) {
	return (
		<div
			aria-hidden={skeleton || undefined}
			data-fidelity-preview-collage="real-template-surfaces"
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
					<div className="mt-16 grid">
						<SurfaceGroup
							services={services}
							skeleton={skeleton}
							surfaceIds={["thinStart", "repositoryFootprint"]}
						/>
					</div>
					<div className="mt-28 grid gap-y-[8rem]">
						<SurfaceGroup
							services={services}
							skeleton={skeleton}
							surfaceIds={["skillsPack"]}
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

export function HomeHeroPreviewCollage({
	services,
}: {
	services: HomeHeroServiceItem[];
}) {
	if (services.length === 0) return null;

	return (
		<div className={previewCollageHostClassName}>
			<PreviewCollageGrid services={services} />
		</div>
	);
}

export function HomeHeroPreviewCollageSkeleton({
	services,
}: {
	services: HomeHeroServiceItem[];
}) {
	if (services.length === 0) return null;

	return (
		<div className={previewCollageHostClassName}>
			<PreviewCollageGrid services={services} skeleton />
		</div>
	);
}
