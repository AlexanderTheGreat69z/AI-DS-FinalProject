import React from 'react'

const ChatBubble = ({index, role, content}) => {

    const styles = {
        container: `flex ${role === "user" ? "justify-end" : "justify-start"}`,
        content: `max-w-[70%] px-4 py-3 rounded-2xl ${ role === "user" ? "bg-[#00BB00] text-white rounded-br-none": "bg-[#1B1724] shadow rounded-bl-none"}`,
    }

    return (
        <div key={index} className={styles.container}>
            <div className={styles.content}> {content} </div>
        </div>
    )
}

export default ChatBubble