import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.dashboardBox}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <div style={styles.buttonContainer}>
                    <Button onClick={() => navigate('/admin/levels')}>
                        Level Management
                    </Button>
                    <Button onClick={() => navigate('/admin/users')} style={{ marginTop: '15px' }}>
                        User Management
                    </Button>
                    <Button onClick={() => navigate('/lobby')} style={{ marginTop: '30px', backgroundColor: '#6c757d' }}>
                        Back to Lobby
                    </Button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', boxSizing: 'border-box' },
    dashboardBox: { 
        width: '500px', 
        padding: '40px', 
        backgroundColor: 'rgba(20, 20, 20, 0.9)', 
        border: '1px solid #555', 
        borderRadius: '8px',
        textAlign: 'center'
    },
    title: { 
        textAlign: 'center', 
        color: 'darkorange', 
        marginBottom: '30px' 
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column'
    }
};

export default AdminDashboard;