import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import ChatIcon from '../assets/images/chat-icon.svg';
import ChatBox from './ChatBox';

const ChatToggle = ({ lobbyCode, username }) => {
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        function onReceiveMessage(newMessage) {
            setMessages(prev => [...prev, newMessage]);
            if (!showChat) {
                setHasUnread(true);
            }
        }
        socket.on('receive_chat_message', onReceiveMessage);
        return () => {
            socket.off('receive_chat_message', onReceiveMessage);
        };
    }, [showChat]);

    const handleToggleChat = () => {
        setShowChat(!showChat);
        if (!showChat) {
            setHasUnread(false);
        }
    };

    if (!lobbyCode) return null;

    return (
        <div style={styles.container}>
            {showChat && (
                <div style={styles.chatBoxWrapper}>
                    <ChatBox lobbyCode={lobbyCode} username={username} messages={messages} />
                </div>
            )}
            <div style={styles.chatToggleButton} onClick={handleToggleChat} title="Toggle Chat">
                <img src={ChatIcon} alt="Chat" style={styles.chatIcon} />
                {hasUnread && !showChat && <div style={styles.notificationDot} />}
            </div>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    },
    chatToggleButton: {
        width: '60px',
        height: '60px',
        backgroundColor: 'darkorange',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    },
    chatIcon: {
        width: '32px',
        height: '32px',
    },
    notificationDot: {
        position: 'absolute',
        top: '0px',
        right: '0px',
        width: '15px',
        height: '15px',
        backgroundColor: 'red',
        borderRadius: '50%',
        border: '2px solid white',
    },
    chatBoxWrapper: {
        width: '250px',
        height: '400px',
        position: 'absolute',
        bottom: '80px',
        right: '0',
        backgroundColor: 'rgba(20, 20, 20, 0.32)',
        borderRadius: '8px',
        border: '1px solid #555',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        padding: '15px',
    },
};

export default ChatToggle;