/** biome-ignore-all lint/a11y/useSemanticElements: the calendar follows the WAI-ARIA roving-focus button grid pattern */
"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import clsx from "clsx";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import {
	Dropdown,
	type DropdownPositionStrategy,
} from "@/components/ui/primitives/dropdown";
import {
	addDays,
	addMonths,
	addYears,
	DATE_RANGE_PRESETS,
	formatDisplayDate,
	formatISODate,
	getCalendarDays,
	getMatchingDateRangePreset,
	getMonthLabel,
	getMonthName,
	getTodayISO,
	isDateInBounds,
	parseISODate,
	resolveDateRangePreset,
	sortDateRange,
	startOfMonth,
	WEEKDAY_LABELS,
} from "./dateUtils";
import type {
	DateRangeChangeReason,
	DateRangePresetKey,
	DateRangeValue,
	ISODateString,
} from "./types";

type CalendarPopoverProps = {
	anchorRef: React.RefObject<HTMLDivElement | null>;
	dropdownPortalTargetId?: string;
	dropdownPositionStrategy?: DropdownPositionStrategy;
	max?: ISODateString;
	min?: ISODateString;
	mode: "range" | "single";
	onChangeRange?: (
		value: DateRangeValue | null,
		reason: DateRangeChangeReason,
	) => void;
	onChangeSingle?: (value: ISODateString | null) => void;
	onOpenChange: (open: boolean, restoreFocus?: boolean) => void;
	open: boolean;
	presets?: readonly DateRangePresetKey[];
	required?: boolean;
	valueRange?: DateRangeValue | null;
	valueSingle?: ISODateString | null;
};

const calendarButtonClassName = clsx(
	"inline-flex items-center justify-center rounded-full text-foreground outline-none",
	"hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
	focusRing.visibleDefault,
);

function getInitialFocusDate({
	max,
	min,
	value,
}: {
	max?: ISODateString;
	min?: ISODateString;
	value?: ISODateString | null;
}) {
	const candidate = parseISODate(value) ? value : getTodayISO();
	if (candidate && isDateInBounds(candidate, min, max)) return candidate;
	if (min && parseISODate(min)) return min;
	if (max && parseISODate(max)) return max;
	return getTodayISO();
}

