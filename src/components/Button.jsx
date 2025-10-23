import React from 'react';

const Button = ({ children, ...props }) => {
  return (
    <button
      {...props}
      style={{
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      {children}
    </button>
  );
};

export default Button;