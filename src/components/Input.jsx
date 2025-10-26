import React from 'react';

const Input = (props) => {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '16px',
      }}
    />
  );
};

export default Input;