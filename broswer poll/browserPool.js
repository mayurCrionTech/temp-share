const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let browserInstance = null;
let browserLaunchPromise = null;
let activePages = 0;

const MAX_CONCURRENT_PAGES = 2;
const IDLE_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;

// Set to false once everything works, to stop browser logs in your console.
const BROWSER_DEBUG_LOGS = true;

let idleTimer = null;

// ---------------------------------------------------------------------------
// Browser location: use Edge/Chrome already installed on the server.
// You can override with the PUPPETEER_EXECUTABLE_PATH environment variable.
// ---------------------------------------------------------------------------
const BROWSER_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const executablePath = BROWSER_PATHS.find((p) => fs.existsSync(p));

// Writable profile folder (BE-PROD\pdf-browser-profile).
// The IIS app pool identity needs Modify permission on this folder.
const userDataDir = path.join(__dirname, "..", "..", "pdf-browser-profile");
try {
  fs.mkdirSync(userDataDir, { recursive: true });
} catch (e) {
  console.warn("browserPool: could not create userDataDir:", e.message);
}

console.log(
  "browserPool: using browser executable:",
  executablePath || "(puppeteer default)"
);

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(err) {
  const message = `${err?.message || ""} ${
    err?.cause?.message || ""
  }`.toLowerCase();

  return (
    message.includes("protocol error") ||
    message.includes("navigation timeout") ||
    message.includes("printing failed") ||
    message.includes("target closed") ||
    message.includes("targetcloseerror") ||
    message.includes("session closed") ||
    message.includes("browser has disconnected")
  );
}

async function getBrowser() {
  clearTimeout(idleTimer);
  idleTimer = null;

  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    const launchOptions = {
      headless: true,
      userDataDir,
      dumpio: BROWSER_DEBUG_LOGS,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
      ],
    };

    // Only set executablePath if we found an installed browser.
    // Otherwise Puppeteer falls back to its own downloaded Chrome.
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    const browser = await puppeteer.launch(launchOptions);

    browserInstance = browser;

    browser.on("disconnected", () => {
      if (browserInstance === browser) {
        browserInstance = null;
      }
    });

    return browser;
  })();

  try {
    return await browserLaunchPromise;
  } finally {
    browserLaunchPromise = null;
  }
}

async function generatePDFFromHTML(htmlContent, pdfOptions = {}) {
  const waitStart = Date.now();

  // Reserve a page slot before starting PDF generation.
  while (activePages >= MAX_CONCURRENT_PAGES) {
    if (Date.now() - waitStart > 120000) {
      throw new Error(
        "browserPool: timed out waiting for available page slot"
      );
    }

    await sleep(250);
  }

  activePages++;

  try {
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      let browser = null;
      let page = null;

      try {
        browser = await getBrowser();

        page = await browser.newPage();

        await page.setContent(htmlContent, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        const defaultOptions = {
          format: "A3",
          timeout: 60000,
          margin: {
            top: "0.3in",
            right: "0.3in",
            bottom: "0.3in",
            left: "0.3in",
          },
        };

        const buffer = await page.pdf({
          ...defaultOptions,
          ...pdfOptions,
        });

        return buffer;
      } catch (err) {
        lastError = err;

        if (
          attempt >= MAX_RETRIES ||
          !isRetryableError(err)
        ) {
          throw err;
        }

        console.warn(
          `browserPool: retrying PDF generation ` +
            `(attempt ${attempt + 1}/${MAX_RETRIES}):`,
          err.message
        );

        // Do not close the shared browser here.
        // Other requests may still be using it.
        if (browser && !browser.isConnected()) {
          if (browserInstance === browser) {
            browserInstance = null;
          }
        }

        await sleep(300 * (attempt + 1));
      } finally {
        if (page) {
          await page.close().catch(() => {});
        }
      }
    }

    throw lastError;
  } finally {
    activePages = Math.max(0, activePages - 1);

    // Schedule browser cleanup only when no requests remain.
    if (activePages === 0) {
      clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        if (activePages !== 0) {
          return;
        }

        const browser = browserInstance;

        // Release the shared reference before closing.
        if (browserInstance === browser) {
          browserInstance = null;
        }

        if (browser) {
          browser.close().catch(() => {});
        }
      }, IDLE_TIMEOUT_MS);
    }
  }
}

async function closeBrowser() {
  clearTimeout(idleTimer);
  idleTimer = null;

  const browser = browserInstance;
  browserInstance = null;

  if (browser) {
    await browser.close().catch(() => {});
  }
}

process.on("exit", () => {
  // The exit event cannot reliably await asynchronous cleanup.
  if (browserInstance) {
    browserInstance.process()?.kill();
    browserInstance = null;
  }
});

process.on("SIGINT", async () => {
  await closeBrowser();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeBrowser();
  process.exit(0);
});

module.exports = {
  generatePDFFromHTML,
  closeBrowser,
};
