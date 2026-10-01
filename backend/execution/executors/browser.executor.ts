import type { NodeExecutor } from "./node_context.schema";
import { chromium } from "playwright";

export const executeBrowser: NodeExecutor = async (node, context) => {
  // taking out url send by frontend which user enters in the node
  const urlInput = node.data?.urlForm;
  const url = context.data[urlInput];

  if (!url) {
    throw new Error("Browser node did not receive a URL");
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(url);

  const title = await page.title();

  const text = await page.locator("body").innerText();

  await browser.close();
  return {
    url,
    title,
    text,
  };
};
