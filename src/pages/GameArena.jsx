import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import GameLogo from '../assets/images/logo.png';
import GameOver from '../components/GameOver.jsx';
import Button from '../components/Button.jsx';

const convertStateToPercentages = (state) => {
  if (!state) return null;
  const canvasWidth = 1200;
  const canvasHeight = 600;

  const convertedPlayers = state.players.map(player => ({
    ...player,
    position: {
      x: (player.position.x / canvasWidth) * 100,
      y: (player.position.y / canvasHeight) * 100,
    }
  }));

  const convertedPlatforms = state.platforms.map(platform => ({
    ...platform,
    x: (platform.x / canvasWidth) * 100,
    y: (platform.y / canvasHeight) * 100,
    width: (platform.width / canvasWidth) * 100,
    height: (platform.height / canvasHeight) * 100,
  }));

  return { ...state, players: convertedPlayers, platforms: convertedPlatforms };
};

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
  const [gameState, setGameState] = useState(
    convertStateToPercentages(location.state?.initialGameState)
  );
  const [gameOver, setGameOver] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isSpectating, setIsSpectating] = useState(false);
  const keysPressed = useRef({});

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onGameStateUpdate(newState) {
      setGameState(convertStateToPercentages(newState));
      const me = newState.players.find(p => p.id === socket.id);
      if(me && me.disqualified && !isDisqualified && !isSpectating) {
        setIsDisqualified(true);
      }
    }
    
    function onGameOver(data) {
      setGameOver(data);
    }

    function onCountdown(count) {
      setCountdown(count);
    }

    socket.on('game_state_update', onGameStateUpdate);
    socket.on('game_over', onGameOver);
    socket.on('countdown', onCountdown);

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['a', 'd', 'w'].includes(key) && !keysPressed.current[key]) {
        keysPressed.current[key] = true;
        socket.emit('player_input', { lobbyCode, key, state: true });
      }
    };

    const handleKeyUp = (e) => {
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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lobbyCode, isDisqualified, isSpectating]);
  
  const handleQuit = () => {
    socket.emit('leave_game', lobbyCode);
    navigate('/lobby');
  };

  const handleSpectate = () => {
    setIsDisqualified(false);
    setIsSpectating(true);
  };

  if (!gameState) {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={styles.loadingText}>Loading Game...</h1>
      </div>
    );
  }

  const { timer, itPlayer, players, platforms } = gameState;

  return (
    <div style={styles.arenaContainer}>
      {gameOver && <GameOver winner={gameOver.winner} onPlayAgain={handleQuit} />}
      {isDisqualified && <DisqualifiedOverlay onSpectate={handleSpectate} onQuit={handleQuit} />}
      
      {countdown > 0 && (
        <div style={styles.countdownOverlay}>
          <h1 style={styles.countdownText}>{countdown}</h1>
        </div>
      )}

      <div style={styles.quitButtonContainer}>
        <Button onClick={handleQuit} style={{ backgroundColor: '#6c757d', width: '100px'}}>Quit</Button>
      </div>

      <img src={GameLogo} alt="Game Logo" style={styles.logo} />
      <div style={styles.statusBar}>
        <div style={styles.timer}>Time: {timer}s</div>
        <div style={styles.itStatus}>IT: {itPlayer}</div>
      </div>
      <div style={styles.gameCanvas}>
        {players.filter(p => !p.disqualified).map(player => (
          <React.Fragment key={player.id}>
            <div style={{...styles.playerName, left: `${player.position.x + (3.33 / 2)}%`, top: `${player.position.y - 3}%`}}>
              {player.username}
            </div>
            <div style={{
              ...styles.playerCharacter,
              left: `${player.position.x}%`,
              top: `${player.position.y}%`,
              backgroundColor: player.isIt ? '#dc3545' : player.color,
              boxShadow: player.isIt ? '0 0 0 2px #6e0000, 0 0 8px 4px rgba(255, 77, 77, 0.5)' : 'none',
            }}>
            </div>
          </React.Fragment>
        ))}
        {platforms.map(platform => (
          <div
            key={platform.id}
            style={{ ...styles.platform, left: `${platform.x}%`, top: `${platform.y}%`, width: `${platform.width}%`, height: `${platform.height}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center', color: 'white' },
  loadingText: { fontSize: '3em', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' },
  arenaContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', boxSizing: 'border-box' },
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
  quitButtonContainer: { position: 'absolute', top: '20px', right: '20px', zIndex: 100 },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  modal: {
    padding: '30px 40px', borderRadius: '8px', backgroundColor: 'rgba(20, 20, 20, 0.9)',
    border: '1px solid #555', textAlign: 'center', color: 'white',
  },
  modalTitle: { fontSize: '2.5em', marginBottom: '30px', color: 'darkorange' },
  modalButtonGroup: { display: 'flex', gap: '15px' }
};

export default GameArena;