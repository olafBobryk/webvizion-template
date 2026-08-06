"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import * as MotionEffect from "@/components/ui/motion/effect";
import * as MotionSource from "@/components/ui/motion/source";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";

export default function MotionPlaygroundPage() {
	const [active, setActive] = useState(false);
	const [replayKey, setReplayKey] = useState(0);
	const [imageReady, setImageReady] = useState(false);

	return (
		<main className="mx-auto grid w-full max-w-6xl gap-16 overflow-hidden px-6 py-20">
			<header className="grid gap-3">
				<Text as="h1" variant="headingXl">
					Motion source and effect QA
				</Text>
				<Text tone="muted">
					Each visual effect consumes the nearest normalized source.
				</Text>
			</header>

			<section className="grid gap-6">
				<Text as="h2" variant="headingMd">
					Interaction sources
				</Text>
				<div className="grid gap-5 md:grid-cols-2">
					<Link
						data-motion-owner
						className={`rounded-lg border border-subtle p-6 text-xl ${focusRing.visibleDefault}`}
						href="#owner-hover"
					>
						<MotionSource.Root as="span" strategy={{ type: "owner-hover" }}>
							<MotionEffect.UnderlineText>
								Owner hover can span more than one line
							</MotionEffect.UnderlineText>
						</MotionSource.Root>
					</Link>
					<Panel padding="md">
						<Button
							onClick={() => setActive((value) => !value)}
							size="sm"
							variant="secondary"
						>
							Toggle boolean
						</Button>
						<MotionSource.Root strategy={{ type: "boolean", active }}>
							<MotionEffect.TextHighlight className="mt-5 block text-xl">
								Boolean progress highlights this sentence.
							</MotionEffect.TextHighlight>
						</MotionSource.Root>
					</Panel>
				</div>
			</section>

			<section className="grid gap-6">
				<div className="flex items-center justify-between gap-4">
					<Text as="h2" variant="headingMd">
						Reveal sequence
					</Text>
					<Button
						onClick={() => setReplayKey((value) => value + 1)}
						size="sm"
						variant="secondary"
					>
						Replay
					</Button>
				</div>
				<MotionSource.Sequence
					key={replayKey}
					className="grid gap-4 md:grid-cols-3"
					stagger={0.12}
				>
					<MotionSource.Root strategy={{ type: "reveal" }}>
						<Panel padding="md">
							<MotionEffect.TextReveal variant="headingSm">
								Character reveal
							</MotionEffect.TextReveal>
						</Panel>
					</MotionSource.Root>
					<MotionSource.Root strategy={{ type: "reveal" }}>
						<Panel padding="md">
							<MotionEffect.Scramble maintainSpace text="Seeded scramble" />
						</Panel>
					</MotionSource.Root>
					<MotionSource.Root strategy={{ type: "reveal" }}>
						<Panel padding="md">
							<MotionEffect.Number
								animation="countUp"
								className="text-4xl font-semibold"
								text="2048 builds"
							/>
						</Panel>
					</MotionSource.Root>
				</MotionSource.Sequence>
			</section>

			<section className="grid gap-6">
				<Text as="h2" variant="headingMd">
					Load-gated generic clip
				</Text>
				<MotionSource.Sequence>
					<MotionSource.Root
						className="relative aspect-[16/9] overflow-hidden"
						strategy={{ type: "reveal", ready: imageReady }}
					>
						<MotionEffect.Clip
							className="h-full w-full"
							finalRadius={18}
							origin={{ block: "start", inline: "start" }}
							variant="corner"
						>
							<MotionEffect.ScaleFade className="h-full w-full" asChild>
								<Image
									alt="Abstract placeholder"
									className="object-cover"
									fill
									onError={() => setImageReady(true)}
									onLoad={() => setImageReady(true)}
									sizes="(min-width: 1024px) 72rem, 100vw"
									src="/test/placeholder-portrait.jpg"
								/>
							</MotionEffect.ScaleFade>
						</MotionEffect.Clip>
					</MotionSource.Root>
				</MotionSource.Sequence>
			</section>

			<MotionSource.Root
				className="grid min-h-[150vh] content-center gap-10"
				strategy={{ type: "scroll", offset: ["start end", "end start"] }}
			>
				<MotionEffect.TextShift className="text-5xl font-semibold">
					Shared scroll progress shifts this text
				</MotionEffect.TextShift>
				<MotionEffect.TextReplay
					className="text-3xl"
					repeats={2}
					text="Scroll replay"
				/>
				<MotionEffect.Divider />
				<MotionEffect.Parallax magnitude={36}>
					<Panel padding="lg">
						<MotionEffect.TextHighlight variant="headingSm">
							One source drives every effect in this scene.
						</MotionEffect.TextHighlight>
					</Panel>
				</MotionEffect.Parallax>
			</MotionSource.Root>
		</main>
	);
}
