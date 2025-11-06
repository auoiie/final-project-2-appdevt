import React from 'react';

const ColorPicker = ({ isOpen, onClose, onColorSelect, allColors, usedColors, currentColor }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Choose Your Color</h2>
        <div style={styles.swatchContainer}>
          {allColors.map(color => {
            const isTaken = usedColors.includes(color) && color !== currentColor;
            const isCurrent = color === currentColor;
            return (
              <div
                key={color}
                style={{
                  ...styles.swatch,
                  backgroundColor: color,
                  opacity: isTaken ? 0.3 : 1,
                  cursor: isTaken ? 'not-allowed' : 'pointer',
                  border: isCurrent ? '3px solid darkorange' : '2px solid white',
                }}
                onClick={() => !isTaken && onColorSelect(color)}
              />
            );
          })}
        </div>
        <button style={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  modal: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)', border: '1px solid #555',
    padding: '20px 30px', borderRadius: '8px', textAlign: 'center', color: 'white',
  },
  title: {
    marginBottom: '20px',
  },
  swatchContainer: {
    display: 'flex', gap: '15px', marginBottom: '30px',
  },
  swatch: {
    width: '50px', height: '50px', borderRadius: '8px',
    transition: 'transform 0.1s', boxSizing: 'border-box',
  },
  closeButton: {
    padding: '10px 20px', fontSize: '16px', borderRadius: '5px',
    border: 'none', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer',
  }
};

export default ColorPicker;