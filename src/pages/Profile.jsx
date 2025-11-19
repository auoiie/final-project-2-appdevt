import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Redirect if not logged in
                    return;
                }
                const res = await axios.get('https://final-project-2-appdevt.onrender.com/api/users/me', {
                    headers: { 'auth-token': token }
                });
                setUserData(res.data); // Save fetched user data
                setNewUsername(res.data.username);// Initialize edit input
            } catch (err) {
                setError('Could not fetch user data. Your session may have expired.');
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                navigate('/login');
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleSaveUsername = async () => {
        if (newUsername === userData.username) {
            setIsEditing(false); // No changes, close edit mode
            setError('');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('https://final-project-2-appdevt.onrender.com/api/users/update-username', 
                { newUsername },
                { headers: { 'auth-token': token } }
            );
            setUserData(prev => ({ ...prev, username: res.data.user.username }));
            localStorage.setItem('username', res.data.user.username);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update username.');
        }
    };

    
    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };

    if (error && !userData) return <div style={styles.container}><p style={styles.errorText}>{error}</p></div>;
    if (!userData) return <div style={styles.container}><p>Loading...</p></div>;

    return (
        <div style={styles.container}>
            <div style={styles.profileBox}>
                {isEditing ? (
                    <div style={styles.editContainer}>
                        <Input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '1.5em' }}
                            maxLength="10"
                        />
                        {error && <p style={styles.errorText}>{error}</p>}
                        <div style={styles.buttonGroup}>
                            <Button onClick={handleSaveUsername}>Save</Button>
                            <Button onClick={() => { setIsEditing(false); setError(''); }} style={{backgroundColor: '#6c757d'}}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div style={styles.usernameContainer}>
                        <h1 style={styles.username}>{userData.username}</h1>
                        <button onClick={() => setIsEditing(true)} style={styles.editButton} title="Change Username">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.editIcon}>
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                    </div>
                )}

                <div style={styles.statsContainer}>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>{userData.gamesPlayed}</span>
                        <span style={styles.statLabel}>Games Played</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>{userData.gamesWon}</span>
                        <span style={styles.statLabel}>Games Won</span>
                    </div>
                </div>

                {userRole === 'Admin' && (
                    <Button onClick={() => navigate('/admin')} style={{ width: '100%', marginTop: '20px' }}>
                        Admin Dashboard
                    </Button>
                )}

                <div style={styles.buttonGroup}>
                    <Button onClick={() => navigate('/history')} style={{ backgroundColor: '#6c757d' }}>
                        Game History
                    </Button>
                    <Button onClick={() => navigate('/lobby')}>
                        Back to Lobby
                    </Button>
                </div>
                
                <Button onClick={handleLogout} style={{ marginTop: '10px', backgroundColor: '#dc3545' }}>
                    Logout
                </Button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
    profileBox: {
        width: '400px', padding: '40px', borderRadius: '8px', textAlign: 'center',
        backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #555',
    },
    usernameContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px',
    },
    username: { fontSize: '2.5em', color: 'darkorange', margin: 0 },
    editButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
    },
    editIcon: {
        width: '24px',
        height: '24px',
        fill: '#aaa',
        transition: 'fill 0.2s',
    },
    editContainer: { marginBottom: '30px' },
    statsContainer: { display: 'flex', justifyContent: 'space-around', margin: '30px 0' },
    stat: { display: 'flex', flexDirection: 'column' },
    statValue: { fontSize: '2em', fontWeight: 'bold' },
    statLabel: { color: '#aaa' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '20px' },
    errorText: { color: '#dc3545', marginTop: '15px', fontSize: '14px' },
};

export default Profile;