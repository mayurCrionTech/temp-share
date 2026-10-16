const puppeteer = require("puppeteer");

let browserPromise = null;
let activePages = 0;
const MAX_CONCURRENT_PAGES = 2;
const IDLE_TIMEOUT_MS = 60000;
const MAX_RETRIES = 1;
let idleTimer = null;

function launchBrowser() {
  const p = puppeteer
    .launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    })
    .then((browser) => {
      browser.on("disconnected", () => {
        if (browserPromise === p) browserPromise = null;
      });
      return browser;
    });
  p.catch(() => { if (browserPromise === p) browserPromise = null; });
  return p;
}

async function getBrowser() {
  clearTimeout(idleTimer);
  if (browserPromise) {
    const b = await browserPromise;
    if (b.isConnected()) return b;
    browserPromise = null;
  }
  if (!browserPromise) browserPromise = launchBrowser();
  return browserPromise;
}

async function generatePDFFromHTML(htmlContent, pdfOptions = {}, _retryCount = 0) {
  const waitStart = Date.now();
  while (activePages >= MAX_CONCURRENT_PAGES) {
    if (Date.now() - waitStart > 120000) {
      throw new Error("browserPool: timed out waiting for available page slot");
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  activePages++;
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "load", timeout: 30000 });

    const buffer = await page.pdf({
      format: "A3",
      printBackground: true,
      timeout: 60000,
      margin: { top: "0.3in", right: "0.3in", bottom: "0.3in", left: "0.3in" },
      ...pdfOptions,
    });

    return Buffer.from(buffer); // Uint8Array -> Buffer so res.send() works
  } catch (err) {
    const retryable = /Protocol error|Navigation timeout|Printing failed|Target closed|Session closed/.test(err.message);
    if (_retryCount < MAX_RETRIES && retryable) {
      console.warn(`browserPool: retrying (attempt ${_retryCount + 1}): ${err.message}`);
      // Only discard the browser if it is actually dead
      const b = browserPromise ? await browserPromise.catch(() => null) : null;
      if (!b || !b.isConnected()) browserPromise = null;
      return await generatePDFFromHTML(htmlContent, pdfOptions, _retryCount + 1);
    }
    throw err;
  } finally {
    if (page) await page.close().catch(() => {});
    activePages = Math.max(0, activePages - 1);

    if (activePages === 0) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(closeBrowser, IDLE_TIMEOUT_MS);
    }
  }
}

async function closeBrowser() {
  if (activePages > 0 || !browserPromise) return;
  const p = browserPromise;
  browserPromise = null;
  const b = await p.catch(() => null);
  if (b) await b.close().catch(() => {});
}

process.on("SIGINT", async () => { activePages = 0; await closeBrowser(); process.exit(); });
process.on("SIGTERM", async () => { activePages = 0; await closeBrowser(); process.exit(); });

module.exports = { generatePDFFromHTML, closeBrowser };