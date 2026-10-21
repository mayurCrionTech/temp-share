
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let browserInstance = null;
let browserLaunchPromise = null;
let activePages = 0;

const MAX_CONCURRENT_PAGES = 2;
const IDLE_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;

let idleTimer = null;

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

// Find an existing Microsoft Edge installation.
// No browser download or installation is performed.
function findExistingEdge() {
  const candidates = [
    process.env.EDGE_EXECUTABLE_PATH,

    process.env.ProgramFiles
      ? path.join(
          process.env.ProgramFiles,
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe"
        )
      : null,

    process.env["ProgramFiles(x86)"]
      ? path.join(
          process.env["ProgramFiles(x86)"],
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe"
        )
      : null,

    process.env.LOCALAPPDATA
      ? path.join(
          process.env.LOCALAPPDATA,
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe"
        )
      : null,

    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",

    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  return candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) || null;
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
    const edgePath = findExistingEdge();

    if (!edgePath) {
      throw new Error(
        "Microsoft Edge executable not found. " +
        "Set EDGE_EXECUTABLE_PATH to the existing msedge.exe path."
      );
    }

    console.log(`[browserPool] Using Microsoft Edge: ${edgePath}`);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: edgePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

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

  // Reserve a page slot before generating the PDF.
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
          console.error("[browserPool] PDF generation failed:", {
            message: err?.message,
            stack: err?.stack,
          });

          throw err;
        }

        console.warn(
          `[browserPool] Retrying PDF generation ` +
          `(${attempt + 1}/${MAX_RETRIES}): ${err.message}`
        );

        // Do not close a shared browser while other pages may use it.
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

    if (activePages === 0) {
      clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        if (activePages !== 0) {
          return;
        }

        const browser = browserInstance;
        browserInstance = null;

        if (browser) {
          browser.close().catch((err) => {
            console.error(
              "[browserPool] Browser cleanup failed:",
              err.message
            );
          });
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
