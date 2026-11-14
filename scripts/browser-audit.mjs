import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const origin = process.env.HEALSPOC_PREVIEW_URL || "http://127.0.0.1:8080/HS/";
const base = new URL(origin);
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
  const url = new URL(match[1]);
  const basePath = new URL(origin).pathname;
  return url.pathname.startsWith(basePath)
    ? url.pathname.slice(basePath.length)
    : url.pathname.replace(/^\//, "");
});
const screens = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const problems = [];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
let pagesChecked = 0;

try {
  for (const screen of screens) {
    const context = await browser.newContext({
      viewport: { width: screen.width, height: screen.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });

    for (const route of routes) {
      const page = await context.newPage();
      const label = `${screen.name} /${route}`;
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") pageErrors.push(message.text());
      });
      page.on("requestfailed", (request) => {
        pageErrors.push(`${request.url()}: ${request.failure()?.errorText}`);
      });

      try {
        const response = await page.goto(new URL(route, base).href, {
          waitUntil: "networkidle",
          timeout: 20000,
        });
        if (response?.status() !== 200) {
          problems.push(`${label}: HTTP ${response?.status() ?? "no response"}`);
        }
        if ((await page.locator("h1").count()) !== 1) {
          problems.push(`${label}: expected one h1 after hydration.`);
        }
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth - window.innerWidth,
        );
        if (overflow > 1) problems.push(`${label}: horizontal overflow by ${overflow}px.`);

        if (route === "") {
          const heroImage = await page.locator(".home-hero__image").evaluate(
            (element) => element.naturalWidth,
          );
          if (!heroImage) problems.push(`${label}: hero image did not load.`);
        }

        if (pageErrors.length) {
          problems.push(`${label}: ${pageErrors.slice(0, 3).join(" | ")}`);
        }
        pagesChecked += 1;
      } catch (error) {
        problems.push(`${label}: ${error.message}`);
      }
      await page.close();
    }
    await context.close();
  }

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(new URL("treatments/cancer-care/", base).href, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => {
    window.__healspocTestEvents = [];
    window.addEventListener("healspoc:analytics", (event) => {
      window.__healspocTestEvents.push(event.detail);
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest('a[href^="https://wa.me/"]')) event.preventDefault();
    }, true);
  });

  const mobileMenu = page.getByRole("button", { name: "Open navigation" });
  if (!(await mobileMenu.isVisible())) problems.push("Mobile navigation button is not visible.");
  await mobileMenu.click();
  if (!(await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "About" }).isVisible())) {
    problems.push("Mobile navigation did not expand.");
  }
  await page.getByRole("button", { name: "Close navigation" }).click();

  const mobileWidget = page.getByRole("button", { name: "Open WhatsApp enquiry options" });
  await mobileWidget.click();
  const panel = page.getByRole("region", { name: "WhatsApp enquiry options" });
  if (!(await panel.isVisible())) problems.push("Mobile WhatsApp panel did not open.");
  const treatmentLink = panel.getByRole("link", { name: "Treatment enquiry" });
  const treatmentUrl = await treatmentLink.getAttribute("href");
  if (!treatmentUrl?.startsWith("https://wa.me/919108027762?text=") ||
      !decodeURIComponent(treatmentUrl).includes("cancer care")) {
    problems.push("Treatment-specific WhatsApp message is missing or incorrect.");
  }
  if (!(await page.getByRole("link", { name: "Chat on WhatsApp" }).isVisible())) {
    problems.push("The mobile fixed WhatsApp CTA is not visible.");
  }
  await treatmentLink.click();
  const events = await page.evaluate(() => window.__healspocTestEvents);
  for (const event of ["whatsapp_widget_open", "whatsapp_category_selection", "whatsapp_click", "treatment_whatsapp_click"]) {
    if (!events.some((item) => item.event === event)) {
      problems.push(`WhatsApp event ${event} was not emitted.`);
    }
  }
  await page.close();

  const contact = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await contact.goto(new URL("contact/", base).href, { waitUntil: "networkidle" });
  await contact.evaluate(() => {
    window.__healspocTestEvents = [];
    window.addEventListener("healspoc:analytics", (event) => {
      window.__healspocTestEvents.push(event.detail);
    });
  });
  await contact.getByRole("button", { name: "Send enquiry" }).click();
  if (!(await contact.locator(".form-status").innerText()).includes("required fields")) {
    problems.push("The empty contact form did not show a validation error.");
  }
  await contact.getByLabel("Full name").fill("A Test Person");
  await contact.getByLabel("Country", { exact: true }).fill("United Kingdom");
  await contact.getByLabel("WhatsApp number with country code").fill("+44 7700 900000");
  await contact.getByLabel("Treatment of interest").selectOption("Cancer care");
  await contact.getByLabel("Brief enquiry").fill("Please share current information about my enquiry.");
  await contact.getByLabel(/I agree that my enquiry details/).check();
  await contact.getByRole("button", { name: "Send enquiry" }).click();
  if (!(await contact.locator(".form-status").innerText()).includes("not configured yet")) {
    problems.push("The unconfigured Web3Forms state was not disclosed after submission.");
  }
  const formEvents = await contact.evaluate(() => window.__healspocTestEvents);
  if (!formEvents.some((event) => event.event === "contact_form_start")) {
    problems.push("Contact form start event was not emitted.");
  }
  if (!formEvents.some((event) => event.event === "contact_form_error")) {
    problems.push("Contact form error event was not emitted.");
  }
  await contact.close();

  for (const route of ["", "treatments/cancer-care/", "contact/", "privacy-policy/"]) {
    const a11yContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const a11yPage = await a11yContext.newPage();
    await a11yPage.goto(new URL(route, base).href, { waitUntil: "networkidle" });
    const result = await new AxeBuilder({ page: a11yPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    for (const issue of result.violations) {
      problems.push(`Axe /${route}: ${issue.id} (${issue.impact}), ${issue.nodes.length} node(s).`);
    }
    await a11yContext.close();
  }
} finally {
  await browser.close();
}

if (problems.length) {
  console.error(`Browser audit found ${problems.length} issue(s) across ${pagesChecked} screen-route combinations:`);
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exitCode = 1;
} else {
  console.log(`Browser audit passed: ${pagesChecked} route/screen combinations, mobile menu, WhatsApp messaging/events, offline form states, and four automated WCAG scans.`);
  console.log("Real device testing, Web3Forms delivery, and deployed site checks still require separate verification.");
}