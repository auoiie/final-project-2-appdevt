import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

const ChatBox = ({ lobbyCode, username, messages }) => {
    const [inputValue, setInputValue] = useState('');
    const messageListRef = useRef(null);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            socket.emit('send_chat_message', { lobbyCode, message: inputValue });
            setInputValue('');
        }
    };

    return (
        <div style={styles.chatContainer}>
            <div ref={messageListRef} className="chat-message-list" style={styles.messageList}>
                {messages.map((msg) => {
                    const isMe = msg.username === username;
                    return (
                        <div key={msg.id} style={styles.messageItem(isMe)}>
                            <div style={styles.messageBubble(isMe)}>
                                {!isMe && <strong style={styles.username}>{msg.username}</strong>}
                                <p style={styles.messageText}>{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <form onSubmit={handleSendMessage} style={styles.form}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={styles.input}
                    placeholder="Type a message..."
                />
                <button type="submit" style={styles.sendButton}>Send</button>
            </form>
        </div>
    );
};

const styles = {
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'transparent',
    },
    messageList: {
        flex: '1 1 0',
        overflowY: 'auto',
        listStyle: 'none',
        padding: '10px',
        margin: 0,
        minHeight: 0,
    },
    messageItem: (isMe) => ({
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        marginBottom: '10px',
    }),
    messageBubble: (isMe) => ({
        padding: '8px 12px',
        borderRadius: '18px',
        maxWidth: '80%',
        backgroundColor: isMe ? 'darkorange' : '#4a4a4a',
    }),
    username: {
        fontSize: '0.8em',
        color: '#ccc',
        display: 'block',
        marginBottom: '4px',
    },
    messageText: {
        margin: 0,
        wordWrap: 'break-word',
    },
    form: {
        display: 'flex',
        padding: '10px 0 0 0',
    },
    input: {
        flexGrow: 1,
        border: 'none',
        padding: '10px',
        borderRadius: '18px',
        backgroundColor: '#111',
        color: 'white',
    },
    sendButton: {
        border: 'none',
        backgroundColor: 'darkorange',
        color: 'white',
        fontWeight: 'bold',
        padding: '0 15px',
        marginLeft: '10px',
        borderRadius: '18px',
        cursor: 'pointer',
    },
};

export default ChatBox;