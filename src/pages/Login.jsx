import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import GameLogo from '../assets/images/logo.png';

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
    const userIdentifier = formData.username || formData.email.split('@')[0];
    localStorage.setItem('username', userIdentifier);
    navigate('/lobby');
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <img src={GameLogo} alt="You're IT! Logo" style={styles.logo} />

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
    height: '100vh',
  },
  formContainer: {
    width: '400px',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    border: '1px solid #555',
  },
  logo: {
    width: '280px',
    marginBottom: '30px',
  },
  toggleText: {
    marginTop: '20px',
    fontSize: '14px',
  },
  toggleLink: {
    color: '#00aaff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Login;