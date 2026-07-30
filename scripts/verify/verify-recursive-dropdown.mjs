#!/usr/bin/env node

import assert from "node:assert/strict";
import { chromium } from "playwright";

function resolveBaseUrl() {
	const argumentIndex = process.argv.indexOf("--base-url");
	const argumentValue =
		argumentIndex >= 0 ? process.argv[argumentIndex + 1] : undefined;
	const value = argumentValue ?? process.env.DROPDOWN_VERIFY_BASE_URL;
	if (!value) {
		throw new Error(
			"Provide the isolated preview with --base-url <url> or DROPDOWN_VERIFY_BASE_URL.",
		);
	}
	return value.replace(/\/$/, "");
}

const baseUrl = resolveBaseUrl();

async function getCascadeCount(page, rootId) {
	return page
		.getByRole("menu")
		.evaluateAll(
			(nodes, prefix) =>
				nodes.filter(
					(node) =>
						node.id === prefix || node.id.startsWith(`${prefix}-children-`),
				).length,
			rootId,
		);
}

async function expectCascadeCount(page, rootId, expected) {
	const deadline = Date.now() + 800;
	let actual = await getCascadeCount(page, rootId);
	while (actual !== expected && Date.now() < deadline) {
		await page.waitForTimeout(20);
		actual = await getCascadeCount(page, rootId);
	}
	assert.equal(actual, expected);
}

async function openRecursiveMenu(page) {
	const card = page
		.getByText("Dropdown.Menu", { exact: true })
		.locator("xpath=../..");
	await card.scrollIntoViewIfNeeded();
	const trigger = card.getByRole("button", {
		name: "Open recursive action menu",
	});
	await trigger.click();
	const rootId = await trigger.getAttribute("aria-controls");
	assert.ok(rootId);
	const rootMenu = page.locator(`[id="${rootId}"]`);
	await rootMenu.waitFor();
	assert.equal(await card.locator(`[id="${rootId}"]`).count(), 0);
	assert.equal(
		await rootMenu.evaluate((menu) =>
			menu.parentElement
				? getComputedStyle(menu.parentElement).position
				: undefined,
		),
		"fixed",
	);
	return { card, rootId, trigger };
}

async function verifyFlatRootPlacement(page) {
	await page.goto(`${baseUrl}/internal/demo/ui/misc?motion=off&reveal=off`);
	const card = page
		.getByText("Dropdown.Menu", { exact: true })
		.locator("xpath=../..");
	await card.scrollIntoViewIfNeeded();
	const trigger = card.getByRole("button", { name: "Open overflow menu" });
	await trigger.click();
	const rootId = await trigger.getAttribute("aria-controls");
	assert.ok(rootId);
	const rootMenu = page.locator(`[id="${rootId}"]`);
	await rootMenu.waitFor();
	assert.equal(await card.locator(`[id="${rootId}"]`).count(), 1);
	assert.equal(
		await rootMenu.evaluate((menu) =>
			menu.parentElement
				? getComputedStyle(menu.parentElement).position
				: undefined,
		),
		"absolute",
	);
}

async function openRecursiveBranch(page, branchName) {
	await page.goto(`${baseUrl}/internal/demo/ui/misc?motion=off&reveal=off`);
	const context = await openRecursiveMenu(page);
	const branch = page.getByRole("menuitem", {
		name: branchName,
		exact: true,
	});
	await branch.hover();
	await expectCascadeCount(page, context.rootId, 2);
	return {
		...context,
		branch,
		childMenu: page.getByRole("menu").last(),
	};
}

