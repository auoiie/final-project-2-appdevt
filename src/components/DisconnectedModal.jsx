import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const DisconnectedModal = ({ message }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h1 style={styles.modalTitle}>Player Disconnected</h1>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonContainer}>
          <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200,
  },
  modal: {
    padding: '30px 40px', borderRadius: '8px', backgroundColor: 'rgba(20, 20, 20, 0.9)',
    border: '1px solid #555', textAlign: 'center', color: 'white',
  },
  modalTitle: {
    fontSize: '2.5em', marginBottom: '15px', color: '#dc3545',
  },
  message: {
    fontSize: '1.2em', marginBottom: '30px',
  },
  buttonContainer: {
    width: '250px', margin: '0 auto',
  }
};

export default DisconnectedModal;