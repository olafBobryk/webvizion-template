"use client";

import clsx from "clsx";
import {
	animate,
	motion,
	useMotionValue,
	useMotionValueEvent,
} from "motion/react";
import {
	type PointerEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { getSpring } from "@/components/ui/foundations/spring";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

export type CarouselItem = {
	content: ReactNode;
	id: string;
	label: string;
};

export type CarouselProps = {
	ariaLabel: string;
	gutter?: "none" | "section";
	initialIndex?: number;
	items: readonly CarouselItem[];
	onIndexChange?: (index: number) => void;
	paginationLabel?: string;
};

type PointerDrag = {
	dragged: boolean;
	lastTime: number;
	lastX: number;
	pointerId: number;
	startTrackX: number;
	startX: number;
	velocityX: number;
};

function clampIndex(index: number, count: number) {
	return Math.max(0, Math.min(Math.round(index), Math.max(0, count - 1)));
}

export function Carousel({
	ariaLabel,
	gutter = "section",
	initialIndex = 0,
	items,
	onIndexChange,
	paginationLabel = "Choose a slide",
}: CarouselProps) {
	const viewportRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const settleAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
	const suppressClickRef = useRef(false);
	const suppressClickTimerRef = useRef<number | null>(null);
	const positionIndexRef = useRef(clampIndex(initialIndex, items.length));
	const dragRef = useRef<PointerDrag | null>(null);
	const [activeIndex, setActiveIndex] = useState(positionIndexRef.current);
	const [isDragging, setIsDragging] = useState(false);
	const [snapPoints, setSnapPoints] = useState<readonly number[]>([0]);
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const shouldAnimate = motionAllowed && !motionDisabled;
	const trackX = useMotionValue(0);

	useMotionValueEvent(trackX, "change", (value) => {
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;
		for (const [index, point] of snapPoints.entries()) {
			const distance = Math.abs(point - value);
			if (distance < closestDistance) {
				closestIndex = index;
				closestDistance = distance;
			}
		}
		positionIndexRef.current = closestIndex;
		setActiveIndex((currentIndex) => {
			if (currentIndex === closestIndex) return currentIndex;
			onIndexChange?.(closestIndex);
			return closestIndex;
		});
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: changing the item count must rebuild the measured snap-point list.
	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const track = trackRef.current;
		if (!viewport || !track) return undefined;

		const measure = () => {
			const slides = Array.from(
				track.querySelectorAll<HTMLElement>("[data-carousel-slide]"),
			);
			const firstSlide = slides[0];
			if (!firstSlide || viewport.offsetWidth === 0) return;
			const firstOffset = firstSlide.offsetLeft;
			const nextSnapPoints = slides.map(
				(slide) => -(slide.offsetLeft - firstOffset),
			);
			setSnapPoints(nextSnapPoints);
			const nextIndex = clampIndex(positionIndexRef.current, slides.length);
			positionIndexRef.current = nextIndex;
			trackX.jump(nextSnapPoints[nextIndex] ?? 0);
		};

		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(viewport);
		resizeObserver.observe(track);
		return () => resizeObserver.disconnect();
	}, [items.length, trackX]);

	useEffect(
		() => () => {
			settleAnimationRef.current?.stop();
			if (suppressClickTimerRef.current !== null) {
				window.clearTimeout(suppressClickTimerRef.current);
			}
		},
		[],
	);

	const scrollToIndex = useCallback(
		(index: number) => {
			const selectedIndex = clampIndex(index, items.length);
			const slides = Array.from(
				trackRef.current?.querySelectorAll<HTMLElement>(
					"[data-carousel-slide]",
				) ?? [],
			);
			const firstSlide = slides[0];
			const selectedSlide = slides[selectedIndex];
			const target =
				firstSlide && selectedSlide
					? -(selectedSlide.offsetLeft - firstSlide.offsetLeft)
					: snapPoints[selectedIndex];
			if (target === undefined) return;
			settleAnimationRef.current?.stop();
			if (shouldAnimate) {
				settleAnimationRef.current = animate(
					trackX,
					target,
					getSpring("interaction"),
				);
			} else {
				trackX.jump(target);
			}
			positionIndexRef.current = selectedIndex;
			setActiveIndex(selectedIndex);
			onIndexChange?.(selectedIndex);
		},
		[items.length, onIndexChange, shouldAnimate, snapPoints, trackX],
	);

	const settleDrag = useCallback(
		(velocityX: number) => {
			const slideStep = Math.abs((snapPoints[1] ?? 0) - (snapPoints[0] ?? 0));
			const velocityProjection = Math.max(
				-slideStep * 0.42,
				Math.min(slideStep * 0.42, velocityX * 0.12),
			);
			const projectedX = trackX.get() + velocityProjection;
			let closestIndex = 0;
			let closestDistance = Number.POSITIVE_INFINITY;
			for (const [index, point] of snapPoints.entries()) {
				const distance = Math.abs(point - projectedX);
				if (distance < closestDistance) {
					closestIndex = index;
					closestDistance = distance;
				}
			}

			const target = snapPoints[closestIndex] ?? 0;
			settleAnimationRef.current?.stop();
			if (shouldAnimate) {
				settleAnimationRef.current = animate(trackX, target, {
					...getSpring("interaction", { expressive: 0.35 }),
					velocity: velocityX,
				});
			} else {
				trackX.jump(target);
			}
			positionIndexRef.current = closestIndex;
			setActiveIndex(closestIndex);
			onIndexChange?.(closestIndex);
			setIsDragging(false);
			suppressClickTimerRef.current = window.setTimeout(() => {
				suppressClickRef.current = false;
				suppressClickTimerRef.current = null;
			}, 0);
		},
		[onIndexChange, shouldAnimate, snapPoints, trackX],
	);

	const finishDrag = useCallback(
		(event: PointerEvent<HTMLElement>) => {
			const pointer = dragRef.current;
			if (!pointer || pointer.pointerId !== event.pointerId) return;
			dragRef.current = null;
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			setIsDragging(false);
			if (!pointer.dragged) return;
			settleDrag(pointer.velocityX);
		},
		[settleDrag],
	);

	const beginPointerDrag = useCallback(
		(event: PointerEvent<HTMLElement>) => {
			if (event.button !== 0) return;
			settleAnimationRef.current?.stop();
			if (suppressClickTimerRef.current !== null) {
				window.clearTimeout(suppressClickTimerRef.current);
				suppressClickTimerRef.current = null;
			}
			suppressClickRef.current = false;
			dragRef.current = {
				dragged: false,
				lastTime: event.timeStamp,
				lastX: event.clientX,
				pointerId: event.pointerId,
				startTrackX: trackX.get(),
				startX: event.clientX,
				velocityX: 0,
			};
		},
		[trackX],
	);

	const updatePointerDrag = useCallback(
		(event: PointerEvent<HTMLElement>) => {
			const pointer = dragRef.current;
			if (!pointer || pointer.pointerId !== event.pointerId) return;
			const distance = event.clientX - pointer.startX;
			if (Math.abs(distance) > 4 && !pointer.dragged) {
				pointer.dragged = true;
				event.currentTarget.setPointerCapture(event.pointerId);
				suppressClickRef.current = true;
				setIsDragging(true);
			}
			if (!pointer.dragged) return;
			const elapsed = Math.max(1, event.timeStamp - pointer.lastTime);
			const instantaneousVelocity =
				((event.clientX - pointer.lastX) / elapsed) * 1000;
			pointer.velocityX =
				pointer.velocityX * 0.55 + instantaneousVelocity * 0.45;
			pointer.lastTime = event.timeStamp;
			pointer.lastX = event.clientX;
			const leftConstraint = snapPoints.at(-1) ?? 0;
			const rawTarget = pointer.startTrackX + distance;
			const elasticTarget =
				rawTarget > 0
					? rawTarget * 0.14
					: rawTarget < leftConstraint
						? leftConstraint + (rawTarget - leftConstraint) * 0.14
						: rawTarget;
			trackX.jump(elasticTarget);
		},
		[snapPoints, trackX],
	);

	if (items.length === 0) return null;

	return (
		<div data-carousel-owner="">
			<section
				ref={viewportRef}
				aria-label={ariaLabel}
				aria-roledescription="carousel"
				className={clsx(
					"overflow-hidden overscroll-x-contain pb-2.5 touch-pan-y",
					gutter === "section" &&
						"-ml-[var(--spacing-section-x)] w-[calc(100%+2*var(--spacing-section-x))]",
				)}
				data-carousel-dragging={isDragging ? "true" : undefined}
				data-carousel-gutter={gutter}
				onClickCapture={(event) => {
					if (!suppressClickRef.current) return;
					event.preventDefault();
					event.stopPropagation();
					suppressClickRef.current = false;
				}}
				onPointerCancel={finishDrag}
				onPointerDown={beginPointerDrag}
				onPointerMove={updatePointerDrag}
				onPointerUp={finishDrag}
			>
				<motion.div
					ref={trackRef}
					className="w-max will-change-transform"
					data-carousel-track=""
					style={{ x: trackX }}
				>
					<div
						className={clsx(
							"flex cursor-grab items-start gap-4 sm:gap-5",
							isDragging && "cursor-grabbing select-none",
							gutter === "section" && "px-[var(--spacing-section-x)]",
						)}
					>
						{items.map((item, index) => (
							<fieldset
								aria-label={`${index + 1} of ${items.length}: ${item.label}`}
								aria-roledescription="slide"
								className="m-0 min-w-0 flex-none basis-[min(70vw,27rem)] border-0 p-0 sm:basis-[min(53.2vw,27rem)]"
								data-carousel-slide=""
								key={item.id}
							>
								{item.content}
							</fieldset>
						))}
					</div>
				</motion.div>
			</section>
			{items.length > 1 ? (
				<nav
					aria-label={paginationLabel}
					className="mt-6 flex items-center gap-2"
					data-carousel-pagination=""
				>
					{items.map((item, index) => (
						<button
							aria-current={activeIndex === index ? "true" : undefined}
							aria-label={`Show slide ${index + 1}: ${item.label}`}
							className={clsx(
								focusRing.visibleDefault,
								"size-2.5 cursor-pointer rounded-full border-0 bg-foreground/20 transition-[background-color,transform] motion-interactive",
								activeIndex === index && "scale-[1.15] bg-primary",
							)}
							key={item.id}
							onClick={() => scrollToIndex(index)}
							type="button"
						/>
					))}
				</nav>
			) : null}
		</div>
	);
}
