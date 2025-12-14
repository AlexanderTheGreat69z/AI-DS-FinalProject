
import fetch from "node-fetch";
import { convert } from "html-to-text";
// const { JSDOM } = await import("jsdom")
// import { JSDOM } from "jsdom";

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
    
    // Convert HTML to clean text
    const text = convert(html, {
      wordwrap: false,
      selectors: [
        { selector: 'script', format: 'skip' },
        { selector: 'style', format: 'skip' },
        { selector: 'nav', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: 'header', format: 'skip' },
        { selector: 'iframe', format: 'skip' },
      ]
    });

    return text
      .replace(/\s+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim()
      .slice(0, 12000); // safety limit

  } catch (err) {
    console.error("Guide fetch error:", err.message);
    return "Guide content could not be loaded.";
  }
}