async function verifyHelperFactories(page) {
	const context = await openRecursiveBranch(page, "Helper factories");
	const itemLabels = await context.childMenu
		.getByRole("menuitem")
		.allTextContents();
	assert.deepEqual(
		itemLabels.map((label) => label.trim()),
		[
			"Open — default icon",
			"Open — custom icon",
			"Edit",
			"Edit — disabled",
			"Warning",
			"Warning — disabled",
			"Delete",
			"Delete permanently — disabled",
			"Delete — no handler",
		],
	);

	const openDefault = context.childMenu.getByRole("menuitem", {
		name: "Open — default icon",
		exact: true,
	});
	const openCustom = context.childMenu.getByRole("menuitem", {
		name: "Open — custom icon",
		exact: true,
	});
	assert.equal(
		await openDefault.getAttribute("href"),
		"#dropdown-menu-contract-target",
	);
	assert.equal(await openCustom.getAttribute("href"), "/internal/demo");
	assert.equal(await openDefault.locator("svg").count(), 1);
	assert.equal(await openCustom.locator("svg").count(), 1);

	const disabledEdit = context.childMenu.getByRole("menuitem", {
		name: "Edit — disabled",
		exact: true,
	});
	const disabledDelete = context.childMenu.getByRole("menuitem", {
		name: "Delete permanently — disabled",
		exact: true,
	});
	const warning = context.childMenu.getByRole("menuitem", {
		name: "Warning",
		exact: true,
	});
	const disabledWarning = context.childMenu.getByRole("menuitem", {
		name: "Warning — disabled",
		exact: true,
	});
	const firstDanger = context.childMenu.getByRole("menuitem", {
		name: "Delete",
		exact: true,
	});
	assert.equal(await disabledEdit.getAttribute("aria-disabled"), "true");
	assert.match((await warning.getAttribute("class")) ?? "", /!text-warning/);
	assert.match((await warning.getAttribute("class")) ?? "", /!border-t/);
	assert.equal(await disabledWarning.getAttribute("aria-disabled"), "true");
	assert.doesNotMatch(
		(await firstDanger.getAttribute("class")) ?? "",
		/!border-t/,
	);
	assert.equal(await disabledDelete.getAttribute("aria-disabled"), "true");
	await disabledEdit.dispatchEvent("click");
	await expectCascadeCount(page, context.rootId, 2);
	await context.childMenu
		.getByRole("menuitem", { name: "Edit", exact: true })
		.click();
	await expectCascadeCount(page, context.rootId, 0);
	await context.card
		.getByText("Selected: Edit helper", { exact: true })
		.waitFor();
}

async function verifyStatesAndTones(page) {
	const context = await openRecursiveBranch(page, "States and tones");
	const itemLabels = await context.childMenu
		.getByRole("menuitem")
		.allTextContents();
	assert.deepEqual(
		itemLabels.map((label) => label.trim()),
		[
			"Default action",
			"Active action",
			"Disabled action",
			"Empty children — leaf",
			"Warning action",
			"Warning action — disabled",
			"Danger action",
			"Danger action — disabled",
		],
	);

	const active = context.childMenu.getByRole("menuitem", {
		name: "Active action",
		exact: true,
	});
	const defaultAction = context.childMenu.getByRole("menuitem", {
		name: "Default action",
		exact: true,
	});
	const disabled = context.childMenu.getByRole("menuitem", {
		name: "Disabled action",
		exact: true,
	});
	const emptyChildren = context.childMenu.getByRole("menuitem", {
		name: "Empty children — leaf",
		exact: true,
	});
	const warning = context.childMenu.getByRole("menuitem", {
		name: "Warning action",
		exact: true,
	});
	const disabledWarning = context.childMenu.getByRole("menuitem", {
		name: "Warning action — disabled",
		exact: true,
	});
	const danger = context.childMenu.getByRole("menuitem", {
		name: "Danger action",
		exact: true,
	});
	const disabledDanger = context.childMenu.getByRole("menuitem", {
		name: "Danger action — disabled",
		exact: true,
	});

	const defaultClassName = (await defaultAction.getAttribute("class")) ?? "";
	const warningClassName = (await warning.getAttribute("class")) ?? "";
	const dangerClassName = (await danger.getAttribute("class")) ?? "";
	const partialBottomRows = await context.childMenu
		.locator(":scope > div")
		.evaluate((list) => {
			const listBottom = list.getBoundingClientRect().bottom;
			return Array.from(list.children)
				.filter((option) => {
					const rect = option.getBoundingClientRect();
					return rect.top < listBottom && rect.bottom > listBottom;
				})
				.map((option) => option.textContent?.trim());
		});

	assert.match(defaultClassName, /hover:!bg-foreground\/5/);
	assert.deepEqual(partialBottomRows, []);
	assert.match((await active.getAttribute("class")) ?? "", /!text-foreground/);
	assert.equal(await disabled.getAttribute("aria-disabled"), "true");
	assert.equal(await disabledDanger.getAttribute("aria-disabled"), "true");
	assert.equal(await emptyChildren.getAttribute("aria-haspopup"), null);
	assert.match(warningClassName, /!text-warning/);
	assert.match(warningClassName, /hover:!bg-warning-accent\/10/);
	assert.doesNotMatch(warningClassName, /hover:!bg-foreground\/5/);
	assert.equal(await disabledWarning.getAttribute("aria-disabled"), "true");
	assert.match(dangerClassName, /!text-danger/);
	assert.match(dangerClassName, /hover:!bg-danger\/10/);
	assert.doesNotMatch(dangerClassName, /hover:!bg-foreground\/5/);
	await context.card
		.getByText("Supported tones: default, warning, and danger.", {
			exact: true,
		})
		.waitFor();

	await disabledDanger.dispatchEvent("click");
	await expectCascadeCount(page, context.rootId, 2);
	await warning.click();
	await expectCascadeCount(page, context.rootId, 0);
	await context.card
		.getByText("Selected: Warning action", { exact: true })
		.waitFor();
}

