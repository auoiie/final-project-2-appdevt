import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import GameLogo from '../assets/images/logo.png';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Send login request to backend
        if (isLogin) {
            try {
                const res = await axios.post('https://final-project-2-appdevt.onrender.com/api/auth/login', {
                    email: formData.email,
                    password: formData.password,
                });

// Store auth data for session
                localStorage.setItem('token', res.data.token);
                // CRITICAL FIX: Ensure res.data.user.username exists. 
                // We keep this structure, but verify your API returns it this way.
                localStorage.setItem('username', res.data.user.username); 
                localStorage.setItem('role', res.data.user.role);
                
                navigate('/lobby'); // Go to lobby after login

                // Show backend error message
            } catch (err) {
                setError(err.response?.data?.message || 'Something went wrong!');
            }
        } else {
            // Basic email validation just for Gmail
            if (!formData.email.endsWith('@gmail.com')) {
                setError("Please use a valid @gmail.com address.");
                return;
            }

            // Send registration request to backend
            try {
                const res = await axios.post('https://final-project-2-appdevt.onrender.com/api/auth/register', {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                });
                alert('Registration successful! Please log in.');
                setIsLogin(true);
            } catch (err) {
                setError(err.response?.data?.message || 'Something went wrong!');
            }
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <img src={GameLogo} alt="You're IT! Logo" style={styles.logo} />
                
                {error && <p style={styles.errorText}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <Input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required maxLength="10" />
                    )}
                    <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                    <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
                    
                    <Button type="submit">
                        {isLogin ? 'Log In' : 'Register'}
                    </Button>
                </form>

                <div style={styles.linksContainer}>
                    {isLogin && <Link to="/forgot-password" style={styles.toggleLink}>Forgot Password?</Link>}
                    <p style={styles.toggleText}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <span onClick={toggleForm} style={styles.toggleLink}>
                            {isLogin ? ' Register' : ' Log In'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
    formContainer: {
        width: '400px', padding: '40px', borderRadius: '8px', textAlign: 'center',
        backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #555',
    },
    logo: { width: '280px', marginBottom: '30px' },
    errorText: {
        color: '#dc3545', backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '10px',
        borderRadius: '5px', marginBottom: '15px',
    },
    linksContainer: {
        marginTop: '15px',
    },
    toggleText: { 
        margin: '10px 0 0 0',
        fontSize: '14px' 
    },
    toggleLink: { color: '#00aaff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' },
};

export default Login;