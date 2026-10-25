import type { BrowserNodeData } from "./node-data.types";
import type { NodeExecutor } from "./node_context.schema";
import { chromium } from "playwright";


export const executeBrowser: NodeExecutor = async (node, context) => {
  // taking out url send by frontend which user enters in the node
  const data = node.data as BrowserNodeData;

  const url = data.urlForm;

  if (!url) {
    throw new Error("Browser node did not receive a URL");
  }

  try {
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const title = await page.title();
    const text = await page.locator("body").innerText();
    await browser.close();

    return {
      url,
      title,
      text: text?.slice(0, 3000) || "",
    };
  } catch (browserErr) {
    console.warn("Playwright browser launch failed, falling back to HTTP fetch:", browserErr);
    // Fallback: fast HTTP fetch
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || url;
    // Strip HTML tags for clean text preview
    const cleanText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);

    return {
      url,
      title,
      text: cleanText,
    };
  }
};
