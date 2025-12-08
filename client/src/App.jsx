import React, { useState, useCallback } from 'react';
// Replaced FontAwesome imports with a function to return inline SVG icons
// to ensure compilation stability in this isolated environment.

// --- CONFIGURATION ---
// IMPORTANT: This must match the URL and port of your running Node.js server.
const API_ENDPOINT = 'http://localhost:3001/api/generate-content';
const MODEL_NAME = 'Gemini 2.5 Flash';

// Helper function to render a common UI icon (Wand/Magic Stick)
const WandIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 21l15-15L15 6 6 15l6 6z" />
    <path d="M10 2l2 2" />
    <path d="M4 11l2 2" />
    <path d="M19 4l-2 2" />
    <path d="M22 10l-2 2" />
  </svg>
);

// Helper function for the Send Button (Paper Plane)
const SendIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

// Helper function for the Loading Spinner
const SpinnerIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);


/**
 * Main application component for the AI assistant interface.
 * Uses Tailwind CSS for styling and communicates with a secure backend proxy.
 */
function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(
    'Welcome! Ask the Gemini AI assistant a question by typing in the box below.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle the API call to the backend proxy
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('...thinking...');

    try {
      // 1. Fetch Request to the Secure Backend Proxy
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the user's prompt to the backend
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // Handle server-side errors (e.g., API key missing, prompt missing)
        throw new Error(data.error || `HTTP error! Status: ${res.status}`);
      }

      // 2. Success: Update the response state
      setResponse(data.text || 'No content received from AI.');
      setPrompt(''); // Clear the input field

    } catch (err) {
      // 3. Handle network or client-side errors
      console.error('API Interaction Error:', err.message);
      setError('Connection or API error: Could not reach the server or process the request.');
      setResponse('An error occurred. Please check your console and ensure the backend server is running.');
    } finally {
      // 4. Reset loading state
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-6 md:p-10 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8 border-b pb-4">
          <WandIcon 
            className="w-8 h-8 text-indigo-600"
          />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            AI Assistant Chat
          </h1>
          <span className="text-sm font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full ml-auto">
            Powered by {MODEL_NAME}
          </span>
        </div>

        {/* AI Response Area */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 h-80 overflow-y-auto border border-gray-200">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
            {response}
          </p>
          
          {/* Error Message Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="relative flex-grow">
            <textarea
              className="w-full p-4 pr-12 text-gray-800 border-2 border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none shadow-md disabled:bg-gray-100"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question about coding, history, or anything else..."
              rows="3"
              disabled={isLoading}
            />
            {/* Input Character Count (Optional) */}
            <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                {prompt.length}/2000
            </span>
          </div>

          <button
            type="submit"
            className={`
              w-16 h-16 flex items-center justify-center rounded-full text-white transition duration-200 ease-in-out shadow-lg
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transform hover:scale-105'}
            `}
            disabled={isLoading}
          >
            {isLoading ? (
              <SpinnerIcon className="w-6 h-6 animate-spin" />
            ) : (
              <SendIcon className="w-6 h-6" />
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-4 text-xs text-center text-gray-400">
          Note: This frontend communicates with your secure backend proxy on `http://localhost:3001`.
        </p>
      </div>
    </div>
  );
}

export default App;