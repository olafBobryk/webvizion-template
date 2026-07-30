import type { CountryCode } from "libphonenumber-js";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

export type CountryOption = {
	code: CountryCode;
	name: string;
	dialCode: string;
};

export type InternalCountryOption = {
	code: CountryCode;
	name: string;
	dial_code: string;
	flag: string;
};

const normalizeQuery = (value: string) =>
	value.toLowerCase().replace(/[^a-z0-9]+/g, "");

export const normalizeDialCode = (value: string) =>
	value.replace(/\s+/g, "").replace(/^00/, "+");

const getFlagEmoji = (code: string) =>
	code
		.toUpperCase()
		.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export function createInternalCountries(
	countries: CountryOption[] | undefined,
	displayNames: Intl.DisplayNames | null,
) {
	if (countries && countries.length > 0) {
		return countries.map((item) => ({
			code: item.code,
			name: item.name,
			dial_code: item.dialCode,
			flag: getFlagEmoji(item.code),
		}));
	}

	return getCountries()
		.map((code) => ({
			code,
			name: displayNames?.of(code) ?? code,
			dial_code: `+${getCountryCallingCode(code)}`,
			flag: getFlagEmoji(code),
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterCountryOptions(
	countries: InternalCountryOption[],
	query: string,
) {
	const normalizedQuery = normalizeQuery(query);
	if (!normalizedQuery) return countries;
	return countries
		.filter((country) =>
			normalizeQuery(
				`${country.name} ${country.code} ${country.dial_code}`,
			).includes(normalizedQuery),
		)
		.sort((left, right) => {
			const rank = (country: InternalCountryOption) => {
				const text = normalizeQuery(
					`${country.name} ${country.code} ${country.dial_code}`,
				);
				if (text === normalizedQuery) return 0;
				if (text.startsWith(normalizedQuery)) return 1;
				return text.includes(normalizedQuery) ? 2 : 3;
			};
			return rank(left) - rank(right) || left.name.localeCompare(right.name);
		});
}

export function matchCountryFromValue(
	countries: InternalCountryOption[],
	value: string,
) {
	const prefixMatch = value.trim().match(/^\+?\d+/);
	if (!prefixMatch) return null;
	const rawPrefix = prefixMatch[0].startsWith("+")
		? prefixMatch[0]
		: `+${prefixMatch[0]}`;
	return (
		countries
			.slice()
			.sort((left, right) => right.dial_code.length - left.dial_code.length)
			.find((country) => rawPrefix.startsWith(country.dial_code)) ?? null
	);
}

export const PHONE_COUNTRIES: CountryOption[] = getCountries().map((code) => ({
	code,
	name: code,
	dialCode: `+${getCountryCallingCode(code)}`,
}));
