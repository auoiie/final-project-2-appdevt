import React from 'react';

const dummyGameData = {
  timer: 23,
  itPlayer: 'Player2_Jean',
  players: [
    { id: 1, name: 'Player1_Veronica', isIt: false, position: { x: 50, y: 350 } },
    { id: 2, name: 'Player2_Jean', isIt: true, position: { x: 200, y: 350 } },
    { id: 3, name: 'Player3_Nadine', isIt: false, position: { x: 350, y: 350 } },
  ],
};

const GameArena = () => {
  const { timer, itPlayer, players } = dummyGameData;

  return (
    <div style={styles.arenaContainer}>
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
            }}
          >
            {player.name}
          </div>
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
  },
  statusBar: {
    width: '800px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    backgroundColor: '#333',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '10px',
    fontSize: '20px',
  },
  timer: {},
  itStatus: {},
  gameCanvas: {
    width: '800px',
    height: '400px',
    backgroundColor: '#f0f0f0',
    border: '2px solid #333',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  playerCharacter: {
    position: 'absolute',
    width: '50px',
    height: '50px',
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