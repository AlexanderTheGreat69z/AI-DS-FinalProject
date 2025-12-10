import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// --- Configuration and Placeholders (for self-contained file) ---
const API_ENDPOINT = 'http://localhost:3001/api/generate-content';

// Placeholder URLs for images (as external imports are not allowed in a single file)
const LOGO_TEXT_URL = "https://img.sanishtech.com/u/e243e1f1c4d41e3c708c4bb96722f8f3.png";
const DEFAULT_PFP_URL = "https://img.sanishtech.com/u/eb150678b581005ae66f73c2ed6903d5.png";
const AI_PFP_URL = "https://img.sanishtech.com/u/bb3cc7ed4b7edbf3d0a11b66c7822bd0.png";

const VALORANT_LOGO_URL = "https://img.sanishtech.com/u/448727e2739d482b691ad54fdb5429b3.jpg";
const R6_LOGO_URL = "https://img.sanishtech.com/u/e20815c58cfb144130cc4bf7c5baae1f.jpg";
const CS2_LOGO_URL = "https://img.sanishtech.com/u/512134deae934b0aadb87844c26fd483.png";

const MODEL_NAME = "Gemini 2.5 Flash"; // Used for error context

// --- Helper Components ---

// 1. Chat Bubble Component
const ChatBubble = ({ role, content }) => {
    const isAssistant = role === "assistant";
    const isPlaceholder = content === "...";

    const styles = {
        bubble: `max-w-[80%] p-4 my-3 rounded-xl shadow-md transition-colors duration-300 whitespace-pre-wrap
            ${isAssistant 
                ? 'bg-[#1B1724] text-gray-200 mr-auto rounded-tl-none' 
                : 'bg-gray-700 text-white ml-auto rounded-tr-none'}
            ${isPlaceholder ? 'animate-pulse opacity-70' : ''}`,
        
        pfp: "w-10 h-10 mt-3 rounded-full",

        wrapper: `flex items-start gap-3 ${isAssistant ? 'justify-end' : 'justify-start'}`
    };

    const cleanedText = content.replace(/^\s*[\r\n]/gm, "").replace(/\n{2,}/g, "\n\n");

    return (
        <div className={styles.wrapper}>
            {isAssistant && (
                <img src={AI_PFP_URL} alt="AI PFP" className={styles.pfp} />
            )}
            <div className={styles.bubble}>
                <ReactMarkdown components={{
                    p: (props) => <p className="leading-relaxed">{props.children}</p>,
                    ul: (props) => <ul className="list-disc ml-4 space-y-1">{props.children}</ul>,
                    li: (props) => <li className="leading-snug">{props.children}</li>,
                    h3: (props) => <h3 className="font-semibold text-lg mt-2">{props.children}</h3>,
                    code: (props) => <code className="bg-gray-800 px-1 rounded">{props.children}</code>,
                    pre: (props) => <pre className="bg-gray-800 p-3 rounded-lg mt-2">{props.children}</pre>,
                }}>
                    {cleanedText}
                </ReactMarkdown>
            </div>
            {!isAssistant && (
                <img src={DEFAULT_PFP_URL} alt="User PFP" className={styles.pfp} />
            )}
        </div>
    );
};


// 2. Game Selection Button Component
const GameSelect = ({name, logo}) => {
    const styles = {
        container : "bg-[#251F33] hover:bg-[#1B1724] my-4 w-full rounded-xl flex flex-row items-center transition-colors p-3 focus:outline-none focus:ring-2 focus:ring-[#00FF00]",
        logo: "w-6 h-6 mx-2 rounded-md",
        name: "w-full text-center text-sm font-bold text-gray-200",
    }
    return (
        <button className={styles.container}>
            <img src={logo} alt={`${name} Logo`} className={styles.logo} />
            <h1 className={styles.name}>{name}</h1>
        </button>
    )
}


