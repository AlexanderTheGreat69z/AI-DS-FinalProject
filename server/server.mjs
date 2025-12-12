// --- Dependencies (using ES Module import syntax) ---
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
// Dependencies required by the package.json Canvas (Firebase included)
import { initializeApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth'; 
// NOTE: For secure server-side logic (e.g., token verification), 
// you should install and import the 'firebase-admin' SDK here.

// Load environment variables from .env
dotenv.config();

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025"; // Model that supports system instruction

// --- Helper Functions ---

// Exponential backoff delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check for API Key presence before starting
if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1); 
}

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// --- Firebase Initialization for Client SDK ---
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

let firebaseApp;
let auth;

// Only initialize if minimum configuration is available
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        console.log("Firebase Client SDK initialized successfully.");
    } catch (e) {
        console.error("Firebase initialization failed:", e.message);
    }
} else {
    console.warn("Firebase config missing. Firebase features will be unavailable.");
}


// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Core Backend Routes ---

/**
 * POST /api/authenticate
 * Simulates user authentication by expecting an ID token.
 * In a production app, the Firebase Admin SDK would verify the token here.
 */
app.post('/api/authenticate', (req, res) => {
    // Expect the ID token sent from the client's Firebase Auth process
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ success: false, error: 'Authorization token required.' });
    }

    // --- SECURITY NOTE: Admin SDK Required for Verification ---
    // If 'firebase-admin' were installed, you would call:
    // admin.auth().verifyIdToken(idToken)
    // .then(decodedToken => res.json({ success: true, uid: decodedToken.uid }))
    // .catch(error => res.status(401).json({ success: false, error: 'Invalid token.' }));

    // For demonstration, we simulate success just based on token presence.
    console.log(`Received token for authentication. (Verification skipped - Admin SDK required)`);
    res.json({ 
        success: true, 
        message: 'Token received. Verification simulated.',
        tokenLength: idToken.length
    });
});


/**
 * POST /api/save-session
 * Placeholder for saving game session data (e.g., chat history) to Firestore.
 * Requires Firebase Admin SDK for secure, direct write access.
 */
app.post('/api/save-session', (req, res) => {
    const { userId, chatHistory } = req.body;

    if (!userId || !chatHistory) {
        return res.status(400).json({ error: 'userId and chatHistory are required to save.' });
    }

    // --- SECURITY NOTE: Admin SDK/Firestore Logic Required ---
    // Example: admin.firestore().collection('userSessions').add({ userId, chatHistory, timestamp: Date.now() });

    console.log(`Attempting to save session for user: ${userId}. (Data storage simulated)`);
    res.json({ success: true, message: 'Session data received and simulated for saving.' });
});


/**
 * POST /api/generate-content
 * Handles requests from the React frontend, securely calls the Gemini API, 
 * ensuring context (systemInstruction) and chat history are passed correctly.
 */
app.post('/api/generate-content', async (req, res) => {
    // The Gemini API call remains the primary function of this proxy.
    const { chatHistory, systemInstruction } = req.body; 

    if (!chatHistory || !systemInstruction) {
        return res.status(400).json({ error: "Required fields 'chatHistory' or 'systemInstruction' are missing." });
    }

    // 1. Format chat history for the Gemini API
    const formattedHistory = chatHistory
        .filter(msg => msg.content !== "...")
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

    // 2. Prepare the base model payload
    const modelPayload = {
        contents: formattedHistory,
        config: {
            systemInstruction: systemInstruction 
        }
    };

    let generatedText = '';
    const MAX_RETRIES = 5;
    let attempt = 0;

    try {
        console.log(`Received prompt for context: "${systemInstruction.substring(0, 30)}..."`);

        // --- SECURE CALL TO GEMINI API with Exponential Backoff ---
        while (attempt < MAX_RETRIES) {
            try {
                const response = await ai.models.generateContent({
                    model: MODEL_NAME, 
                    ...modelPayload,
                });

                generatedText = response.text;
                break; // Success, break the retry loop

            } catch (error) {
                // Check for rate limit error (429) or temporary server issues (>= 500)
                if (error.status === 429 || error.status >= 500) {
                    attempt++;
                    if (attempt >= MAX_RETRIES) throw new Error("API Rate Limit exceeded after multiple retries.");
                    
                    const backoffTime = Math.pow(2, attempt) * 1000;
                    await delay(backoffTime);
                } else {
                    throw error; // Re-throw other errors
                }
            }
        }
        
        res.json({ 
            success: true,
            text: generatedText
        });

    } catch (error) {
        console.error("Error calling the Gemini API:", error.message);
        let errorMessage = "An internal server error occurred while processing the AI request.";
        if (error.message.includes("Rate Limit exceeded")) {
            errorMessage = "Service temporarily unavailable due to high traffic (Rate Limit Exceeded).";
        }
        res.status(500).json({ error: errorMessage });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Gemini Proxy Server is running securely on http://localhost:${PORT}`);
    console.log(`Frontend should call http://localhost:${PORT}/api/generate-content`);
    console.log("To implement secure Firebase features, consider adding the 'firebase-admin' SDK.");
});
