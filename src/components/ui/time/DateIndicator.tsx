// components/ui/DateIndicator.tsx
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Text, type textVariants } from "@/components/ui/primitives/Text";

type DateInput = Date | string | number;
type TextVariantProps = {
	[TKey in keyof VariantProps<typeof textVariants>]: Exclude<
		VariantProps<typeof textVariants>[TKey],
		null
	>;
};
type ParagraphTextProps = Omit<
	React.HTMLAttributes<HTMLParagraphElement>,
	"children"
> &
	TextVariantProps;

type DateIndicatorProps = ParagraphTextProps & {
	date?: DateInput;
	leadingText?: React.ReactNode;
};

const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Europe/Amsterdam"; // fallback if env not set

function toZonedParts(date: DateInput | undefined) {
	const baseDate = date ? new Date(date) : new Date();

	const formatter = new Intl.DateTimeFormat("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: APP_TIMEZONE,
	});

	const parts = formatter.formatToParts(baseDate);

	const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
	const dayStr = parts.find((p) => p.type === "day")?.value ?? "";
	const month = parts.find((p) => p.type === "month")?.value ?? "";

	const dayNum = Number(dayStr);

	return { weekday, dayNum, month };
}

function getOrdinalSuffix(day: number): string {
	const rem10 = day % 10;
	const rem100 = day % 100;

	if (rem10 === 1 && rem100 !== 11) return "st";
	if (rem10 === 2 && rem100 !== 12) return "nd";
	if (rem10 === 3 && rem100 !== 13) return "rd";
	return "th";
}

function DateIndicatorRoot({
	date,
	leadingText,
	...textProps
}: DateIndicatorProps) {
	const { weekday, dayNum, month } = toZonedParts(date);
	const suffix = getOrdinalSuffix(dayNum);

	const formatted = `${weekday}, ${dayNum}${suffix} ${month}`;

	return (
		<Text as="p" {...textProps}>
			{leadingText && <>{leadingText} </>}
			{formatted}
		</Text>
	);
}

export const DateIndicator = Object.assign(DateIndicatorRoot, {
	Skeleton: Text.Skeleton,
});
