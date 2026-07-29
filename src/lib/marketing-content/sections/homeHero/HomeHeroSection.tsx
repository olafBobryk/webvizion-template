"use client";

import * as Reveal from "@/components/ui/motion/reveal";
import { Button } from "@/components/ui/primitives/Button";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";
import type { HomeHeroSectionBlock } from "../../types";
import {
	HomeHeroSurfaceAssembly,
	HomeHeroSurfaceAssemblySkeleton,
} from "./HomeHeroSurfaceAssembly";

type HomeHeroSectionProps = {
	section: HomeHeroSectionBlock;
};

function HomeHeroSectionRoot({ section }: HomeHeroSectionProps) {
	const description = section.descriptions[0]?.text ?? "";

	return (
		<Section
			id={section.id ?? "home-hero"}
			height="hero"
			background="background"
			padding="hero"
			className="!overflow-visible"
		>
			<Section.Background className="flex justify-center overflow-hidden rtl:-scale-x-100">
				<div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,rgb(var(--color-primary-rgb)_/_0.24),transparent_62%)]" />
				<div className="absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
			</Section.Background>
			<HomeHeroSurfaceAssembly services={section.services} />
			<Reveal.Sequence className="pointer-events-none relative z-20 flex w-full grow flex-col justify-between">
				<div className="flex flex-col gap-10 max-w-150 items-start">
					<div className="space-y-[25px]">
						<Reveal.Item
							variants={{
								hidden: { opacity: 0, x: -20 },
								show: { opacity: 1, x: 0 },
							}}
						>
							<Text as="h1" variant="headingHero">
								{section.headline}
							</Text>
						</Reveal.Item>
						<Reveal.Item
							className="justify-end self-end lg:hidden"
							variants={{
								hidden: { opacity: 0, x: -20 },
								show: { opacity: 1, x: 0 },
							}}
						>
							<HeroDescription
								description={description}
								className="text-shadow max-w-400"
							/>
						</Reveal.Item>
					</div>
					<Reveal.Item
						variants={{
							hidden: { opacity: 0, x: -20 },
							show: { opacity: 1, x: 0 },
						}}
					>
						<Button
							href={section.cta.href}
							variant="primary"
							size="md"
							className="pointer-events-auto"
						>
							{section.cta.label}
						</Button>
					</Reveal.Item>
				</div>
				<div className="h-100 md:hidden" />

				<Reveal.Item
					className="justify-end self-end hidden lg:flex"
					variants={{
						hidden: { opacity: 0, x: 20 },
						show: { opacity: 1, x: 0 },
					}}
				>
					<HeroDescription description={description} className="max-w-75" />
				</Reveal.Item>
			</Reveal.Sequence>
		</Section>
	);
}

function HomeHeroSectionSkeleton({ section }: HomeHeroSectionProps) {
	const description =
		section.descriptions[0]?.text ?? "A clear product description";
	return (
		<Section
			id={section.id ?? "home-hero"}
			height="hero"
			background="background"
			padding="hero"
			className="!overflow-visible"
		>
			<Section.Background className="flex justify-center overflow-hidden rtl:-scale-x-100">
				<div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,rgb(var(--color-primary-rgb)_/_0.24),transparent_62%)]" />
				<div className="absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
			</Section.Background>
			<HomeHeroSurfaceAssemblySkeleton services={section.services} />
			<div className="pointer-events-none relative z-20 flex w-full grow flex-col justify-between">
				<div className="flex flex-col gap-10 max-w-150 items-start">
					<div className="space-y-[25px]">
						<Text.Skeleton as="h1" variant="headingHero">
							{section.headline}
						</Text.Skeleton>
						<Text.Skeleton
							as="p"
							variant="body"
							className="max-w-400 lg:hidden"
						>
							{description}
						</Text.Skeleton>
					</div>
					<Button.Skeleton size="md" variant="primary">
						{section.cta.label}
					</Button.Skeleton>
				</div>
				<div className="h-100 md:hidden" />
				<Text.Skeleton
					as="p"
					variant="body"
					className="max-w-75 self-end hidden lg:block"
				>
					{description}
				</Text.Skeleton>
			</div>
		</Section>
	);
}

export const HomeHeroSection = Object.assign(HomeHeroSectionRoot, {
	Skeleton: HomeHeroSectionSkeleton,
});

function HeroDescription({
	description,
	className,
}: {
	description: string;
	className?: string;
}) {
	return (
		<Text
			as="p"
			variant="body"
			tone="muted"
			interactive={false}
			className={className}
		>
			{description}
		</Text>
	);
}
