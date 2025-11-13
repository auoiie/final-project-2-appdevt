import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import GameLogo from '../assets/images/logo.png';
import GameOver from '../components/GameOver.jsx';
import Button from '../components/Button.jsx';
import DisconnectedModal from '../components/DisconnectedModal.jsx';
import ChatToggle from '../components/ChatToggle';

const DisqualifiedOverlay = ({ onSpectate, onQuit }) => (
    <div style={styles.overlay}>
        <div style={styles.modal}>
            <h1 style={styles.modalTitle}>You've Been Disqualified!</h1>
            <div style={styles.modalButtonGroup}>
                <Button onClick={onSpectate} style={{ flex: 1 }}>Spectate</Button>
                <Button onClick={onQuit} style={{ flex: 1, backgroundColor: '#dc3545' }}>Quit to Lobby</Button>
            </div>
        </div>
    </div>
);

const GameArena = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { lobbyCode } = useParams();
    const [gameState, setGameState] = useState(location.state?.initialGameState);
    const [gameOverInfo, setGameOverInfo] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [isDisqualified, setIsDisqualified] = useState(false);
    const [isSpectating, setIsSpectating] = useState(false);
    const [disconnectMessage, setDisconnectMessage] = useState('');
    const keysPressed = useRef({});

    useEffect(() => {
        if (!location.state?.initialGameState) {
            navigate('/lobby');
            return;
        }

        if (!socket.connected) {
            socket.connect();
        }

        const onGameStateUpdate = (newState) => {
            const me = newState.players.find(p => p.id === socket.id);
            if (me && me.disqualified && !isDisqualified && !isSpectating) {
                setIsDisqualified(true);
            }
            setGameState(newState);
        };
        
        const onGameOver = (data) => setGameOverInfo(data);
        const onCountdown = (count) => setCountdown(count);
        const onLobbyClosed = (message) => setDisconnectMessage(message);

        socket.on('game_state_update', onGameStateUpdate);
        socket.on('game_over', onGameOver);
        socket.on('countdown', onCountdown);
        socket.on('lobby_closed', onLobbyClosed);

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;
            const key = e.key.toLowerCase();
            if (['a', 'd', 'w'].includes(key) && !keysPressed.current[key]) {
                keysPressed.current[key] = true;
                socket.emit('player_input', { lobbyCode, key, state: true });
            }
        };

        const handleKeyUp = (e) => {
            if (e.target.tagName === 'INPUT') return;
            const key = e.key.toLowerCase();
            if (['a', 'd', 'w'].includes(key)) {
                keysPressed.current[key] = false;
                socket.emit('player_input', { lobbyCode, key, state: false });
            }
        };
        
        if (!isDisqualified) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        }

        return () => {
            socket.off('game_state_update', onGameStateUpdate);
            socket.off('game_over', onGameOver);
            socket.off('countdown', onCountdown);
            socket.off('lobby_closed', onLobbyClosed);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [lobbyCode, isDisqualified, isSpectating, navigate, location.state]);
    
    const handleQuitToLobby = () => {
        socket.emit('leave_game');
        navigate('/lobby');
    };

    const handleSpectate = () => {
        setIsDisqualified(false);
        setIsSpectating(true);
    };
    
    const convertStateToPercentages = (state) => {
        if (!state) return null;
        const canvasWidth = 1200;
        const canvasHeight = 600;
        return {
            ...state,
            players: state.players.map(p => ({
                ...p,
                position: { x: (p.position.x / canvasWidth) * 100, y: (p.position.y / canvasHeight) * 100 }
            })),
            platforms: state.platforms.map(pf => ({
                ...pf,
                x: (pf.x / canvasWidth) * 100, y: (pf.y / canvasHeight) * 100,
                width: (pf.width / canvasWidth) * 100, height: (pf.height / canvasHeight) * 100,
            }))
        };
    };

    const displayState = convertStateToPercentages(gameState);

    if (!displayState) return <div style={styles.loadingContainer}><h1 style={styles.loadingText}>Loading...</h1></div>;

    return (
        <div style={styles.arenaContainer}>
            {disconnectMessage && <DisconnectedModal message={disconnectMessage} />}
            {gameOverInfo && <GameOver rankedStats={gameOverInfo.rankedStats} onBackToLobby={handleQuitToLobby} />}
            {isDisqualified && <DisqualifiedOverlay onSpectate={handleSpectate} onQuit={handleQuitToLobby} />}
            
            {countdown > 0 && (
                <div style={styles.countdownOverlay}><h1 style={styles.countdownText}>{countdown}</h1></div>
            )}
            
            <div style={styles.topHud}>
                <div style={styles.lobbyCodeDisplay}>Code: {lobbyCode}</div>
                <Button onClick={handleQuitToLobby} style={styles.quitButton}>Quit</Button>
            </div>

            <img src={GameLogo} alt="Game Logo" style={styles.logo} />
            <div style={styles.statusBar}>
                <div style={styles.timer}>Time: {displayState.timer}s</div>
                <div style={styles.itStatus}>IT: {displayState.itPlayer}</div>
            </div>
            <div style={styles.gameCanvas}>
                {displayState.players.filter(p => !p.disqualified).map(player => (
                    <React.Fragment key={player.id}>
                        <div style={{...styles.playerName, left: `${player.position.x + (3.33 / 2)}%`, top: `${player.position.y - 3}%`}}>
                            {player.username}
                        </div>
                        <div style={{
                            ...styles.playerCharacter, left: `${player.position.x}%`, top: `${player.position.y}%`,
                            backgroundColor: player.isIt ? '#dc3545' : player.color,
                            boxShadow: player.isIt ? '0 0 0 2px #6e0000, 0 0 8px 4px rgba(255, 77, 77, 0.5)' : 'none',
                        }} />
                    </React.Fragment>
                ))}
                {displayState.platforms.map(platform => (
                    <div key={platform.id || platform._id} style={{ ...styles.platform, left: `${platform.x}%`, top: `${platform.y}%`, width: `${platform.width}%`, height: `${platform.height}%` }} />
                ))}
            </div>
            <ChatToggle lobbyCode={lobbyCode} username={localStorage.getItem('username')} />
        </div>
    );
};

