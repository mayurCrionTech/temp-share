const puppeteer = require("puppeteer");

let browserInstance = null;
let activePages = 0;
const MAX_CONCURRENT_PAGES = 2;
const IDLE_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;
let idleTimer = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    // Kill stale browser if it exists but disconnected
    if (browserInstance) {
      await browserInstance.close().catch(() => {});
      browserInstance = null;
    }
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    });
    browserInstance.on("disconnected", () => {
      browserInstance = null;
      activePages = 0;
    });
  }
  clearTimeout(idleTimer);
  return browserInstance;
}

async function generatePDFFromHTML(htmlContent, pdfOptions = {}, _retryCount = 0) {
  // Wait if too many pages are open
  const waitStart = Date.now();
  while (activePages >= MAX_CONCURRENT_PAGES) {
    if (Date.now() - waitStart > 120000) {
      throw new Error("browserPool: timed out waiting for available page slot");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  activePages++;
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Use domcontentloaded instead of networkidle0 to avoid Navigation timeout
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 30000 });

    const defaultOptions = {
      format: "A3",
      timeout: 60000,
      margin: { top: "0.3in", right: "0.3in", bottom: "0.3in", left: "0.3in" },
    };

    const buffer = await page.pdf({ ...defaultOptions, ...pdfOptions });
    return buffer;
  } catch (err) {
    // On Protocol error or Navigation timeout, kill browser and retry once
    if (_retryCount < MAX_RETRIES && (
      err.message.includes("Protocol error") ||
      err.message.includes("Navigation timeout") ||
      err.message.includes("Printing failed") ||
      err.message.includes("Target closed")
    )) {
      console.warn(`browserPool: retrying PDF generation (attempt ${_retryCount + 1}): ${err.message}`);
      // Force-kill corrupted browser
      if (browserInstance) {
        await browserInstance.close().catch(() => {});
        browserInstance = null;
      }
      activePages = 0;
      if (page) {
        page = null;
      }
      return generatePDFFromHTML(htmlContent, pdfOptions, _retryCount + 1);
    }
    throw err;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    activePages = Math.max(0, activePages - 1);

    // Close browser after idle period to free memory
    if (activePages === 0) {
      idleTimer = setTimeout(async () => {
        if (browserInstance && activePages === 0) {
          await browserInstance.close().catch(() => {});
          browserInstance = null;
        }
      }, IDLE_TIMEOUT_MS);
    }
  }
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

process.on("exit", closeBrowser);
process.on("SIGINT", async () => { await closeBrowser(); process.exit(); });
process.on("SIGTERM", async () => { await closeBrowser(); process.exit(); });

module.exports = { generatePDFFromHTML, closeBrowser };
