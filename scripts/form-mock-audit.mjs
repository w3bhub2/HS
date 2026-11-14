import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:5179/contact/";
const server = spawn(
  "npm",
  ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5179", "--strictPort"],
  {
    env: {
      ...process.env,
      VITE_WEB3FORMS_ACCESS_KEY: "test-only-access-key",
      VITE_BASE_PATH: "/",
      VITE_SITE_URL: "https://healspoc.com",
    },
    stdio: "ignore",
  },
);

async function ready() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // The local test server has not started yet.
    }
    await wait(200);
  }
  throw new Error("The temporary Vite server did not start.");
}

async function fillForm(page) {
  await page.getByLabel("Full name").fill("Test Visitor");
  await page.getByLabel("Country", { exact: true }).fill("United Kingdom");
  await page.getByLabel("WhatsApp number with country code").fill("+44 7700 900000");
  await page.getByLabel("Treatment of interest").selectOption("Cancer care");
  await page.getByLabel("Brief enquiry").fill("Please clarify the current enquiry process.");
  await page.getByLabel(/I agree that my enquiry details/).check();
}

let browser;
try {
  await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.evaluate(() => {
    window.__formEvents = [];
    window.addEventListener("healspoc:analytics", (event) => {
      window.__formEvents.push(event.detail);
    });
  });

  let capturedBody = "";
  await page.route("https://api.web3forms.com/submit", async (route) => {
    capturedBody = route.request().postData() || "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true }),
    });
  });
  await fillForm(page);
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await page.getByText("Your enquiry has been submitted.", { exact: false }).waitFor();
  if (!capturedBody.includes("test-only-access-key") || !capturedBody.includes("+447700900000")) {
    throw new Error("The mock submission did not contain the expected access key and normalized phone.");
  }
  if (capturedBody.includes("recipient")) {
    throw new Error("The form incorrectly tried to choose the Web3Forms recipient in its payload.");
  }
  if ((await page.getByLabel("Full name").inputValue()) !== "") {
    throw new Error("The form did not reset after a successful mock response.");
  }

  await page.unrouteAll();
  await page.route("https://api.web3forms.com/submit", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: "Test failure" }),
    }),
  );
  await fillForm(page);
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await page.getByText("We could not submit the enquiry.", { exact: false }).waitFor();

  await page.unrouteAll();
  let spamPosted = false;
  await page.route("https://api.web3forms.com/submit", (route) => {
    spamPosted = true;
    return route.abort();
  });
  await page.locator('[name="botcheck"]').evaluate((element) => {
    element.value = "bot-filled";
  });
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await page.getByText("The enquiry could not be submitted.", { exact: false }).waitFor();
  if (spamPosted) throw new Error("A honeypot-filled form reached the API.");

  const events = await page.evaluate(() => window.__formEvents);
  for (const name of ["contact_form_start", "contact_form_submission", "contact_form_error"]) {
    if (!events.some((event) => event.event === name)) {
      throw new Error(`Missing form event: ${name}`);
    }
  }
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  console.log("Mocked Web3Forms audit passed: success, failure, honeypot, normalized phone, and analytics events.");
  console.log("This is not a production email-delivery test.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}