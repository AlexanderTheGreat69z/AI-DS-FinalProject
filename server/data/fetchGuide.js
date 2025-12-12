import fetch from "node-fetch";
import * as cheerio from "cheerio"; // for HTML parsing

export async function loadGuideFromURL(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const $ = cheerio.load(html);

    // Extract readable text
    const cleanedText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    return cleanedText.substring(0, 15000); // limit to avoid giant prompts
  } catch (err) {
    console.error("Failed to load guide:", err);
    return "ERROR: Could not load guide data.";
  }
}
