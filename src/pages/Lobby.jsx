import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import GameLogo from '../assets/images/logo.png';

const createDummyLobbyData = (isHost = true) => ({
  lobbyCode: 'XYZ123',
  players: [
    { id: 1, name: 'Player1_Veronica', ready: isHost },
    { id: 2, name: 'Player2_Jean', ready: false },
  ],
  isHost: isHost,
  currentUser: { id: isHost ? 1 : 2 },
});

const Lobby = () => {
  const navigate = useNavigate();
  const [lobbyData, setLobbyData] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleCreateLobby = () => {
    setLobbyData(createDummyLobbyData(true));
  };

  const handleJoinLobby = (e) => {
    e.preventDefault();
    setLobbyData(createDummyLobbyData(false));
  };

  const handleReadyToggle = () => {
    setLobbyData(currentLobby => {
      const updatedPlayers = currentLobby.players.map(p => {
        if (p.id === currentLobby.currentUser.id) {
          return { ...p, ready: !p.ready };
        }
        return p;
      });
      return { ...currentLobby, players: updatedPlayers };
    });
  };

  const handleStartGame = () => {
    navigate('/game');
  };

  const renderInLobbyView = () => {
    const { lobbyCode, players, isHost, currentUser } = lobbyData;
    const canStartGame = players.length >= 2 && players.every(p => p.ready);
    const currentPlayer = players.find(p => p.id === currentUser.id);

    return (
      <div style={styles.lobbyContainer}>
        <h2 style={styles.title}>Game Lobby</h2>
        <div style={styles.lobbyInfo}>
          <p>Share this code with your friends:</p>
          <h3 style={styles.lobbyCode}>{lobbyCode}</h3>
        </div>
        <div style={styles.playerList}>
          <h4>Players ({players.length}/4)</h4>
          <ul>
            {players.map(player => (
              <li key={player.id} style={styles.playerItem}>
                {player.name}
                <span style={{ color: player.ready ? '#28a745' : '#dc3545', marginLeft: '8px' }}>
                  {player.ready ? '(Ready)' : '(Not Ready)'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {isHost ? (
          <Button onClick={handleStartGame} disabled={!canStartGame}>
            {canStartGame ? 'Start Game' : 'Waiting for players...'}
          </Button>
        ) : (
          <Button onClick={handleReadyToggle} style={{ backgroundColor: currentPlayer.ready ? '#28a745' : '#790000ff' }}>
            {currentPlayer.ready ? 'Unready' : 'Ready'}
          </Button>
        )}
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
        <span style={styles.line}></span>
        <span style={styles.orText}>OR</span>
        <span style={styles.line}></span>
      </div>
      <div style={styles.joinContainer}>
        <h2 style={styles.title}>Join with Code</h2>
        <form onSubmit={handleJoinLobby} style={styles.joinForm}>
          <Input
            type="text"
            placeholder="Enter Lobby Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength="6"
          />
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    paddingBottom: '8vh',
    boxSizing: 'border-box',
  },
  logo: {
    width: '350px',
    marginBottom: '5px',
  },
  usernameDisplay: {
    color: 'darkorange',
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    margin: '0 0 20px 0',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '400px',
    padding: '30px',
    borderRadius: '8px',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    border: '1px solid #555',
    textAlign: 'center',
  },
  lobbyContainer: {
    width: '400px',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    border: '1px solid #555',
  },
  title: {
    marginBottom: '20px',
  },
  createContainer: {
    marginBottom: '20px',
  },
  joinContainer: {},
  joinForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  orSeparator: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
  },
  line: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: '#555',
  },
  orText: {
    padding: '0 10px',
    color: '#888',
  },
  lobbyInfo: {
    marginBottom: '20px',
  },
  lobbyCode: {
    backgroundColor: '#111',
    padding: '10px',
    borderRadius: '5px',
    letterSpacing: '2px',
    border: '1px solid #555',
  },
  playerList: {
    marginBottom: '30px',
    textAlign: 'left',
  },
  playerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    listStyle: 'none',
    padding: '8px',
    margin: '0',
    borderBottom: '1px solid #444',
  },
};

export default Lobby;