// --- Main Home Component (Updated with API Logic) ---
function Home() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Welcome to **GameSense!** Select a game chat on the left to get started, or ask a general question about gaming strategy." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Ref for auto-scrolling
    const chatWindowRef = useRef(null);

    // Auto-scroll to bottom whenever messages update
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = useCallback(async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage = { role: "user", content: trimmedInput };
        
        // 1. Display user message immediately
        setMessages(m => [...m, userMessage]); 
        setInput(""); // Clear input
        setIsLoading(true);

        // 2. Add temporary placeholder message for loading
        setMessages(m => [...m, { role: "assistant", content: "..." }]);

        try {
            // 3. API Call to Node.js Backend Proxy
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: trimmedInput })
            });

            const data = await response.json();

            // 4. Remove placeholder message
            setMessages(m => m.slice(0, m.length - 1));

            if (!response.ok || data.error) {
                const errorMessage = data.error || `Failed to fetch response from ${MODEL_NAME} via backend.`;
                setMessages(m => [...m, { role: "assistant", content: `API Error: ${errorMessage}` }]);
                console.error("Backend Error:", errorMessage);
                return;
            }

            // 5. Display AI response
            const aiMessage = { role: "assistant", content: data.text || "No content received from AI." };
            setMessages(m => [...m, aiMessage]);

        } catch (error) {
            // Remove placeholder message on network failure
            setMessages(m => m.slice(0, m.length - 1)); 
            
            const networkError = `Network Error: Please ensure your Node.js server is running on ${API_ENDPOINT} and your internet connection is active.`;
            setMessages(m => [...m, { role: "assistant", content: networkError }]);
            console.error("Network or Fetch Error:", error);

        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);


    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents newline in input box
            sendMessage();
        }
    };


    const styles = {
        container: "flex min-h-screen text-white font-sans",
        sidebar: "flex flex-col w-64 min-w-64 bg-[#17141f] border-r-2 border-green-500",
        chat_section: "bg-[#251F33] flex-1 flex flex-col max-h-screen",

        navbar: "flex flex-row items-center justify-center w-full h-16 bg-[#1B1724] shadow-lg shadow-black/30 px-6 text-xl text-[#00FF00]",

        chat_window: "flex-1 overflow-y-auto p-6 space-y-6",
        chats: "w-[90%] mx-auto md:w-[70%] overflow-y-auto",
        game_chats: "px-5 flex-1 overflow-y-auto",

        input_chat: "p-4 mx-10 my-5 bg-[#1B1724] flex items-center gap-3 shadow-t-xl rounded-xl",
        text_input: "flex-1 bg-[#17141f] px-4 py-3 rounded-lg outline-none shadow-inner shadow-black/50 text-base resize-none placeholder-gray-500",
        send_btn: `px-6 py-3 text-white rounded-xl transition duration-200 shadow-md font-semibold focus:outline-none focus:ring-4 focus:ring-[#00FF00]/50 
            ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#00BB00] hover:bg-[#007700] active:bg-[#005500]'}`,

        user_acc_btn: "flex flex-row px-5 py-4 mt-auto w-full items-center bg-[#120f1a] hover:bg-[#251F33] transition-colors",
        acc_pfp: "w-10 h-10 rounded-full object-cover shadow-lg",
        acc_name: "text-lg ml-5 font-medium"
    }

    return (
        <div className={styles.container}>

            {/* SIDEBAR */}
            <div className={styles.sidebar}>
                <img src={LOGO_TEXT_URL} alt="GameSense Logo" className="px-7 py-5 opacity-80"/>
                <div className={styles.game_chats}>
                    <h1 className="text-[#00FF00] text-center pb-3 mb-2 border-b border-[#00FF00]/30 font-semibold opacity-80">Game Chats</h1>
                    <GameSelect logo={VALORANT_LOGO_URL} name="VALORANT" />
                    <GameSelect logo={R6_LOGO_URL} name="Rainbow Six Siege" />
                    <GameSelect logo={CS2_LOGO_URL} name="Counter Strike 2" />
                </div>
                <button className={styles.user_acc_btn}>
                    <img className={styles.acc_pfp} src={DEFAULT_PFP_URL} alt="User Profile" />
                    <h1 className={styles.acc_name}>User</h1>
                </button>
            </div>

            {/* CHAT SECTION */}
            <div className={styles.chat_section}>

                {/* NAVBAR */}
                <nav className={styles.navbar}>VALORANT Chat - {MODEL_NAME}</nav>

                {/* CHAT WINDOW */}
                <div ref={chatWindowRef} className={styles.chat_window}>
                    <div className={styles.chats}>
                        { messages.map((msg, index) => ( 
                            <ChatBubble 
                                key={index} 
                                role={msg.role} 
                                content={msg.content} 
                            /> 
                        ))}
                    </div>
                </div>

                {/* INPUT BOX */}
                <div className={styles.input_chat}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.text_input}
                        placeholder={isLoading ? "Waiting for AI response..." : "Message GameSense..."}
                        disabled={isLoading}
                        rows={1}
                        style={{minHeight: '40px', maxHeight: '150px'}} // Restrict resizing
                    />
                    <button 
                        onClick={sendMessage} 
                        className={styles.send_btn}
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Send'}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Home;