async function verifyCompositionVariants(page) {
	const context = await openRecursiveBranch(page, "Composition");
	const leading = context.childMenu.getByRole("menuitem", {
		name: "Leading icon + divider after",
		exact: true,
	});
	const trailing = context.childMenu.getByRole("menuitem", {
		name: "Trailing icon",
		exact: true,
	});
	const both = context.childMenu.getByRole("menuitem", {
		name: "Both icons + divider before",
		exact: true,
	});
	const classExtensions = context.childMenu.getByRole("menuitem", {
		name: "Class extensions",
		exact: true,
	});
	const presentation = context.childMenu.getByRole("menuitem", {
		name: "Presentation layout Multi-line React node label",
		exact: true,
	});

	assert.equal(await leading.locator("svg").count(), 1);
	assert.equal(await trailing.locator("svg").count(), 1);
	assert.equal(await both.locator("svg").count(), 2);
	assert.match((await leading.getAttribute("class")) ?? "", /!border-b/);
	assert.match((await both.getAttribute("class")) ?? "", /!border-t/);
	assert.match(
		(await classExtensions.getAttribute("class")) ?? "",
		/font-medium/,
	);
	assert.match(
		(await classExtensions.locator("span").last().getAttribute("class")) ?? "",
		/uppercase/,
	);
	assert.match((await presentation.getAttribute("class")) ?? "", /!min-h-16/);
	await presentation.click();
	await expectCascadeCount(page, context.rootId, 0);
	await context.card
		.getByText("Selected: Presentation layout", { exact: true })
		.waitFor();
}

async function verifyRecursiveInteraction(page) {
	await page.goto(`${baseUrl}/internal/demo/ui/misc?motion=off&reveal=off`);
	const { card, rootId, trigger } = await openRecursiveMenu(page);
	let projects = page.getByRole("menuitem", { name: "Projects", exact: true });
	assert.equal(await projects.getAttribute("aria-haspopup"), "menu");
	assert.equal(await projects.getAttribute("aria-expanded"), "false");
	assert.ok(await projects.getAttribute("aria-controls"));

	await projects.locator("[data-dropdown-cascade-trigger]").click();
	await expectCascadeCount(page, rootId, 2);
	const childSurface = page.getByRole("menu").last().locator("xpath=..");
	assert.equal(await childSurface.getAttribute("data-slot"), "panel");
	assert.equal(
		await childSurface.evaluate(
			(element) => getComputedStyle(element).overflow,
		),
		"hidden",
	);

	await page.getByRole("menuitem", { name: "Recent", exact: true }).hover();
	await expectCascadeCount(page, rootId, 3);
	await page.evaluate((prefix) => {
		const counts = [];
		const getCount = () =>
			Array.from(document.querySelectorAll('[role="menu"]')).filter(
				(node) =>
					node.id === prefix || node.id.startsWith(`${prefix}-children-`),
			).length;
		const observer = new MutationObserver(() => counts.push(getCount()));
		observer.observe(document.body, { childList: true, subtree: true });
		window.__stopRecursiveDropdownObserver = () => {
			observer.disconnect();
			return counts;
		};
	}, rootId);
	await page.mouse.move(8, 500);
	await expectCascadeCount(page, rootId, 1);
	const unmountCounts = await page.evaluate(() =>
		window.__stopRecursiveDropdownObserver(),
	);
	assert.ok(unmountCounts.length > 0);
	assert.ok(
		unmountCounts.every((count) => count === 1),
		unmountCounts,
	);

	projects = page.getByRole("menuitem", { name: "Projects", exact: true });
	await projects.hover();
	await page.getByRole("menuitem", { name: "Recent", exact: true }).hover();
	await page.getByRole("menuitem", { name: "Apollo", exact: true }).click();
	await expectCascadeCount(page, rootId, 0);
	await card.getByText("Selected: Apollo", { exact: true }).waitFor();

	await trigger.focus();
	await trigger.press("ArrowDown");
	await expectCascadeCount(page, rootId, 1);
	await page.keyboard.press("ArrowRight");
	await expectCascadeCount(page, rootId, 2);
	await page.keyboard.press("ArrowRight");
	await expectCascadeCount(page, rootId, 3);
	await page.keyboard.press("Escape");
	await expectCascadeCount(page, rootId, 2);
	await page.keyboard.press("ArrowLeft");
	await expectCascadeCount(page, rootId, 1);
	await page.keyboard.press("Escape");
	await expectCascadeCount(page, rootId, 0);
}

