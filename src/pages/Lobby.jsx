import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import Button from '../components/Button';
import Input from '../components/Input';
import GameLogo from '../assets/images/logo.png';
import ColorPicker from '../components/ColorPicker';

const PLAYER_COLORS = ['#58a9ffff', '#5bff84ff', '#f9d25eff', '#9f6ff9ff'];

const Lobby = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [lobbyData, setLobbyData] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);

    if (!socket.connected) {
      socket.connect();
    }

    function onLobbyState(state) {
      setLobbyData(state);
      setError('');
    }

    function onLobbyError(message) {
      setError(message);
    }

    function onGameStarted(initialGameState) {
      navigate(`/game/${initialGameState.lobbyCode}`, { state: { initialGameState } });
    }

    socket.on('lobby_state', onLobbyState);
    socket.on('lobby_error', onLobbyError);
    socket.on('game_started', onGameStarted);

    return () => {
      socket.off('lobby_state', onLobbyState);
      socket.off('lobby_error', onLobbyError);
      socket.off('game_started', onGameStarted);
    };
  }, [navigate]);

  const handleCreateLobby = () => socket.emit('create_lobby', username);

  const handleJoinLobby = (e) => {
    e.preventDefault();
    setError('');
    if (joinCode) {
      socket.emit('join_lobby', { lobbyCode: joinCode, username });
    }
  };

  const handleColorSelect = (color) => {
    if (lobbyData) {
      socket.emit('select_color', { lobbyCode: lobbyData.lobbyCode, color });
    }
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
        <ColorPicker 
          isOpen={isColorPickerOpen}
          onClose={() => setIsColorPickerOpen(false)}
          onColorSelect={handleColorSelect}
          allColors={PLAYER_COLORS}
          usedColors={usedColors}
          currentColor={currentPlayer?.color}
        />
        <h2 style={styles.title}>Game Lobby</h2>
        <div style={styles.lobbyInfo}>
          <p>Share this code with your friends:</p>
          <h3 style={styles.lobbyCode}>{lobbyData.lobbyCode}</h3>
        </div>
        <div style={styles.playerList}>
          <h4>Players ({players.length}/4)</h4>
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
      </div>
    );
  };

  const renderCreateJoinView = () => (
    <div style={styles.formContainer}>
      <div style={styles.createContainer}>
        <h2 style={styles.title}>Create a New Game</h2>
        <Button onClick={handleCreateLobby}>Create Lobby</Button>
      </div>
      <div style={styles.orSeparator}>
        <span style={styles.line}></span><span style={styles.orText}>OR</span><span style={styles.line}></span>
      </div>
      <div style={styles.joinContainer}>
        <h2 style={styles.title}>Join with Code</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        <form onSubmit={handleJoinLobby} style={styles.joinForm}>
          <Input type="text" placeholder="Enter Lobby Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength="6"/>
          <Button type="submit">Join Lobby</Button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <img src={GameLogo} alt="You're IT! Logo" style={styles.logo} />
      {username && <h2 style={styles.usernameDisplay}>{username}</h2>}
      {lobbyData ? renderInLobbyView() : renderCreateJoinView()}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    alignItems: 'center', height: '100vh', paddingBottom: '8vh', boxSizing: 'border-box',
  },
  logo: {
    width: '350px', marginBottom: '5px',
  },
  usernameDisplay: {
    color: 'darkorange', textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold',
  },
  formContainer: {
    width: '400px', padding: '30px', borderRadius: '8px',
    backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #555', textAlign: 'center',
  },
  lobbyContainer: {
    width: '400px', padding: '20px', borderRadius: '8px',
    textAlign: 'center', backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #555',
  },
  title: { marginBottom: '20px' },
  createContainer: { marginBottom: '20px' },
  joinContainer: {},
  joinForm: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  errorText: { color: '#dc3545', marginBottom: '10px' },
  orSeparator: { display: 'flex', alignItems: 'center', margin: '20px 0' },
  line: { flexGrow: 1, height: '1px', backgroundColor: '#555' },
  orText: { padding: '0 10px', color: '#888' },
  lobbyInfo: { marginBottom: '20px' },
  lobbyCode: {
    backgroundColor: '#111', padding: '10px', borderRadius: '5px',
    letterSpacing: '2px', border: '1px solid #555',
  },
  playerList: { marginBottom: '20px', textAlign: 'left', padding: 0 },
  playerItem: {
    display: 'flex',
    alignItems: 'center',
    listStyle: 'none',
    padding: '12px 0',
    margin: 0,
    borderBottom: '1px solid #444',
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  colorSquare: {
    width: '20px', height: '20px', borderRadius: '4px',
    marginRight: '15px', border: '1px solid #fff',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  }
};

export default Lobby;