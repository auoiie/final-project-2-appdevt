import React from 'react';
import Button from '../components/Button'; 

const dummyLobbyData = {
  lobbyCode: 'XYZ123',
  players: [
    { id: 1, name: 'Player1_Nica' },
    { id: 2, name: 'Player2_JM' },
    { id: 3, name: 'Player3_Nadine' },
  ],
  isHost: true, 
};

const Lobby = () => {
  const { lobbyCode, players, isHost } = dummyLobbyData;
  const canStartGame = players.length >= 2; 

  return (
    <div style={styles.container}>
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
              </li>
            ))}
          </ul>
        </div>

        {isHost && (
          <Button disabled={!canStartGame}>
            {canStartGame ? 'Start Game' : 'Waiting for more players...'}
          </Button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  lobbyContainer: {
    width: '400px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginBottom: '20px',
  },
  lobbyInfo: {
    marginBottom: '20px',
  },
  lobbyCode: {
    backgroundColor: '#eee',
    padding: '10px',
    borderRadius: '5px',
    letterSpacing: '2px',
  },
  playerList: {
    marginBottom: '30px',
    textAlign: 'left',
  },
  playerItem: {
    listStyle: 'none',
    padding: '8px',
    borderBottom: '1px solid #ddd',
  },
};

export default Lobby;