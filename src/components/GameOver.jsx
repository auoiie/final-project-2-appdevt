import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const GameOver = ({ winner, onPlayAgain }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1 style={styles.title}>Game Over</h1>
        {winner ? (
          <h2 style={styles.winnerText}>Winner: {winner}</h2>
        ) : (
          <h2 style={styles.winnerText}>It's a draw!</h2>
        )}
        <div style={styles.buttonContainer}>
          <Button onClick={onPlayAgain}>Play Again</Button>
          <Button onClick={() => navigate('/lobby')} style={{ marginTop: '10px', backgroundColor: '#6c757d' }}>
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    padding: '40px',
    borderRadius: '8px',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    border: '1px solid #555',
    textAlign: 'center',
    color: 'white',
  },
  title: {
    fontSize: '3em',
    marginBottom: '20px',
    color: 'darkorange',
  },
  winnerText: {
    fontSize: '2em',
    marginBottom: '30px',
  },
  buttonContainer: {
    width: '250px',
    margin: '0 auto',
  }
};

export default GameOver;