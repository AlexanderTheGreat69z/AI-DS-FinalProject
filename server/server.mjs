// --- Dependencies (using ES Module import syntax) ---
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { loadGuideFromURL } from "./data/fetchGuide.js";

// Load environment variables from .env
dotenv.config();

// --- Setup ---
const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check for API Key presence before starting
if (!GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set in the .env file.");
  process.exit(1);
}

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Multiple URL CAG Route ---
app.post("/api/generate-content", async (req, res) => {
  const { prompt, systemInstruction, guideURLs } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  // --- MULTIPLE URL SCRAPING (CAG) ---
  let combinedGuideText = "";

  if (Array.isArray(guideURLs)) {
    console.log("Fetching guide URLs:", guideURLs);

    for (const url of guideURLs) {
      const text = await loadGuideFromURL(url);
      combinedGuideText += `\n### Guide from ${url}\n${text}\n\n`;
    }
  }

  try {
    // --- GENERATE CONTENT WITH CAG AUGMENTATION ---
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `
${systemInstruction || ""}

You MUST use the following external knowledge when answering:
${combinedGuideText}

User question:
${prompt}
          `,
        },
      ],
    },
  ],
});


    res.json({ success: true, text: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "AI Error" });
  }
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`🚀 Gemini Proxy Server running at http://localhost:${PORT}`);
});
