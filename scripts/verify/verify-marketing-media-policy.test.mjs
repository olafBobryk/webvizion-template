import assert from "node:assert/strict";
import test from "node:test";
import { analyzeMarketingMediaSources } from "./verify-marketing-media-policy.mjs";

function analyze(source, path = "src/lib/marketing-content/example.tsx") {
	return analyzeMarketingMediaSources([{ path, source }]);
}

function rules(result) {
	return result.diagnostics.map(({ rule }) => rule);
}

test("accepts static raster imports, resolved remote media, and SVG assets", () => {
	const result = analyze(`
import Image, { type StaticImageData } from "next/image";
import photo from "./photo.png";
import mark from "./mark.svg";

type Media =
  | { src: StaticImageData; alt: string }
  | { src: string; width: number; height: number; blurDataURL: string; alt: string };

export function Example({ media }: { media: Media }) {
  return <>
    <Image alt="Building" placeholder="blur" sizes="100vw" src={photo} />
    <Image alt="" height={24} src={mark} width={24} />
    <Image alt={media.alt} blurDataURL={"blurDataURL" in media ? media.blurDataURL : undefined} height={"height" in media ? media.height : undefined} placeholder="blur" sizes="50vw" src={media.src} width={"width" in media ? media.width : undefined} />
  </>;
}
`);
	assert.deepEqual(result.diagnostics, []);
});

test("rejects the Pearl public-raster workaround", () => {
	const result = analyze(`
import Image from "next/image";
type Media = { src: string; alt: string };
const media: Media = { src: "/images/portfolio/map.png", alt: "Map" };
export function Example() {
  return <Image alt={media.alt} src={media.src} />;
}
`);
	assert.ok(rules(result).includes("public-raster-string"));
	assert.ok(rules(result).includes("unresolved-remote-media"));
	assert.ok(rules(result).includes("missing-raster-blur"));
	assert.ok(rules(result).includes("missing-responsive-sizes"));
	assert.ok(rules(result).includes("missing-intrinsic-dimensions"));
});

test("rejects incomplete remote interfaces and object values", () => {
	const result = analyze(`
interface MarketingImage { src: string; alt: string }
const remote = { src: "https://cdn.example.com/property.jpg", alt: "Property" };
`);
	assert.equal(
		result.diagnostics.filter(({ rule }) => rule === "unresolved-remote-media")
			.length,
		2,
	);
});

test("checks CSS media URLs and supports one scoped CSS exception", () => {
	const failing = analyze(
		`.hero { background-image: url("/images/portfolio/hero.jpg"); }`,
		"src/lib/marketing-content/example.css",
	);
	assert.ok(rules(failing).includes("public-raster-string"));

	const excepted = analyze(
		`/* averlo-media-exception-next-line public-raster-string -- A third-party runtime writes this generated preview. */
.hero { background-image: url("/runtime/generated-preview.jpg"); }`,
		"src/lib/marketing-content/example.css",
	);
	assert.deepEqual(excepted.diagnostics, []);
	assert.equal(excepted.acceptedExceptions.length, 1);

	const forbidden = analyze(
		`.hero { background-image: url("https://www.figma.com/api/mcp/asset/temporary.png"); }`,
		"src/lib/marketing-content/example.css",
	);
	assert.ok(rules(forbidden).includes("temporary-media-url"));
	assert.equal(
		forbidden.diagnostics.find(({ rule }) => rule === "temporary-media-url")
			?.message,
		"Expiring Figma/MCP and localhost media URLs cannot ship in marketing product source.",
	);
});

test("rejects raw raster elements and missing Image contracts", () => {
	const result = analyze(`
import Image from "next/image";
import photo from "./photo.jpg";
export const Raw = () => <img alt="Photo" src={photo.src} />;
export const Missing = () => <Image src={photo} />;
`);
	assert.ok(rules(result).includes("raw-raster-element"));
	assert.ok(rules(result).includes("missing-alt-contract"));
	assert.ok(rules(result).includes("missing-raster-blur"));
	assert.ok(rules(result).includes("missing-responsive-sizes"));
});

test("rejects temporary URLs and flattened reference captures without exceptions", () => {
	const result = analyze(`
const asset = "https://www.figma.com/api/mcp/asset/temporary.png";
const flattened = ".codex/visual-parity/page/assessment/source.png";
`);
	assert.ok(rules(result).includes("temporary-media-url"));
	assert.ok(rules(result).includes("reference-capture"));
});

test("accepts one adjacent rule-specific exception and reports it", () => {
	const result = analyze(`
// averlo-media-exception-next-line public-raster-string -- Runtime export is generated after the Next build.
const generated = "/runtime/generated-preview.png";
`);
	assert.deepEqual(result.diagnostics, []);
	assert.equal(result.acceptedExceptions.length, 1);
	assert.equal(result.acceptedExceptions[0].rule, "public-raster-string");
});

test("rejects malformed, unknown, and stale exceptions", () => {
	const malformed = analyze(`
// averlo-media-exception-next-line public-raster-string
const generated = "/runtime/generated-preview.png";
`);
	assert.ok(rules(malformed).includes("invalid-media-exception"));

	const unknown = analyze(`
// averlo-media-exception-next-line anything-goes -- Required for now.
const generated = "/runtime/generated-preview.png";
`);
	assert.ok(rules(unknown).includes("invalid-media-exception"));

	const stale = analyze(`
// averlo-media-exception-next-line public-raster-string -- Runtime-owned output.
const generated = "not-an-image";
`);
	assert.ok(rules(stale).includes("stale-media-exception"));
});

test("an exception is single-use", () => {
	const result = analyze(`
// averlo-media-exception-next-line public-raster-string -- Both values are runtime generated.
const generated = ["/runtime/a.png", "/runtime/b.png"];
`);
	assert.equal(result.acceptedExceptions.length, 1);
	assert.equal(
		result.diagnostics.filter(({ rule }) => rule === "public-raster-string")
			.length,
		1,
	);
});

test("non-exemptable rules cannot be waived", () => {
	const result = analyze(`
// averlo-media-exception-next-line temporary-media-url -- Needed temporarily.
const asset = "https://www.figma.com/api/mcp/asset/temporary.png";
`);
	assert.ok(rules(result).includes("invalid-media-exception"));
	assert.ok(rules(result).includes("temporary-media-url"));
});