async function verifyDisabledBranch(page) {
	await page.goto(`${baseUrl}/internal/demo/ui/misc?motion=off&reveal=off`);
	const { rootId } = await openRecursiveMenu(page);
	const disabledBranch = page.getByRole("menuitem", {
		name: "Disabled branch",
		exact: true,
	});
	const restStyle = await disabledBranch.evaluate((element) => {
		const style = getComputedStyle(element);
		return { backgroundColor: style.backgroundColor, opacity: style.opacity };
	});
	await disabledBranch.hover();
	const hoverStyle = await disabledBranch.evaluate((element) => {
		const style = getComputedStyle(element);
		return { backgroundColor: style.backgroundColor, opacity: style.opacity };
	});
	assert.deepEqual(hoverStyle, restStyle);
	assert.equal(await disabledBranch.getAttribute("aria-disabled"), "true");
	assert.equal(await disabledBranch.getAttribute("aria-expanded"), "false");
	await expectCascadeCount(page, rootId, 1);
}

async function verifyListboxWarningTone(page) {
	await page.goto(
		`${baseUrl}/internal/demo/ui/primitives?motion=off&reveal=off`,
	);
	const card = page
		.getByText("Dropdown.Listbox recursive", { exact: true })
		.locator("xpath=../..");
	await card.scrollIntoViewIfNeeded();
	const trigger = card.getByRole("button", {
		name: "Choose recursive destination",
	});
	await trigger.click();
	const rootId = await trigger.getAttribute("aria-controls");
	assert.ok(rootId);
	const dropdownListbox = page.locator(`[id="${rootId}"]`);
	const warning = dropdownListbox.getByRole("option", {
		name: "Needs review",
		exact: true,
	});
	const danger = dropdownListbox.getByRole("option", {
		name: "Blocked",
		exact: true,
	});
	assert.match((await warning.getAttribute("class")) ?? "", /!text-warning/);
	assert.match((await danger.getAttribute("class")) ?? "", /!text-danger/);
	assert.equal(
		await warning.evaluate((element) => getComputedStyle(element).color),
		"rgb(181, 71, 8)",
	);
	await warning.click();
	await card.getByText("Selected: needs-review", { exact: true }).waitFor();

	const standalone = card.getByRole("listbox");
	const standaloneWarning = standalone.getByRole("option", {
		name: "Needs review",
		exact: true,
	});
	assert.match(
		(await standaloneWarning.getAttribute("class")) ?? "",
		/!text-warning/,
	);
	await standaloneWarning.click();
	await card.getByText("Selected: needs-review", { exact: true }).waitFor();
}

async function run() {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({
		viewport: { height: 900, width: 1280 },
	});
	try {
		await verifyFlatRootPlacement(page);
		await verifyHelperFactories(page);
		await verifyStatesAndTones(page);
		await verifyCompositionVariants(page);
		await verifyRecursiveInteraction(page);
		await verifyDisabledBranch(page);
		await verifyListboxWarningTone(page);
		console.log("Recursive dropdown verification passed.");
	} finally {
		await page.close();
		await browser.close();
	}
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
