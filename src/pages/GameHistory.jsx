import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const GameHistory = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const username = localStorage.getItem('username');

    useEffect(() => {
        const fetchGameHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3001/api/games/my-history', {
                    headers: { 'auth-token': token }
                });
                setGames(res.data);
            } catch (err) {
                setError('Could not fetch game history. Your session may have expired.');
            } finally {
                setLoading(false);
            }
        };
        fetchGameHistory();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div style={styles.container}>
            <div style={styles.historyBox}>
                <h1 style={styles.title}>Game History</h1>
                {loading && <p>Loading...</p>}
                {error && <p style={styles.errorText}>{error}</p>}
                {!loading && !error && (
                    <div style={styles.listContainer}>
                        {games.length === 0 ? (
                            <p>No completed games found.</p>
                        ) : (
                            games.map(game => (
                                <div key={game._id} style={styles.gameItem}>
                                    <div style={styles.gameHeader}>
                                        <span style={styles.lobbyCode}>Lobby: {game.lobbyCode}</span>
                                        <span style={styles.date}>{formatDate(game.createdAt)}</span>
                                    </div>
                                    <p style={styles.players}>
                                        Players: {game.players.map(p => p.username).join(', ')}
                                    </p>
                                    <p style={styles.winner(game.winner === username)}>
                                        Winner: {game.winner}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
                <Button onClick={() => navigate('/profile')} style={{ marginTop: '20px', flexShrink: 0 }}>
                    Back to Profile
                </Button>
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
        padding: '20px',
        boxSizing: 'border-box',
    },
    historyBox: {
        width: '600px', 
        height: '100%', 
        maxHeight: '700px',
        display: 'flex', 
        flexDirection: 'column',
        padding: '30px 40px', 
        borderRadius: '8px',
        backgroundColor: 'rgba(20, 20, 20, 0.9)', 
        border: '1px solid #555',
        boxSizing: 'border-box',
    },
    title: { 
        color: 'darkorange', 
        textAlign: 'center', 
        marginBottom: '20px', 
        flexShrink: 0 
    },
    listContainer: { 
        overflowY: 'auto', 
        flexGrow: 1, 
        paddingRight: '15px' 
    },
    gameItem: { 
        borderBottom: '1px solid #444', 
        padding: '15px 5px', 
        marginBottom: '10px' 
    },
    gameHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '10px' 
    },
    lobbyCode: { 
        fontWeight: 'bold', 
        fontSize: '1.1em' 
    },
    date: { 
        fontSize: '0.9em', 
        color: '#aaa' 
    },
    players: { 
        margin: '5px 0' 
    },
    winner: (isWinner) => ({
        margin: '5px 0',
        fontWeight: 'bold',
        color: isWinner ? '#28a745' : '#dc3545',
    }),
    errorText: { 
        color: '#dc3545', 
        textAlign: 'center' 
    },
};

export default GameHistory;