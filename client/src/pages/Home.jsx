import React, { useState } from "react";
import ChatBubble from "../component/ChatBubble";
import logo_text from "../assets/gamesense-logo-text.png"
import default_pfp from "../assets/default-user-pfp.png"

import valorant_logo from "../assets/valorant-logo.jpeg"
import r6_logo from "../assets/rainbow6-logo.jpg"
import cs2_logo from "../assets/cs2-logo.webp"

const GameSelect = ({name, logo}) => {

    const styles = {
        container : "bg-[#251F33] hover:bg-black my-4 w-full rounded-xl flex flex-row items-center transition-colors p-3",
        logo: "w-6 h-6 mx-2",
        name: "w-full text-center text-sm font-bold",
    }

    return (
        <button className={styles.container}>
            <img src={logo} className={styles.logo} />
            <h1 className={styles.name}>{name}</h1>
        </button>
    )
}

function Home() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! How can I help you today?" }
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (!input.trim()) return;

        const newMessage = { role: "user", content: input };
        setMessages([...messages, newMessage]);

        setInput(""); // clear input
    };

    const styles = {
        container: "flex",
        sidebar: "flex flex-col w-100 bg-[#17141f]",
        chat_section: "bg-[#251F33] h-screen w-full flex flex-col",

        navbar: "flex flex-row items-center justify-center w-full h-20 bg-[#1B1724] shadow px-6 py-4 text-xl text-center font-semibold",
        chat_window: "flex-1 overflow-y-auto p-6 space-y-4",
        chats: "w-[70%] mx-auto",
        game_chats: "px-5",
        input_chat: "p-4 bg-[#1B1724] border-t-2 border-[#00FF00] flex items-center gap-3",
        text_input: "flex-1 bg-[#17141f] px-4 py-2 rounded-xl outline-none shadow-xl/20",
        send_btn: "px-4 py-2 bg-[#00BB00] text-white rounded-xl hover:bg-[#005A00] transition",

        user_acc_btn: "flex flex-row px-5 py-4 mt-auto w-full items-center hover:bg-[#251F33] transition-colors",
        acc_pfp: "w-10 rounded-full",
        acc_name: "text-lg ml-5"
    }

    return (
        <div className={styles.container}>

            <div className={styles.sidebar}>
                <img src={logo_text} alt="" className="px-7 py-5"/>
                <div className={styles.game_chats}>
                    <h1 className="text-purple-300 text-center pb-2 border-b opacity-50">Game Chats</h1>
                    <GameSelect logo={valorant_logo} name="VALORANT" />
                    <GameSelect logo={r6_logo} name="Rainbow Six Siege" />
                    <GameSelect logo={cs2_logo} name="Counter Strike 2" />
                </div>
                <button className={styles.user_acc_btn}>
                    <img className={styles.acc_pfp} src={default_pfp} alt="" />
                    <h1 className={styles.acc_name}>user</h1>
                </button>
            </div>

            <div className={styles.chat_section}>

                {/* NAVBAR */}
                <nav className={styles.navbar}>VALORANT chat</nav>

                {/* CHAT WINDOW */}
                <div className={styles.chat_window}>
                    <div className={styles.chats}>
                        { messages.map((msg, index) => ( <ChatBubble index={index} role={msg.role} content={msg.content} /> )) }
                    </div>
                </div>

                {/* INPUT BOX */}
                <div className={styles.input_chat}>
                    <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className={styles.text_input}
                    placeholder="Message GameSense..."
                    />
                    <button onClick={sendMessage} className={styles.send_btn}>
                    Send
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Home;
