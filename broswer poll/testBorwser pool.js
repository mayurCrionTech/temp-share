const puppeteer = require("puppeteer");

// ---------------------------------------------------------------------------
// Config (override via environment variables on the IIS server)
//   PUPPETEER_EXECUTABLE_PATH  e.g. C:\Program Files\Google\Chrome\Application\chrome.exe
//   PUPPETEER_USER_DATA_DIR    e.g. D:\clonos\chrome-profile  (must be writable by app pool user)
//   PDF_MAX_CONCURRENT         default 2
// ---------------------------------------------------------------------------
const MAX_CONCURRENT_PAGES = parseInt(process.env.PDF_MAX_CONCURRENT, 10) || 2;
const IDLE_TIMEOUT_MS = 60000;
const MAX_RETRIES = 1;
const SLOT_WAIT_TIMEOUT_MS = 120000;

let browserPromise = null; // shared launch promise, prevents double launches
let activePages = 0;
let idleTimer = null;

const RETRYABLE = /Protocol error|Navigation timeout|Printing failed|Target closed|Session closed|Connection closed|Browser has disconnected/i;

function launchBrowser() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  const userDataDir = process.env.PUPPETEER_USER_DATA_DIR || undefined;

  const p = puppeteer
    .launch({
      headless: true,
      executablePath,
      userDataDir,
      timeout: 60000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    })
    .then((browser) => {
      browser.on("disconnected", () => {
        if (browserPromise === p) browserPromise = null;
      });
      return browser;
    })
    .catch((err) => {
      if (browserPromise === p) browserPromise = null;
      // Make launch failures obvious in logs / API error message
      const wrapped = new Error(
        `browserPool: failed to launch Chrome (executablePath=${executablePath || "bundled"}): ${err.message}`
      );
      wrapped.stack = err.stack;
      throw wrapped;
    });

  return p;
}

async function getBrowser() {
  clearTimeout(idleTimer);

  if (browserPromise) {
    try {
      const existing = await browserPromise;
      if (existing.isConnected()) return existing;
    } catch (_) {
      // launch failed earlier; fall through and relaunch
    }
    browserPromise = null;
  }

  if (!browserPromise) browserPromise = launchBrowser();
  return browserPromise;
}

async function generatePDFFromHTML(htmlContent, pdfOptions = {}, _retryCount = 0) {
  // Wait for a free slot
  const waitStart = Date.now();
  while (activePages >= MAX_CONCURRENT_PAGES) {
    if (Date.now() - waitStart > SLOT_WAIT_TIMEOUT_MS) {
      throw new Error("browserPool: timed out waiting for available page slot");
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  activePages++;
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "load", timeout: 30000 });

    const defaultOptions = {
      format: "A3",
      printBackground: true,
      timeout: 60000,
      margin: { top: "0.3in", right: "0.3in", bottom: "0.3in", left: "0.3in" },
    };

    const result = await page.pdf({ ...defaultOptions, ...pdfOptions });

    // Puppeteer >= 22 returns Uint8Array; convert so res.send()/pdf-lib behave
    return Buffer.from(result);
  } catch (err) {
    if (_retryCount < MAX_RETRIES && RETRYABLE.test(err.message || "")) {
      console.warn(
        `browserPool: retrying PDF generation (attempt ${_retryCount + 1}): ${err.message}`
      );

      // Only discard the browser if it is actually dead, so other jobs are not killed
      let alive = false;
      if (browserPromise) {
        try {
          const b = await browserPromise;
          alive = b.isConnected();
        } catch (_) {
          alive = false;
        }
      }
      if (!alive) browserPromise = null;

      // Free this slot and page before retrying
      if (page) {
        await page.close().catch(() => {});
        page = null;
      }
      activePages = Math.max(0, activePages - 1);
      const retryResult = await generatePDFFromHTML(htmlContent, pdfOptions, _retryCount + 1);
      activePages++; // balance the decrement in finally below
      return retryResult;
    }
    throw err;
  } finally {
    if (page) await page.close().catch(() => {});
    activePages = Math.max(0, activePages - 1);
    scheduleIdleClose();
  }
}

function scheduleIdleClose() {
  if (activePages !== 0) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    closeBrowser().catch(() => {});
  }, IDLE_TIMEOUT_MS);
}

async function closeBrowser(force = false) {
  if (!browserPromise) return;
  if (!force && activePages > 0) return;

  const p = browserPromise;
  browserPromise = null;
  const browser = await p.catch(() => null);
  if (browser) await browser.close().catch(() => {});
}

process.on("SIGINT", async () => {
  await closeBrowser(true);
  process.exit();
});
process.on("SIGTERM", async () => {
  await closeBrowser(true);
  process.exit();
});

module.exports = { generatePDFFromHTML, closeBrowser };