import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      console.log('Logging in with:', formData.email, formData.password);
    } else {
      console.log('Registering with:', formData.username, formData.email, formData.password);
    }
    
    navigate('/lobby');
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2>{isLogin ? 'Player Log-In' : 'Player Registration'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          )}
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
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