import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// --- Configuration and Placeholders ---
const API_ENDPOINT = 'http://localhost:3001/api/generate-content';

// Placeholder URLs for images (as external imports are not allowed in a single file)
const LOGO_TEXT_URL = "https://placehold.co/200x50/17141f/e0e0e0?text=GameSense+AI";
const DEFAULT_PFP_URL = "https://placehold.co/40x40/553c9a/ffffff?text=U";
const AI_PFP_URL = "https://placehold.co/40x40/00FF00/17141f?text=AI"; // New AI PFP placeholder
const VALORANT_LOGO_URL = "https://placehold.co/24x24/FF4655/ffffff?text=V";
const R6_LOGO_URL = "https://placehold.co/24x24/007bff/ffffff?text=R6";
const CS2_LOGO_URL = "https://placehold.co/24x24/f7b32d/ffffff?text=CS2";
const MODEL_NAME = "Gemini 2.5 Flash"; 

const detectValorantAgent = (text, agentList) => {
    const lower = text.toLowerCase();
    for (const agent of Object.keys(agentList)) {
        if (lower.includes(agent.toLowerCase())) {
            return agent;
        }
    }
    return null;
};


// --- Game Context Definitions for Tailoring ---
const GAME_CONTEXTS = {
VALORANT: {
    name: "VALORANT",
    systemInstruction:
        "You are a Radiant-level Valorant analyst. Always use official terminology and current meta.",

    agents: {
        Jett: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-jett-tips-tricks-advices/ ",
            "https://www.proguides.com/guides/valorant/jett-quick-guide-abilities-tips-and-tricks-for-beginners",
        ],
        Sova: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-sova-tips-tricks-advices/",
        ],
        Viper: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-viper-tips-tricks-advices/ ",
        ],
        Astra: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-astra-abilities-tips-advices/ ",
        ],
        Breach: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-breach-tips-tricks-advices/",
        ],
        Brimstone: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-brimstone-tips-tricks-advices/",
        ],

        Chamber: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-chamber-abilities-tips-advices",
        ],
        Clove: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-jouer-agent-clove-competences-astuces-tuto/",
        ],
        Cypher: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-cypher-tips-tricks-advices",
        ],
        Deadlock: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-neon-abilities-tips-advices/",
        ],
        Fade: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-fade-abilities-tips-advices/",
        ],
        Gekko: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-neon-abilities-tips-advices/",
        ],
        Harbor: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-neon-abilities-tips-advicesr",
        ],
        Iso: [
            "https://www.redbull.com/ca-en/how-to-master-iso-skills-tips-guide-valorant",
            "https://mobalytics.gg/blog/valorant/iso-guide/",
        ],
        KAYO: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-kay-o-abilities-tips-advices/",
        ],
        Killjoy: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-killjoy-abilities-tips/",
        ],
        Neon: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-neon-abilities-tips-advices/",
        ],
        Omen: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-omen-tips-tricks-advices/  ",
            "https://www.redbull.com/sg-en/omen-tips-guide-valorant r",
        ],
        Phoenix: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-phoenix-tips-tricks-advices/",
        ],
        Raze: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-viper-tips-tricks-advices-2/",
        ],
        Reyna: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-reyna-tips-tricks-advices",
            "https://www.proguides.com/guides/valorant/reyna-quick-guide-abilities-tips-and-tricks-for-beginners/",
        ],
        Sage: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-master-sage-tips-tricks-advices/",
        ],
        Skye: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-skye-abilities-tips/  ",
        ],
        // Tejo: [
        //     "https://blitz.gg/valorant/agents/viper",
        //     "https://valorant.fandom.com/wiki/Viper",
        // ],
        Veto: [
            "https://www.thegamer.com/valorant-veto-agent-abilities-tips-how-to-play-strategy/",
            "https://overgear.com/guides/valorant/veto-guide/?srsltid=AfmBOorWf6NG1cx_cSbc5SHKAQFItbjW_QKppg2Rq_27jy3BsKce2J-",
        ],
        Vyse: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-jouer-agent-vyse-competences-astuces-tuto/",
            "https://www.thegamer.com/valorant-tips-tricks-vyse",
        ],
        Waylay: [
            "https://mobalytics.gg/valorant/agent/waylay/guide"
        ],
        Yoru: [
            "https://www.mandatory.gg/en/valorant/guides-valorant/guides-agents/guide-how-to-play-yoru-abilities-tips"
        ]


        
    },
}
,
    CS2: {
        name: "CS2",
        systemInstruction: "...",
        guideURL: "https://totalcsgo.com/grenades",
    }
};


