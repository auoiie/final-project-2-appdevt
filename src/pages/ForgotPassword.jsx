import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import GameLogo from '../assets/images/logo.png';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', newPassword: '', confirmPassword: '' });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        try {
            await axios.post('http://localhost:3001/api/auth/reset-password', {
                email: formData.email,
                newPassword: formData.newPassword,
            });

            alert('Password has been reset successfully! Please log in with your new password.');
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <img src={GameLogo} alt="You're IT! Logo" style={styles.logo} />
                <h2 style={styles.title}>Reset Password</h2>
                
                {error && <p style={styles.errorText}>{error}</p>}

                <form onSubmit={handleResetPassword}>
                    <Input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} required />
                    <Input type="password" name="newPassword" placeholder="Enter New Password" value={formData.newPassword} onChange={handleInputChange} required />
                    <Input type="password" name="confirmPassword" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleInputChange} required />
                    <Button type="submit">Save New Password</Button>
                </form>
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
    title: { color: 'white', marginBottom: '30px' },
    errorText: {
        color: '#dc3545', backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '10px',
        borderRadius: '5px', marginBottom: '15px',
    },
};

export default ForgotPassword;