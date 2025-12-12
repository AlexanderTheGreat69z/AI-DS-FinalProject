// --- Dependencies (using ES Module import syntax) ---
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env
dotenv.config();

// --- Setup ---
const app = express();
const PORT = process.env.PORT || 3001; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { prompt, systemInstruction, guideURLs } = req.body;
let combinedGuideText = "";

if (Array.isArray(guideURLs)) {
    for (const url of guideURLs) {
        const text = await loadGuideFromURL(url);
        combinedGuideText += `\n### Guide from ${url}\n${text}\n\n`;
    }
}
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
        {
            role: "system",
            parts: [
                { text: systemInstruction },
                { text: "Use the following external knowledge:\n" + combinedGuideText }
            ]
        },
        { role: "user", parts: [{ text: prompt }] }
    ]
});


// Check for API Key presence before starting
if (!GEMINI_API_KEY) {
    // Note: In a real-world scenario, you'd load the key from an environment variable. 
    // For local testing, ensure your .env file exists and contains GEMINI_API_KEY="YOUR_KEY"
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1); 
}

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Routes ---

/**
 * POST /api/generate-content
 * Handles requests from the React frontend, securely calls the Gemini API, 
 * and returns the generated text.
 */
app.post('/api/generate-content', async (req, res) => {
    const { prompt, systemInstruction, guideURL } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    // Load guide text from the provided URL
    let guideText = "";
    if (guideURL) {
        guideText = await loadGuideFromURL(guideURL);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "system",
                    parts: [
                        { text: systemInstruction },
                        { text: "Here is authoritative external knowledge:\n" + guideText }
                    ]
                },
                { role: "user", parts: [{ text: prompt }] }
            ]
        });

        res.json({ success: true, text: response.text });

    } catch (error) {
        console.error("Gemini API error:", error);
        res.status(500).json({ error: "AI Error" });
    }
});



// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Gemini Proxy Server is running securely on http://localhost:${PORT}`);
    console.log(`Frontend should call http://localhost:${PORT}/api/generate-content`);
});