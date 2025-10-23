import React, { useState } from 'react';
import Input from '../components/Input'; 
import Button from '../components/Button'; 

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin); 
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2>{isLogin ? 'Player Log-In' : 'Player Registration'}</h2>

        <form>
          {!isLogin && (
            <Input type="text" placeholder="Username" required />
          )}
          <Input type="email" placeholder="Email" required />
          <Input type="password" placeholder="Password" required />

          <Button type="submit">
            {isLogin ? 'Log In' : 'Register'}
          </Button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={toggleForm} style={styles.toggleLink}>
            {isLogin ? ' Register' : ' Log In'}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh', 
  },
  formContainer: {
    width: '300px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    textAlign: 'center',
  },
  toggleText: {
    marginTop: '15px',
    fontSize: '14px',
  },
  toggleLink: {
    color: '#007bff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Login;