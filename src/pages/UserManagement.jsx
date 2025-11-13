import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:3001/api/users', { headers: { 'auth-token': token } });
            setUsers(res.data);
        } catch (err) { setError('Could not fetch users.'); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3001/api/users/${userId}`, { headers: { 'auth-token': token } });
            setSuccess('User deleted successfully!');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.managementBox}>
                <h1 style={styles.title}>User Management</h1>
                {error && <p style={styles.errorText}>{error}</p>}
                {success && <p style={styles.successText}>{success}</p>}
                <div style={styles.userList}>
                    {users.length > 0 ? users.map(user => (
                        <div key={user._id} style={styles.userItem}>
                            <div style={styles.userInfo}>
                                <span style={styles.username(user.role)}>{user.username}</span>
                                <span style={styles.email}>{user.email}</span>
                            </div>
                            <div style={styles.userStats}>
                                <span><b>Wins:</b> {user.gamesWon}</span>
                                <span><b>Played:</b> {user.gamesPlayed}</span>
                            </div>
                            <Button onClick={() => handleDeleteUser(user._id)} style={styles.deleteButton} disabled={user.role === 'Admin'}>
                                Delete
                            </Button>
                        </div>
                    )) : <p>No users found.</p>}
                </div>
                <Button onClick={() => navigate('/admin')} style={{ marginTop: '20px', backgroundColor: '#6c757d', flexShrink: 0 }}>
                    Back to Admin Dashboard
                </Button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', boxSizing: 'border-box' },
    managementBox: { 
        width: '800px', 
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px', 
        backgroundColor: 'rgba(20, 20, 20, 0.9)', 
        border: '1px solid #555', 
        borderRadius: '8px'
    },
    title: { textAlign: 'center', color: 'darkorange', marginBottom: '20px', flexShrink: 0 },
    userList: { 
        flex: '1 1 auto',
        overflowY: 'auto', 
        border: '1px solid #444', 
        borderRadius: '5px', 
        padding: '10px'
    },
    userItem: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 10px', 
        borderBottom: '1px solid #444' 
    },
    userInfo: { display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 2 },
    username: (role) => ({ fontWeight: 'bold', fontSize: '1.1em', color: role === 'Admin' ? 'darkorange' : 'white' }),
    email: { fontSize: '0.9em', color: '#aaa' },
    userStats: {
        display: 'flex',
        gap: '20px',
        flex: 1,
    },
    deleteButton: { width: 'auto', padding: '8px 20px', fontSize: '14px', backgroundColor: '#dc3545' },
    errorText: { color: '#dc3545', backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '10px', borderRadius: '5px', textAlign: 'center' },
    successText: { color: '#28a745', backgroundColor: 'rgba(0, 255, 0, 0.1)', padding: '10px', borderRadius: '5px', textAlign: 'center' },
};

export default UserManagement;