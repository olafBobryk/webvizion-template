"use client";

import { Component, type ReactNode, useLayoutEffect, useRef } from "react";
import {
	InternalPage,
	InternalPageHeader,
} from "@/app/(site)/(dev)/internal/_components/InternalPage";
import { PortalScope } from "@/components/ui/overlays/Portal";
import Divider from "@/components/ui/primitives/Divider";
import { Text } from "@/components/ui/primitives/Text";
import { componentCatalog } from "@/lib/component-catalog/componentCatalog.generated";
import {
	type CatalogOwnerContract,
	type CatalogProjectionRow,
	projectCatalogTarget,
} from "@/lib/component-catalog/contract";

const familyOrder = ["UI", "Dashboard", "Domain"] as const;
const uiGroupOrder = [
	"Foundations",
	"Primitives",
	"Input",
	"Helpers",
	"Icons",
	"Misc",
	"Motion",
	"Overlays",
	"Time",
] as const;

const familyDescriptions: Record<string, string> = {
	UI: "Public design-system owners and their finite presentation axes.",
	Dashboard: "Dashboard-owned commands and entity presentations.",
	Domain: "Reusable domain presentations composed from the shared UI system.",
};

const stageStyles = {
	standard: "min-h-20",
	wide: "min-h-28",
	overlay:
		"min-h-20 has-[[role=tooltip]]:min-h-40 has-[[role=dialog]]:min-h-[30rem] has-[[data-sonner-toast]]:min-h-[30rem]",
} as const;

const projectionColumnStyles = {
	standard: "flex-[1_1_14rem]",
	wide: "flex-[1_1_24rem]",
	overlay: "basis-full",
} as const;

const ownerColumnStyles = {
	single: "flex-[1_1_24rem]",
	double: "flex-[2_1_48rem]",
	full: "basis-full",
} as const;

function getOwnerSpan(owner: CatalogOwnerContract, groupSize: number) {
	if (groupSize === 1) return "full";
	if (owner.sweepSpan) return owner.sweepSpan;
	if (owner.previewTargets.some((target) => target.stage === "overlay")) {
		return "full";
	}
	if (owner.previewTargets.some((target) => target.stage === "wide")) {
		return "double";
	}
	return "single";
}

function orderIndex(value: string, order: readonly string[]) {
	const index = order.indexOf(value);
	return index === -1 ? order.length : index;
}

function compareOwners(
	left: CatalogOwnerContract,
	right: CatalogOwnerContract,
) {
	const familyDifference =
		orderIndex(left.family, familyOrder) -
		orderIndex(right.family, familyOrder);
	if (familyDifference !== 0) return familyDifference;

	if (left.family === "UI" && right.family === "UI") {
		const groupDifference =
			orderIndex(left.group.split(" / ")[0] ?? "", uiGroupOrder) -
			orderIndex(right.group.split(" / ")[0] ?? "", uiGroupOrder);
		if (groupDifference !== 0) return groupDifference;
	}

	const groupDifference = left.group.localeCompare(right.group);
	if (groupDifference !== 0) return groupDifference;
	return left.name.localeCompare(right.name);
}

const owners = [...componentCatalog].sort(compareOwners);
const families = [...new Set(owners.map((owner) => owner.family))];
const projectionCount = owners.reduce(
	(total, owner) =>
		total +
		owner.previewTargets.reduce(
			(ownerTotal, target) => ownerTotal + projectCatalogTarget(target).length,
			0,
		),
	0,
);

function slugify(value: string) {
	return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-");
}

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
		"[id]:not([data-component-sweep-scoped-id])",
	)) {
		const originalId = element.id;
		const scopedId = `${prefix}-${originalId}`;
		idMap.set(originalId, scopedId);
		element.id = scopedId;
		element.dataset.componentSweepScopedId = originalId;
	}

	for (const element of root.querySelectorAll<HTMLElement>("*")) {
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

export function ComponentSweep() {
	return (
		<InternalPage className="gap-12">
			<InternalPageHeader
				description={`${owners.length} owners and ${projectionCount} deterministic previews, rendered directly from application-safe catalogue contracts.`}
				title="Component Sweep"
			/>

			{families.map((family) => {
				const familyOwners = owners.filter((owner) => owner.family === family);
				const groups = [...new Set(familyOwners.map((owner) => owner.group))];
				return (
					<section
						aria-labelledby={`component-sweep-${slugify(family)}`}
						className="grid gap-10"
						data-component-sweep-family={family}
						key={family}
					>
						<header className="grid max-w-3xl gap-2">
							<Text
								as="h2"
								id={`component-sweep-${slugify(family)}`}
								variant="headingMd"
							>
								{family}
							</Text>
							<Text tone="muted" variant="body">
								{familyDescriptions[family] ?? "Application catalogue owners."}
							</Text>
						</header>

						{groups.map((group) => {
							const groupOwners = familyOwners.filter(
								(owner) => owner.group === group,
							);
							return (
								<section
									className="grid gap-8"
									data-component-sweep-group={group}
									key={`${family}-${group}`}
								>
									<Text as="h3" variant="headingSm">
										{group}
									</Text>

									<div
										className="flex flex-wrap items-start gap-x-10 gap-y-12"
										data-component-sweep-owner-grid={group}
									>
										{groupOwners.map((owner) => {
											const ownerSpan = getOwnerSpan(owner, groupOwners.length);
											return (
												<article
													className={`grid min-w-0 scroll-mt-[calc(var(--site-header-height)+2rem)] gap-6 ${ownerColumnStyles[ownerSpan]}`}
													data-component-sweep-owner={owner.id}
													id={`component-sweep-${owner.id}`}
													key={owner.id}
												>
													<Divider />
													<header className="grid max-w-3xl gap-1">
														<Text as="h4" variant="headingXs">
															{owner.name}
														</Text>
														<Text tone="muted" variant="support">
															{owner.role}
														</Text>
													</header>

													{owner.previewTargets.map((target) => {
														const projections = groupProjectionRows(
															projectCatalogTarget(target),
														);
														return (
															<section
																className="grid gap-5"
																data-component-sweep-target={`${owner.id}.${target.id}`}
																key={target.id}
															>
																<Text as="h5" variant="bodyStrong">
																	{target.name}
																</Text>

																{projections.map((projection) => (
																	<section
																		className="grid gap-3"
																		data-component-sweep-axis={
																			projection.axisLabel
																		}
																		key={projection.axisLabel}
																	>
																		{projection.rows[0]?.axisId !== null ? (
																			<Text tone="muted" variant="caption">
																				{projection.axisLabel}
																			</Text>
																		) : null}
																		<div
																			className="flex flex-wrap gap-x-6 gap-y-5"
																			data-component-sweep-grid={target.stage}
																		>
																			{projection.rows.map((row) => (
																				<div
																					className={`grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-2 ${projectionColumnStyles[target.stage]}`}
																					data-component-sweep-preview={row.id}
																					key={row.id}
																				>
																					{row.axisId !== null ? (
																						<Text
																							tone="muted"
																							variant="support"
																						>
																							{row.valueLabel}
																						</Text>
																					) : null}
																					<CatalogPreviewIdScope
																						prefix={`${owner.id}-${row.id}`}
																					>
																						<PortalScope
																							className={`relative isolate w-full min-w-0 overflow-hidden py-2 [contain:paint] ${stageStyles[target.stage]}`}
																							data-component-sweep-stage={
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
												</article>
											);
										})}
									</div>
								</section>
							);
						})}
					</section>
				);
			})}
		</InternalPage>
	);
}