// --- Helper Components ---

// 1. Chat Bubble Component
const ChatBubble = ({ role, content }) => {
    const isAssistant = role === "assistant";
    const isPlaceholder = content === "...";

    const styles = {
        bubble: `max-w-[75%] p-4 my-3 rounded-xl shadow-md transition-colors duration-300 whitespace-pre-wrap 
            ${isAssistant 
                ? 'bg-[#1B1724] text-gray-200 ml-auto rounded-tr-none' // AI: Dark BG, Right side, Square Top-Right
                : 'bg-gray-700 text-white mr-auto rounded-tl-none'} // User: Gray BG, Left side, Square Top-Left
            ${isPlaceholder ? 'animate-pulse opacity-70' : ''}`,
        
        pfp: "w-8 h-8 mt-3 rounded-full",
        wrapper: `flex items-start gap-3 ${isAssistant ? 'justify-end' : 'justify-start'}`
    };
    
    // Clean up excessive whitespace/newlines from AI responses
    const cleanedText = content.replace(/^\s*[\r\n]/gm, "").replace(/\n{2,}/g, "\n\n");

    return (
        <div className={styles.wrapper}>
            {/* User PFP (Left) goes first */}
            {!isAssistant && (
                <img src={DEFAULT_PFP_URL} alt="User PFP" className={styles.pfp} />
            )}
            
            <div className={styles.bubble}>
                {/* Use ReactMarkdown for rich text rendering */}
                <ReactMarkdown components={{
                    p: (props) => <p className="leading-relaxed">{props.children}</p>,
                    ul: (props) => <ul className="list-disc ml-4 space-y-1">{props.children}</ul>,
                    li: (props) => <li className="leading-snug">{props.children}</li>,
                    h3: (props) => <h3 className="font-semibold text-lg mt-2">{props.children}</h3>,
                    code: (props) => <code className="bg-gray-800 px-1 rounded">{props.children}</code>,
                    pre: (props) => <pre className="bg-gray-800 p-3 rounded-lg mt-2 overflow-x-auto">{props.children}</pre>,
                }}>
                    {cleanedText}
                </ReactMarkdown>
            </div>
            
            {/* AI PFP (Right) goes last */}
            {isAssistant && (
                <img src={AI_PFP_URL} alt="AI PFP" className={styles.pfp} />
            )}
        </div>
    );
};


// 2. Game Selection Button Component
const GameSelect = ({ gameKey, currentContext, setGameContext, setMessages }) => {
    const context = GAME_CONTEXTS[gameKey];
    const isSelected = currentContext.name === context.name;

    const handleSelect = () => {
        if (!isSelected) {
            setGameContext(context);
            // Reset chat history when changing context
            setMessages([
                { role: "assistant", content: `You have switched to the **${context.name}** context. Ask me anything about ${context.name} competitive strategy!` }
            ]);
        }
    };

    const styles = {
        container : `my-2 w-full rounded-xl flex flex-row items-center transition-colors p-3 focus:outline-none focus:ring-2 focus:ring-[#00FF00]
            ${isSelected ? 'bg-green-600/30 border-l-4 border-[#00FF00]' : 'bg-[#251F33] hover:bg-[#1B1724]'}`,
        logo: "w-6 h-6 mx-2 rounded-md",
        name: "w-full text-center text-sm font-bold text-gray-200",
    }

    return (
        <button className={styles.container} onClick={handleSelect}>
            {context.logo ? (
                <img src={context.logo} alt={`${context.name} Logo`} className={styles.logo} />
            ) : (
                <div className="w-6 h-6 mx-2 text-2xl text-center">🎮</div>
            )}
            <h1 className={styles.name}>{context.name}</h1>
        </button>
    )
}


