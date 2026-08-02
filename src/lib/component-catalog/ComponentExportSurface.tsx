"use client";

import { Component, type ReactNode, useLayoutEffect, useRef } from "react";
import { PortalScope } from "@/components/ui/overlays/Portal";
import { Text } from "@/components/ui/primitives/Text";
import { componentCatalog } from "./componentCatalog.generated";
import { type CatalogProjectionRow, projectCatalogTarget } from "./contract";
import {
	type ComponentExportSectionId,
	componentExportContentSections,
	getComponentExportSection,
	resolveComponentExportSection,
} from "./exportSections";

const stageStyles = {
	standard: "min-h-20 w-full max-w-[640px]",
	wide: "min-h-28 w-full max-w-[1248px]",
	overlay:
		"min-h-20 w-full max-w-[1248px] has-[[role=tooltip]]:min-h-40 has-[[role=dialog]]:min-h-[30rem] has-[[data-sonner-toast]]:min-h-[30rem]",
} as const;

const exportOwners = componentCatalog.filter(
	(owner) => resolveComponentExportSection(owner) !== null,
);

type CatalogPreviewBoundaryProps = {
	children: ReactNode;
	previewId: string;
};

type CatalogPreviewBoundaryState = {
	failed: boolean;
};

class CatalogPreviewBoundary extends Component<
	CatalogPreviewBoundaryProps,
	CatalogPreviewBoundaryState
> {
	state: CatalogPreviewBoundaryState = { failed: false };

	static getDerivedStateFromError(): CatalogPreviewBoundaryState {
		return { failed: true };
	}

	render() {
		if (this.state.failed) {
			return (
				<Text role="status" tone="muted" variant="support">
					Preview unavailable for {this.props.previewId}.
				</Text>
			);
		}
		return this.props.children;
	}
}

const idReferenceAttributes = [
	"aria-activedescendant",
	"aria-controls",
	"aria-describedby",
	"aria-labelledby",
	"aria-owns",
	"for",
] as const;

function scopePreviewIds(
	root: HTMLElement,
	prefix: string,
	idMap: Map<string, string>,
) {
	for (const element of root.querySelectorAll<HTMLElement>(
		"[id]:not([data-component-export-scoped-id])",
	)) {
		const originalId = element.id;
		const scopedId = `${prefix}-${originalId}`;
		idMap.set(originalId, scopedId);
		element.id = scopedId;
		element.dataset.componentExportScopedId = originalId;
	}

	for (const element of root.querySelectorAll<HTMLElement>("*")) {
		const liveRegionLabel = element.matches("section[aria-live]")
			? element.getAttribute("aria-label")
			: null;
		if (liveRegionLabel && !liveRegionLabel.startsWith(`${prefix} `)) {
			element.setAttribute("aria-label", `${prefix} ${liveRegionLabel}`);
		}
		for (const attribute of idReferenceAttributes) {
			const value = element.getAttribute(attribute);
			if (!value) continue;
			const scopedValue = value
				.split(/\s+/)
				.map((id) => idMap.get(id) ?? id)
				.join(" ");
			if (scopedValue !== value) element.setAttribute(attribute, scopedValue);
		}
		const href = element.getAttribute("href");
		if (href?.startsWith("#")) {
			const scopedTarget = idMap.get(href.slice(1));
			if (scopedTarget) element.setAttribute("href", `#${scopedTarget}`);
		}
	}
}

function CatalogPreviewIdScope({
	children,
	prefix,
}: {
	children: ReactNode;
	prefix: string;
}) {
	const rootRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const idMap = new Map<string, string>();
		const applyScope = () => scopePreviewIds(root, prefix, idMap);
		applyScope();
		const observer = new MutationObserver(applyScope);
		observer.observe(root, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, [prefix]);

	return (
		<div className="min-w-0" ref={rootRef}>
			{children}
		</div>
	);
}

function groupProjectionRows(rows: readonly CatalogProjectionRow[]) {
	const axisLabels = [...new Set(rows.map((row) => row.axisLabel))];
	return axisLabels.map((axisLabel) => ({
		axisLabel,
		rows: rows.filter((row) => row.axisLabel === axisLabel),
	}));
}

