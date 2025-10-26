import React from 'react';

const Button = ({ children, style, ...props }) => {
  const buttonStyle = {
    width: '100%',
    padding: '15px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: 'darkorange',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    ...style,
  };

  return (
    <button {...props} style={buttonStyle}>
      {children}
    </button>
  );
};

export default Button;