// --- Main Home Component ---
function Home() {
    const [selectedGameContext, setSelectedGameContext] = useState(GAME_CONTEXTS.VALORANT);
    const [messages, setMessages] = useState([
        { role: "assistant", content: `Welcome to **GameSense!** Select a game chat on the left to get started, or ask a general question about gaming strategy. Currently selected: **${GAME_CONTEXTS.VALORANT.name}**.` }
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
        // Detect Valorant agent if in Valorant mode
        let detectedAgent = null;
        let urls = [];

        if (selectedGameContext.name === "VALORANT") {
    detectedAgent = detectValorantAgent(trimmedInput, selectedGameContext.agents);
    if (detectedAgent) {
        urls = selectedGameContext.agents[detectedAgent];
    }
}

        // 1. Display user message immediately
        const newMessages = [...messages, userMessage];
        setMessages(newMessages); 
        setInput(""); // Clear input
        setIsLoading(true);

        // 2. Add temporary placeholder message for loading
        setMessages(m => [...m, { role: "assistant", content: "..." }]);
        
        // Prepare the payload for the backend (including history and system context)
        const payload = {
            prompt: trimmedInput,
            chatHistory: newMessages,
            systemInstruction: selectedGameContext.systemInstruction,
            guideURLs: urls  // NEW: send multiple URLs to backend
        };

        
        // --- DEBUGGING CONSOLE LOG ADDED HERE ---
        console.log("Sending Payload to Backend:", payload);
        // ----------------------------------------

        try {
            // 3. API Call to Node.js Backend Proxy
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
    }, [input, isLoading, messages, selectedGameContext]);


    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents newline in input box
            sendMessage();
        }
    };


    const styles = {
        container: "flex min-h-screen text-white font-sans",
        sidebar: "flex flex-col w-64 min-w-64 bg-[#17141f] border-r border-[#00FF00]/20",
        chat_section: "bg-[#251F33] flex-1 flex flex-col max-h-screen",

        navbar: "flex flex-row items-center justify-center w-full h-16 bg-[#1B1724] shadow-lg shadow-black/30 px-6 text-xl text-[#00FF00]",

        chat_window: "flex-1 overflow-y-auto p-6 space-y-6",
        chats: "w-[90%] mx-auto md:w-[70%] overflow-y-auto",
        game_chats: "px-5 flex-1 overflow-y-auto",

        input_chat: "p-4 bg-[#1B1724] border-t-2 border-[#00FF00] flex items-center gap-3 shadow-t-xl",
        text_input: "flex-1 bg-[#17141f] px-4 py-3 rounded-2xl outline-none shadow-inner shadow-black/50 text-base resize-none placeholder-gray-500",
        send_btn: `px-6 py-3 text-white rounded-xl transition duration-200 shadow-md font-semibold focus:outline-none focus:ring-4 focus:ring-[#00FF00]/50 
            ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#00BB00] hover:bg-[#007700] active:bg-[#005500]'}`,

        user_acc_btn: "flex flex-row px-5 py-4 mt-auto w-full items-center hover:bg-[#251F33] transition-colors border-t border-[#00FF00]/10",
        acc_pfp: "w-10 h-10 rounded-full object-cover shadow-lg border-2 border-[#00FF00]/50",
        acc_name: "text-lg ml-5 font-medium"
    }

    return (
        <div className={styles.container}>

            {/* SIDEBAR */}
            <div className={styles.sidebar}>
                <img src={LOGO_TEXT_URL} alt="GameSense Logo" className="px-7 py-5 opacity-80"/>
                <div className={styles.game_chats}>
                    <h1 className="text-[#00FF00] text-center pb-3 mb-2 border-b border-[#00FF00]/30 font-semibold opacity-80">Game Chats</h1>
                    
                    <GameSelect 
                        gameKey="GENERAL" 
                        currentContext={selectedGameContext} 
                        setGameContext={setSelectedGameContext} 
                        setMessages={setMessages}
                    />
                    <GameSelect 
                        gameKey="VALORANT" 
                        currentContext={selectedGameContext} 
                        setGameContext={setSelectedGameContext} 
                        setMessages={setMessages}
                    />
                    <GameSelect 
                        gameKey="R6" 
                        currentContext={selectedGameContext} 
                        setGameContext={setSelectedGameContext} 
                        setMessages={setMessages}
                    />
                    <GameSelect 
                        gameKey="CS2" 
                        currentContext={selectedGameContext} 
                        setGameContext={setSelectedGameContext} 
                        setMessages={setMessages}
                    />

                </div>
                <button className={styles.user_acc_btn}>
                    <img className={styles.acc_pfp} src={DEFAULT_PFP_URL} alt="User Profile" />
                    <h1 className={styles.acc_name}>PlayerOne</h1>
                </button>
            </div>

            {/* CHAT SECTION */}
            <div className={styles.chat_section}>

                {/* NAVBAR */}
                <nav className={styles.navbar}>
                    {selectedGameContext.navbarTitle} - {MODEL_NAME}
                </nav>

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
                        placeholder={isLoading ? "Waiting for AI response..." : `Message ${selectedGameContext.name} Coach...`}
                        disabled={isLoading}
                        rows={1}
                        style={{minHeight: '40px', maxHeight: '150px'}} 
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