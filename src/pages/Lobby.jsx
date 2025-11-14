import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { socket } from '../socket';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import GameLogo from '../assets/images/logo.png';
import ColorPicker from '../components/ColorPicker';
import ChatBox from '../components/ChatBox';
import ChatIcon from '../assets/images/chat-icon.svg';

const PLAYER_COLORS = ['#58a9ffff', '#5bff84ff', '#f9d25eff', '#9f6ff9ff'];

const Lobby = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [lobbyData, setLobbyData] = useState(location.state?.lobbyData || null);
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [levels, setLevels] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);

        const fetchLevels = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://final-project-2-appdevt.onrender.com/api/levels', {
                    headers: { 'auth-token': token },
                });
                setLevels(res.data);
            } catch (err) {
                console.error("Could not fetch levels");
            }
        };
        fetchLevels();

        if (location.state?.rejoinCode && storedUsername) {
            if (!socket.connected) socket.connect();
            socket.emit('join_lobby', { lobbyCode: location.state.rejoinCode, username: storedUsername });
            window.history.replaceState({}, document.title);
        }
    }, []);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        function onLobbyState(state) {
            setLobbyData(state);
            setError('');
        }
        function onLobbyError(message) { setError(message); }
        function onGameStarted(initialGameState) { navigate(`/game/${initialGameState.lobbyCode}`, { state: { initialGameState } }); }
        function onLobbyClosed(message) {
            alert(message);
            setLobbyData(null);
            navigate('/lobby', { replace: true, state: {} });
        }
        function onReceiveMessage(newMessage) {
            setMessages(prev => [...prev, newMessage]);
            if (!showChat) {
                setHasUnread(true);
            }
        }

        socket.on('lobby_state', onLobbyState);
        socket.on('lobby_error', onLobbyError);
        socket.on('game_started', onGameStarted);
        socket.on('lobby_closed', onLobbyClosed);
        socket.on('receive_chat_message', onReceiveMessage);

        return () => {
            socket.off('lobby_state', onLobbyState);
            socket.off('lobby_error', onLobbyError);
            socket.off('game_started', onGameStarted);
            socket.off('lobby_closed', onLobbyClosed);
            socket.off('receive_chat_message', onReceiveMessage);
        };
    }, [navigate, showChat]);
    
    const handleToggleChat = () => {
        setShowChat(!showChat);
        if (!showChat) {
            setHasUnread(false);
        }
    };

    const handleLevelSelect = (e) => {
        const levelId = e.target.value;
        const levelName = e.target.options[e.target.selectedIndex].text;
        socket.emit('select_level', { lobbyCode: lobbyData.lobbyCode, levelId, levelName });
    };

    const handleCreateLobby = () => socket.emit('create_lobby', username);

    const handleJoinLobby = (e) => {
        e.preventDefault();
        setError('');
        if (joinCode) {
            socket.emit('join_lobby', { lobbyCode: joinCode, username });
        }
    };

    const handleLeaveLobby = () => {
        socket.emit('leave_game');
        setLobbyData(null);
        setMessages([]);
    };

    const handleColorSelect = (color) => {
        if (lobbyData) socket.emit('select_color', { lobbyCode: lobbyData.lobbyCode, color });
        setIsColorPickerOpen(false);
    };

    const handleReadyToggle = () => {
        if (lobbyData) socket.emit('toggle_ready', lobbyData.lobbyCode);
    };

    const handleStartGame = () => {
        if (lobbyData) socket.emit('start_game', lobbyData.lobbyCode);
    };

    const renderInLobbyView = () => {
        const isHost = socket.id === lobbyData.host;
        const players = lobbyData.players || [];
        const canStartGame = isHost && players.length >= 2 && players.every(p => p.ready);
        const currentPlayer = players.find(p => p.id === socket.id);
        const usedColors = players.map(p => p.color);

        return (
            <div style={styles.lobbyContainer}>
                <div style={styles.lobbyHeader}>
                     <div style={{...styles.headerIcon, visibility: showChat ? 'hidden' : 'visible' }} onClick={handleLeaveLobby} title="Leave Lobby">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.backArrowSvg}>
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                    </div>
                    <h2 style={styles.title}>{showChat ? 'Chat' : 'Game Lobby'}</h2>
                    <div style={styles.headerIcon} onClick={handleToggleChat} title="Toggle Chat">
                        <img src={ChatIcon} alt="Chat" style={styles.chatIcon} />
                        {hasUnread && !showChat && <div style={styles.notificationDot} />}
                    </div>
                </div>
                
                <div style={styles.lobbyContent}>
                    {showChat ? (
                        <ChatBox lobbyCode={lobbyData.lobbyCode} username={username} messages={messages} />
                    ) : (
                        <>
                            <ColorPicker 
                                isOpen={isColorPickerOpen}
                                onClose={() => setIsColorPickerOpen(false)}
                                onColorSelect={handleColorSelect}
                                allColors={PLAYER_COLORS}
                                usedColors={usedColors}
                                currentColor={currentPlayer?.color}
                            />
                            <div style={styles.lobbyInfo}>
                                <p style={{margin: '0 0 10px 0'}}>Share this code with your friends:</p>
                                <h3 style={styles.lobbyCode}>{lobbyData.lobbyCode}</h3>
                            </div>
                            <div style={styles.levelSelector}>
                                <label htmlFor="level-select" style={styles.levelLabel}>Map:</label>
                                {isHost ? (
                                    <select id="level-select" value={lobbyData.levelId || ''} onChange={handleLevelSelect} style={styles.dropdown}>
                                        <option value="">Default</option>
                                        {levels.map(level => (
                                            <option key={level._id} value={level._id}>{level.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span style={styles.levelNameDisplay}>{lobbyData.levelName || 'Default'}</span>
                                )}
                            </div>
                            <div style={styles.playerList}>
                                <h4 style={styles.playerListTitle}>Players ({players.length}/4)</h4>
                                <ul>
                                    {players.map(player => (
                                        <li key={player.id} style={styles.playerItem}>
                                            <div style={styles.playerInfo}>
                                                <span style={{...styles.colorSquare, backgroundColor: player.color}}></span>
                                                <span>{player.username}</span>
                                            </div>
                                            <span style={{ marginLeft: 'auto', color: player.ready ? '#28a745' : '#dc3545' }}>
                                                {player.ready ? '(Ready)' : '(Not Ready)'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div style={styles.buttonGroup}>
                                <Button onClick={() => setIsColorPickerOpen(true)} style={{ flex: 1, backgroundColor: '#6c757d'}}>Change Color</Button>
                                {isHost ? (
                                    <Button onClick={handleStartGame} disabled={!canStartGame} style={{ flex: 1.5 }}>
                                        {canStartGame ? 'Start Game' : 'Waiting for players...'}
                                    </Button>
                                ) : (
                                    <Button onClick={handleReadyToggle} style={{ flex: 1.5, backgroundColor: currentPlayer?.ready ? '#28a745' : '#790000ff' }}>
                                        {currentPlayer?.ready ? 'Unready' : 'Ready'}
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderCreateJoinView = () => (
        <div style={styles.formContainer}>
            <div style={styles.createContainer}>
                <h2 style={styles.formTitle}>Create a New Game</h2>
                <Button 
                    onClick={handleCreateLobby} 
                    disabled={!username} 
                >   
                    {username ? 'Create Lobby' : 'Loading Username...'}
                </Button>
            </div>
            <div style={styles.orSeparator}>
                <span style={styles.line}></span><span style={styles.orText}>OR</span><span style={styles.line}></span>
            </div>
            <div style={styles.joinContainer}>
                <h2 style={styles.formTitle}>Join with Code</h2>
                {error && <p style={styles.errorText}>{error}</p>}
                <form onSubmit={handleJoinLobby} style={styles.joinForm}>
                    <Input type="text" placeholder="Enter Lobby Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength="6"/>
                    <Button type="submit">Join Lobby</Button>
                </form>
            </div>
        </div>
    );

    return (
        <div style={styles.pageContainer}>
            <div style={styles.profileContainer}>
                <span style={styles.usernameText}>{username}</span>
                <Link to="/profile" style={styles.profileIconLink} title="View Profile">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.profileIconSvg}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </Link>
            </div>
            <div style={styles.contentContainer}>
                <img src={GameLogo} alt="You're IT! Logo" style={styles.logo} />
                {lobbyData ? renderInLobbyView() : renderCreateJoinView()}
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { position: 'relative', minHeight: '100vh' },
    profileContainer: {
        position: 'absolute', top: '25px', right: '30px',
        display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10,
    },
    usernameText: {
        color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    },
    profileIconLink: {
        width: '48px', height: '48px', backgroundColor: 'darkorange',
        borderRadius: '8px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    profileIconSvg: { width: '30px', height: '30px', fill: 'white' },
    contentContainer: {
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', height: '100vh', paddingBottom: '8vh', boxSizing: 'border-box',
    },
    logo: { width: '350px', marginBottom: '1px' },
    formContainer: {
        width: '400px', padding: '20px 20px', borderRadius: '8px',
        backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #555', textAlign: 'center',
    },
    lobbyContainer: {
        position: 'relative', width: '400px', padding: '25px 30px', borderRadius: '8px',
        textAlign: 'center', backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #555',
        display: 'flex', flexDirection: 'column',
    },
    lobbyHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '15px',
    },
    headerIcon: { cursor: 'pointer', width: '28px', height: '28px', position: 'relative' },
    backArrowSvg: { width: '100%', height: '100%', fill: '#aaa' },
    chatIcon: { width: '100%', height: '100%' },
    notificationDot: {
        position: 'absolute', top: '-2px', right: '-2px',
        width: '10px', height: '10px', backgroundColor: 'red',
        borderRadius: '50%', border: '2px solid #222',
    },
    title: { margin: 0, flexGrow: 1, fontSize: '1.8em' },
    formTitle: { marginBottom: '15px' },
    createContainer: { marginBottom: '10px' },
    joinContainer: {},
    joinForm: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    errorText: { color: '#dc3545', marginBottom: '10px' },
    orSeparator: { display: 'flex', alignItems: 'center', margin: '15px 0' },
    line: { flexGrow: 1, height: '1px', backgroundColor: '#555' },
    orText: { padding: '0 10px', color: '#888' },
    lobbyContent: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '420px',
    },
    lobbyInfo: { marginBottom: '2px' },
    lobbyCode: {
        backgroundColor: '#3e210cff', padding: '10px', borderRadius: '5px',
        letterSpacing: '2px', border: '1px solid #555',
    },
    levelSelector: {
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '15px', padding: '10px', border: '1px solid #444', borderRadius: '5px'
    },
    levelLabel: { fontWeight: 'bold', flexShrink: 0 },
    levelNameDisplay: {
        color: 'darkorange', fontWeight: 'bold', padding: '5px 0',
        flexGrow: 1, textAlign: 'right',
    },
    dropdown: {
        backgroundColor: '#3e210cff', color: 'white', padding: '5px',
        borderRadius: '5px', border: '1px solid #555', flexGrow: 1,
        fontSize: '16px', cursor: 'pointer',
    },
    playerList: { marginBottom: '5px', textAlign: 'left', padding: 0 },
    playerListTitle: { margin: '0 0 5px 0', textAlign: 'left', fontSize: '1.1em', fontWeight: 'bold' },
    playerItem: {
        display: 'flex', alignItems: 'center', padding: '8px 0',
        margin: 0, borderBottom: '1px solid #444',
    },
    playerInfo: { display: 'flex', alignItems: 'center' },
    colorSquare: {
        width: '20px', height: '20px', borderRadius: '4px',
        marginRight: '15px', border: '1px solid #fff',
    },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: 'auto' },
};

export default Lobby;