export function CalendarPopover({
	anchorRef,
	dropdownPortalTargetId,
	dropdownPositionStrategy = "absolute",
	max,
	min,
	mode,
	onChangeRange,
	onChangeSingle,
	onOpenChange,
	open,
	presets = DATE_RANGE_PRESETS.map((preset) => preset.key),
	required,
	valueRange,
	valueSingle,
}: CalendarPopoverProps) {
	const panelRef = React.useRef<HTMLDivElement | null>(null);
	const dateButtonRefs = React.useRef(
		new Map<ISODateString, HTMLButtonElement>(),
	);
	const initialValue = mode === "single" ? valueSingle : valueRange?.start;
	const initialFocus = getInitialFocusDate({ max, min, value: initialValue });
	const [visibleMonth, setVisibleMonth] = React.useState(() =>
		startOfMonth(parseISODate(initialFocus) ?? new Date()),
	);
	const [focusedDate, setFocusedDate] = React.useState(initialFocus);
	const [draftStart, setDraftStart] = React.useState<ISODateString | null>(
		null,
	);
	const [previewEnd, setPreviewEnd] = React.useState<ISODateString | null>(
		null,
	);
	const todayValue = getTodayISO();

	const close = React.useEffectEvent((restoreFocus = false) => {
		setDraftStart(null);
		setPreviewEnd(null);
		onOpenChange(false, restoreFocus);
	});

	React.useEffect(() => {
		if (!open) return;
		const nextFocus = getInitialFocusDate({
			max,
			min,
			value: mode === "single" ? valueSingle : valueRange?.start,
		});
		setFocusedDate(nextFocus);
		setVisibleMonth(startOfMonth(parseISODate(nextFocus) ?? new Date()));
		const frame = requestAnimationFrame(() => {
			dateButtonRefs.current.get(nextFocus)?.focus({ preventScroll: true });
		});
		return () => cancelAnimationFrame(frame);
	}, [max, min, mode, open, valueRange?.start, valueSingle]);

	React.useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				!anchorRef.current?.contains(target) &&
				!panelRef.current?.contains(target)
			) {
				close(false);
			}
		};
		const handleFocusIn = (event: FocusEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				!anchorRef.current?.contains(target) &&
				!panelRef.current?.contains(target)
			) {
				close(false);
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			close(true);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("focusin", handleFocusIn);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("focusin", handleFocusIn);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [anchorRef, open]);

	React.useEffect(() => {
		if (!open) return;
		const frame = requestAnimationFrame(() => {
			dateButtonRefs.current.get(focusedDate)?.focus({ preventScroll: true });
		});
		return () => cancelAnimationFrame(frame);
	}, [focusedDate, open]);

	if (!open) return null;

	const calendarDays = getCalendarDays(visibleMonth);
	const previewRange =
		mode === "range" && draftStart
			? sortDateRange(draftStart, previewEnd ?? draftStart)
			: valueRange;
	const matchingPreset = getMatchingDateRangePreset(
		valueRange ?? null,
		presets,
		todayValue,
	);
	const visibleYear = visibleMonth.getUTCFullYear();
	const visibleMonthIndex = visibleMonth.getUTCMonth();
	const todayYear = parseISODate(todayValue)?.getUTCFullYear() ?? visibleYear;
	const minimumYear =
		parseISODate(min)?.getUTCFullYear() ??
		Math.min(todayYear - 50, visibleYear);
	const maximumYear =
		parseISODate(max)?.getUTCFullYear() ??
		Math.max(todayYear + 50, visibleYear);
	const monthOptions = Array.from({ length: 12 }, (_, monthIndex) => ({
		content: getMonthName(monthIndex),
		key: monthIndex,
		selected: monthIndex === visibleMonthIndex,
		value: monthIndex,
	}));
	const yearOptions = Array.from(
		{ length: Math.max(0, maximumYear - minimumYear + 1) },
		(_, index) => {
			const year = minimumYear + index;
			return {
				content: String(year),
				key: year,
				selected: year === visibleYear,
				value: year,
			};
		},
	);

	const moveFocus = (nextDate: Date) => {
		let nextValue = formatISODate(nextDate);
		if (min && nextValue < min) nextValue = min;
		if (max && nextValue > max) nextValue = max;
		const parsedNext = parseISODate(nextValue);
		if (!parsedNext) return;
		setFocusedDate(nextValue);
		setVisibleMonth(startOfMonth(parsedNext));
		if (draftStart) setPreviewEnd(nextValue);
	};

	const handleDateKeyDown = (
		event: React.KeyboardEvent<HTMLButtonElement>,
		date: Date,
	) => {
		if (event.key === "Enter" || event.key === " ") return;
		let nextDate: Date | null = null;
		switch (event.key) {
			case "ArrowDown":
				nextDate = addDays(date, 7);
				break;
			case "ArrowLeft":
				nextDate = addDays(date, -1);
				break;
			case "ArrowRight":
				nextDate = addDays(date, 1);
				break;
			case "ArrowUp":
				nextDate = addDays(date, -7);
				break;
			case "End":
				nextDate = addDays(date, 6 - ((date.getUTCDay() + 6) % 7));
				break;
			case "Home":
				nextDate = addDays(date, -((date.getUTCDay() + 6) % 7));
				break;
			case "PageDown":
				nextDate = event.shiftKey ? addYears(date, 1) : addMonths(date, 1);
				break;
			case "PageUp":
				nextDate = event.shiftKey ? addYears(date, -1) : addMonths(date, -1);
				break;
			default:
				return;
		}
		event.preventDefault();
		moveFocus(nextDate);
	};

	const commitDate = (dateValue: ISODateString) => {
		if (mode === "single") {
			onChangeSingle?.(dateValue);
			close(true);
			return;
		}
		if (!draftStart) {
			setDraftStart(dateValue);
			setPreviewEnd(dateValue);
			return;
		}
		onChangeRange?.(sortDateRange(draftStart, dateValue), "custom");
		close(true);
	};

	const commitToday = () => {
		if (mode === "single") {
			onChangeSingle?.(todayValue);
		} else {
			onChangeRange?.({ end: todayValue, start: todayValue }, "today");
		}
		close(true);
	};

	const clearValue = () => {
		if (mode === "single") onChangeSingle?.(null);
		else onChangeRange?.(null, "clear");
		close(true);
	};

	return (
		<Dropdown.Panel
			align="start"
			anchorRef={anchorRef}
			aria-label={mode === "single" ? "Choose date" : "Choose date range"}
			aria-modal="false"
			background="transparent"
			border="none"
			className={clsx(
				dropdownPositionStrategy === "absolute" && "left-0 top-full",
				"!w-[18.875rem]",
				"!max-w-[calc(100vw-2rem)]",
				"!overflow-visible !rounded-none !border-0 !bg-transparent !shadow-none",
			)}
			data-calendar-mode={mode}
			data-slot="calendar-popover"
			overflow="visible"
			portalTargetId={dropdownPortalTargetId}
			positionStrategy={dropdownPositionStrategy}
			ref={panelRef}
			role="dialog"
			shadow="none"
		>
			<Card className="w-full" shadow="lg" size="sm">
				<Card.Header className="border-b">
					<div className="flex w-full items-center justify-between gap-2">
						<button
							aria-label="Previous month"
							className={clsx(calendarButtonClassName, "size-8")}
							onClick={() =>
								setVisibleMonth((current) => addMonths(current, -1))
							}
							type="button"
						>
							<CaretLeft aria-hidden size={16} />
						</button>
						<div className="flex min-w-0 items-center gap-1">
							<Dropdown.Listbox
								align="start"
								ariaLabel="Choose month"
								menuMinWidth={120}
								onSelect={(monthIndex) =>
									setVisibleMonth(
										new Date(Date.UTC(visibleYear, monthIndex, 1)),
									)
								}
								options={monthOptions}
								positionStrategy="absolute"
								triggerButtonProps={{
									className: "!pr-0",
									size: "sm",
									variant: "ghost",
								}}
								triggerContent={getMonthName(visibleMonthIndex)}
							/>
							<Dropdown.Listbox
								align="start"
								ariaLabel="Choose year"
								menuMinWidth={88}
								onSelect={(year) =>
									setVisibleMonth(
										new Date(Date.UTC(year, visibleMonthIndex, 1)),
									)
								}
								options={yearOptions}
								positionStrategy="absolute"
								triggerButtonProps={{
									className: "!pl-0",
									size: "sm",
									variant: "ghost",
								}}
								triggerContent={visibleYear}
							/>
						</div>
						<button
							aria-label="Next month"
							className={clsx(calendarButtonClassName, "size-8")}
							onClick={() =>
								setVisibleMonth((current) => addMonths(current, 1))
							}
							type="button"
						>
							<CaretRight aria-hidden size={16} />
						</button>
					</div>
				</Card.Header>

				<Card.Content className="grid gap-3" data-calendar-slot="core">
					<div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
						{WEEKDAY_LABELS.map((weekday) => (
							<div className="py-1" key={weekday}>
								{weekday}
							</div>
						))}
					</div>
					<div
						aria-label={getMonthLabel(visibleMonth)}
						className={clsx(
							"grid grid-cols-7 gap-y-1",
							mode === "single" && "gap-x-1",
						)}
						role="grid"
					>
						{calendarDays.map((date) => {
							const dateValue = formatISODate(date);
							const inMonth = date.getUTCMonth() === visibleMonth.getUTCMonth();
							const disabled = !isDateInBounds(dateValue, min, max);
							const selectedSingle =
								mode === "single" && dateValue === valueSingle;
							const selectedStart =
								mode === "range" && dateValue === previewRange?.start;
							const selectedEnd =
								mode === "range" && dateValue === previewRange?.end;
							const selectedEndpoint = selectedStart || selectedEnd;
							const rangeHasSpan = previewRange?.start !== previewRange?.end;
							const inRange =
								mode === "range" &&
								Boolean(previewRange) &&
								dateValue >= (previewRange?.start ?? "") &&
								dateValue <= (previewRange?.end ?? "");

							return (
								<div
									className="relative flex h-9 items-center justify-center"
									key={dateValue}
								>
									{inRange && rangeHasSpan ? (
										<span
											aria-hidden
											className={clsx(
												"absolute inset-y-0 bg-primary/10",
												selectedStart
													? "left-1/2 right-0"
													: selectedEnd
														? "left-0 right-1/2"
														: "inset-x-0",
											)}
										/>
									) : null}
									<button
										aria-current={dateValue === todayValue ? "date" : undefined}
										aria-label={formatDisplayDate(dateValue)}
										aria-selected={selectedSingle || inRange}
										className={clsx(
											"relative z-10 inline-flex size-9 items-center justify-center rounded-full text-sm outline-none transition-colors motion-micro",
											selectedSingle || selectedEndpoint
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted",
											inRange &&
												!selectedEndpoint &&
												"text-foreground hover:bg-primary/15",
											!inMonth &&
												!selectedSingle &&
												!selectedEndpoint &&
												"text-muted-foreground/50",
											focusRing.visibleDefault,
										)}
										disabled={disabled}
										onClick={() => commitDate(dateValue)}
										onFocus={() => {
											setFocusedDate(dateValue);
											if (draftStart) setPreviewEnd(dateValue);
										}}
										onKeyDown={(event) => handleDateKeyDown(event, date)}
										onPointerEnter={() => {
											if (draftStart && !disabled) setPreviewEnd(dateValue);
										}}
										ref={(node) => {
											if (node) dateButtonRefs.current.set(dateValue, node);
											else dateButtonRefs.current.delete(dateValue);
										}}
										role="gridcell"
										tabIndex={dateValue === focusedDate ? 0 : -1}
										type="button"
									>
										{date.getUTCDate()}
									</button>
								</div>
							);
						})}
					</div>
				</Card.Content>

				<Card.Footer
					className="flex flex-row flex-wrap items-center gap-2"
					data-calendar-slot="footer"
				>
					{mode === "range" && presets.length > 0
						? DATE_RANGE_PRESETS.filter((preset) =>
								presets.includes(preset.key),
							).map((preset) => (
								<Button
									key={preset.key}
									onClick={() => {
										onChangeRange?.(
											resolveDateRangePreset(preset.key, todayValue),
											preset.key,
										);
										close(true);
									}}
									size="sm"
									variant={
										matchingPreset === preset.key ? "primary" : "secondary"
									}
								>
									{preset.label}
								</Button>
							))
						: null}
					<Button onClick={commitToday} size="sm" variant="secondary">
						Today
					</Button>
					{required ? null : (
						<Button onClick={clearValue} size="sm" variant="ghost">
							Clear
						</Button>
					)}
				</Card.Footer>
			</Card>
		</Dropdown.Panel>
	);
}
