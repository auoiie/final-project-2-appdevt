import React from 'react';
import GameLogo from '../assets/images/logo.png';

const dummyGameData = {
  timer: 23,
  itPlayer: 'Player2_Jean',
  players: [
    { id: 1, name: 'Player1_Veronica', isIt: false, position: { x: 520, y: 445 } },
    { id: 2, name: 'Player2_Jean', isIt: true, position: { x: 580, y: 445 } },
    { id: 3, name: 'Player3_Nadine', isIt: false, position: { x: 640, y: 445 } },
  ],
  platforms: [
    { id: 'p1', x: 500, y: 380, width: 220, height: 30 },
    { id: 'p2', x: 120, y: 270, width: 260, height: 30 },
    { id: 'p3', x: 850, y: 280, width: 260, height: 30 },
    { id: 'p4', x: 450, y: 120, width: 300, height: 30 },
  ],
};

const GameArena = () => {
  const { timer, itPlayer, players, platforms } = dummyGameData;

  return (
    <div style={styles.arenaContainer}>
      <img src={GameLogo} alt="Game Logo" style={styles.logo} />
      <div style={styles.statusBar}>
        <div style={styles.timer}>Time: {timer}s</div>
        <div style={styles.itStatus}>IT: {itPlayer}</div>
      </div>
      <div style={styles.gameCanvas}>
        {players.map(player => (
          <div
            key={player.id}
            style={{
              ...styles.playerCharacter,
              left: `${player.position.x}px`,
              top: `${player.position.y}px`,
              backgroundColor: player.isIt ? '#dc3545' : '#007bff',
              boxShadow: player.isIt ? '0 0 0 2px #6e0000, 0 0 8px 4px rgba(255, 77, 77, 0.5)' : 'none',
            }}
          >
          </div>
        ))}
        {platforms.map(platform => (
          <div
            key={platform.id}
            style={{
              ...styles.platform,
              left: `${platform.x}px`,
              top: `${platform.y}px`,
              width: `${platform.width}px`,
              height: `${platform.height}px`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  arenaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    boxSizing: 'border-box',
    paddingBottom: '5vh',
  },
  logo: {
    width: '350px',
    marginBottom: '2px',
  },
  statusBar: {
    width: '1200px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '10px',
    fontSize: '20px',
    border: '1px solid #555',
    boxSizing: 'border-box',
  },
  timer: {},
  itStatus: {},
  gameCanvas: {
    width: '1200px',
    height: '600px',
    backgroundColor: 'rgba(70, 40, 10, 0.8)',
    border: '2px solid #555',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  platform: {
    position: 'absolute',
    backgroundColor: 'darkorange',
    borderRadius: '5px',
  },
  playerCharacter: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '5px',
    fontSize: '10px',
    textAlign: 'center',
  },
};

export default GameArena;