function Overview() {
	return (
		<div className="grid gap-14" data-component-export-overview="">
			{componentExportContentSections.map((section) => {
				const count = exportOwners.filter(
					(owner) => resolveComponentExportSection(owner) === section.id,
				).length;
				return (
					<a
						className="grid max-w-3xl gap-2 text-foreground no-underline"
						href={`/internal/demo/${section.id}?motion=off&reveal=off`}
						key={section.id}
					>
						<Text as="h2" variant="headingSm">
							{section.label}
						</Text>
						<Text tone="muted" variant="body">
							{section.description} {count} owners.
						</Text>
					</a>
				);
			})}
		</div>
	);
}

export function ComponentExportSurface({
	sectionId,
}: {
	sectionId: ComponentExportSectionId;
}) {
	const section = getComponentExportSection(sectionId);
	const owners = exportOwners.filter(
		(owner) => resolveComponentExportSection(owner) === sectionId,
	);
	const groups = [...new Set(owners.map((owner) => owner.group))];
	const previewCount = owners.reduce(
		(total, owner) =>
			total +
			owner.previewTargets.reduce(
				(ownerTotal, target) =>
					ownerTotal + projectCatalogTarget(target).length,
				0,
			),
		0,
	);

	return (
		<div
			className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-20 bg-background px-24 py-24 text-foreground"
			data-component-export-section={sectionId}
		>
			<style>{"nextjs-portal{display:none!important}"}</style>
			<div className="grid max-w-3xl gap-3">
				<Text as="h1" variant="headingLg">
					{section.label}
				</Text>
				<Text tone="muted" variant="body">
					{section.description}
					{sectionId === "overview"
						? ` ${exportOwners.length} owners across ${componentExportContentSections.length} capture sections.`
						: ` ${owners.length} owners and ${previewCount} deterministic previews.`}
				</Text>
			</div>

			{sectionId === "overview" ? (
				<Overview />
			) : (
				<div className="grid gap-20">
					{groups.map((group) => {
						const groupOwners = owners.filter((owner) => owner.group === group);
						return (
							<div
								className="grid gap-12"
								data-component-export-group={group}
								key={group}
							>
								<div className="grid max-w-3xl gap-2">
									<Text
										as="h2"
										id={`component-export-${sectionId}-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
										variant="headingSm"
									>
										{group}
									</Text>
									<Text tone="muted" variant="support">
										{groupOwners.length} catalogue owners in manifest order.
									</Text>
								</div>

								<div className="grid gap-16">
									{groupOwners.map((owner) => (
										<article
											className="grid min-w-0 gap-7"
											data-component-export-owner={owner.id}
											key={owner.id}
										>
											<div className="grid max-w-3xl gap-2">
												<Text as="p" variant="headingXs">
													{owner.name}
												</Text>
												<Text tone="muted" variant="support">
													{owner.role}
												</Text>
											</div>

											<div className="grid gap-10">
												{owner.previewTargets.map((target) => {
													const projections = groupProjectionRows(
														projectCatalogTarget(target),
													);
													return (
														<section
															className="grid gap-5"
															data-component-export-target={`${owner.id}.${target.id}`}
															key={target.id}
														>
															{owner.previewTargets.length > 1 ? (
																<Text as="p" variant="bodyStrong">
																	{target.name}
																</Text>
															) : null}

															{projections.map((projection) => (
																<section
																	className="grid gap-4"
																	data-component-export-axis={
																		projection.axisLabel
																	}
																	key={projection.axisLabel}
																>
																	{projection.rows[0]?.axisId !== null ? (
																		<Text tone="muted" variant="caption">
																			{projection.axisLabel}
																		</Text>
																	) : null}
																	<div className="grid gap-6">
																		{projection.rows.map((row) => (
																			<div
																				className="grid min-w-0 gap-2"
																				data-component-export-preview={row.id}
																				key={row.id}
																			>
																				{row.axisId !== null ? (
																					<Text tone="muted" variant="support">
																						{row.valueLabel}
																					</Text>
																				) : null}
																				<CatalogPreviewIdScope
																					prefix={`${owner.id}-${row.id}`}
																				>
																					<PortalScope
																						className={`relative isolate min-w-0 overflow-hidden py-2 [contain:paint] ${stageStyles[target.stage]}`}
																						data-component-export-stage={
																							target.stage
																						}
																					>
																						<CatalogPreviewBoundary
																							previewId={`${owner.id}.${row.id}`}
																						>
																							<target.Render
																								coordinate={row.coordinate}
																							/>
																						</CatalogPreviewBoundary>
																					</PortalScope>
																				</CatalogPreviewIdScope>
																			</div>
																		))}
																	</div>
																</section>
															))}
														</section>
													);
												})}
											</div>
										</article>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
