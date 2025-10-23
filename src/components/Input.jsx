import React from 'react';

const Input = (props) => {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box'
      }}
    />
  );
};

export default Input;