import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export async function loadGuideFromURL(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GameSenseBot/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    const html = await res.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove noisy elements
    document
      .querySelectorAll("script, style, nav, footer, header, iframe")
      .forEach(el => el.remove());

    const article =
      document.querySelector("article") || document.body;

    let text = article.textContent || "";

    text = text
      .replace(/\s+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim();

    return text.slice(0, 12000); // safety limit
  } catch (err) {
    console.error("Guide fetch error:", err.message);
    return "Guide content could not be loaded.";
  }
}
