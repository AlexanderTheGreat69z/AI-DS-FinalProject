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
    // The prompt is expected from the React component
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "A 'prompt' field is required in the request body." });
    }

    try {
        console.log(`Received prompt: "${prompt.substring(0, 50)}..."`);
        
        // --- SECURE CALL TO GEMINI API ---
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const generatedText = response.text;
        
        res.json({ 
            success: true,
            text: generatedText
        });

    } catch (error) {
        console.error("Error calling the Gemini API:", error);
        res.status(500).json({ error: "An internal server error occurred while processing the AI request." });
    }
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Gemini Proxy Server is running securely on http://localhost:${PORT}`);
    console.log(`Frontend should call http://localhost:${PORT}/api/generate-content`);
});