const styles = {
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center', color: 'white' },
    loadingText: { fontSize: '3em', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' },
    arenaContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', boxSizing: 'border-box' },
    topHud: {
        position: 'absolute',
        top: '20px',
        width: 'calc(80vw - 40px)',
        maxWidth: '1160px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
    },
    lobbyCodeDisplay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: '5px',
        color: '#ccc',
        fontSize: '14px',
        letterSpacing: '1px'
    },
    quitButton: {
        width: 'auto',
        padding: '8px 20px',
        fontSize: '14px',
        backgroundColor: '#6c757d',
    },
    logo: { width: '350px', marginBottom: '2px' },
    statusBar: {
        width: '80vw', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', padding: '10px 20px',
        backgroundColor: 'rgba(20, 20, 20, 0.8)', color: 'white', borderRadius: '8px', marginBottom: '10px',
        fontSize: '20px', border: '1px solid #555', boxSizing: 'border-box',
    },
    timer: {},
    itStatus: {},
    gameCanvas: {
        width: '80vw', maxWidth: '1200px', aspectRatio: '2 / 1', backgroundColor: 'rgba(70, 40, 10, 0.8)',
        border: '2px solid #555', borderRadius: '8px', position: 'relative', overflow: 'hidden',
    },
    platform: { position: 'absolute', backgroundColor: 'darkorange', borderRadius: '5px' },
    playerName: {
        position: 'absolute', color: 'white', textShadow: '1px 1px 2px black', fontSize: '10px',
        fontWeight: 'bold', transform: 'translateX(-50%)', width: '100px', textAlign: 'center',
    },
    playerCharacter: { position: 'absolute', width: '3.33%', height: '6.67%', borderRadius: '5px' },
    countdownOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 200,
    },
    countdownText: { fontSize: '15em', color: 'white', textShadow: '0 0 20px darkorange, 0 0 30px black' },
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
    },
    modal: {
        padding: '30px 40px', borderRadius: '8px', backgroundColor: 'rgba(20, 20, 20, 0.9)',
        border: '1px solid #555', textAlign: 'center', color: 'white', width: '400px',
    },
    modalTitle: { fontSize: '2.5em', marginBottom: '25px', color: 'darkorange' },
    modalButtonGroup: { display: 'flex', gap: '15px', marginTop: '20px' },
};

export default GameArena;