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
  { name: "small-mobile", width: 320, height: 690 },
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
        if ((route.startsWith("treatments/") && route !== "treatments/") ||
            route === "medical-travel-to-india/") {
          const topicImage = await page.locator(".page-hero__media img").evaluate(
            (element) => element.naturalWidth,
          );
          if (!topicImage) problems.push(`${label}: topic-specific image did not load.`);
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
  const whatsAppGlyph = await mobileWidget.locator(".whatsapp-logo path").getAttribute("d");
  if (!whatsAppGlyph?.startsWith("M17.472 14.382")) {
    problems.push("The floating control does not use the complete WhatsApp logo.");
  }
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

  const navigationPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await navigationPage.goto(new URL("treatments/", base).href, { waitUntil: "networkidle" });
  await navigationPage.locator(".treatment-directory a").first().click();
  await navigationPage.waitForURL(/\/treatments\/cancer-care\/$/);
  if (!(await navigationPage.locator(".page-hero__media img").evaluate((element) => element.naturalWidth))) {
    problems.push("Client navigation did not load the cancer-care image.");
  }
  const currentOgImage = await navigationPage.locator('meta[property="og:image"]').getAttribute("content");
  if (!currentOgImage?.endsWith("/images/treatments/cancer-care.jpg")) {
    problems.push("Client navigation did not update the treatment-specific Open Graph image.");
  }
  await navigationPage.goBack();
  if (!(await navigationPage.getByRole("heading", { level: 1, name: "Explore treatment areas" }).isVisible())) {
    problems.push("Back navigation did not return to the treatment directory.");
  }
  await navigationPage.close();

  const contact = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await contact.goto(new URL("contact/", base).href, { waitUntil: "networkidle" });
  if (await contact.locator("form.enquiry-form").count()) {
    await contact.evaluate(() => {
      window.__healspocTestEvents = [];
      window.addEventListener("healspoc:analytics", (event) => {
        window.__healspocTestEvents.push(event.detail);
      });
    });
    await contact.getByRole("button", { name: "Send enquiry" }).click();
    if (!(await contact.locator(".form-status").innerText()).includes("required fields")) {
      problems.push("The configured form did not validate empty required fields.");
    }
    const formEvents = await contact.evaluate(() => window.__healspocTestEvents);
    if (!formEvents.some((event) => event.event === "contact_form_error")) {
      problems.push("Configured form validation did not emit an error event.");
    }
  } else {
    if (!(await contact.getByText("The web enquiry form is not active yet.", { exact: false }).isVisible())) {
      problems.push("The unavailable web form was not disclosed on the contact page.");
    }
    if ((await contact.locator(".contact-email-cta").getAttribute("href")) !== "mailto:hello@healspoc.com") {
      problems.push("The offline enquiry fallback does not use the official email.");
    }
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
  console.log(`Browser audit passed: ${pagesChecked} route/screen combinations, topic images/metadata, client navigation, mobile menu, WhatsApp logo/messages/events, contact fallback or validation, and four automated WCAG scans.`);
  console.log("Real iOS/Android devices, Web3Forms inbox delivery, and live WhatsApp app handoff still require separate verification.");
}