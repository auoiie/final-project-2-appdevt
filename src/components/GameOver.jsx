import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const GameOver = ({ onPlayAgain, rankedStats = [] }) => {
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('username');

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <h1 style={styles.title}>Game Over</h1>
                
                <div style={styles.statsContainer}>
                    <h3 style={styles.statsTitle}>Ranking</h3>
                    {rankedStats.map(stat => {
                        const isWinner = stat.rank === 1;
                        const isCurrentUser = stat.username === currentUser;
                        return (
                            <div key={stat.username} style={styles.statLine}>
                                <span style={styles.rank(isWinner)}>
                                    {isWinner ? '🎉' : getOrdinal(stat.rank)}
                                </span>
                                <span style={styles.username(isWinner, isCurrentUser)}>
                                    {stat.username}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div style={styles.buttonGroup}>
                    <Button onClick={onPlayAgain}>Play Again</Button>
                    <Button onClick={() => navigate('/lobby')} style={{ backgroundColor: '#6c757d' }}>
                        Back to Lobby
                    </Button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
    },
    container: {
        padding: '30px 40px', borderRadius: '8px', backgroundColor: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid #555', textAlign: 'center', color: 'white', width: '400px',
    },
    title: { fontSize: '3em', marginBottom: '25px', color: 'darkorange' },
    statsContainer: {
        padding: '15px 0', 
        marginBottom: '25px',
    },
    statsTitle: {
        marginBottom: '20px',
        color: 'darkorange',
        fontWeight: 'bold',
        fontSize: '1.5em',
        borderBottom: '1px solid #444',
        paddingBottom: '15px'
    },
    statLine: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        alignItems: 'center',
        padding: '10px',
        textAlign: 'left',
    },
    rank: (isWinner) => ({
        fontWeight: 'bold',
        color: isWinner ? 'darkorange' : '#aaa',
        fontSize: isWinner ? '1.8em' : '1.2em',
    }),
    username: (isWinner, isCurrentUser) => ({
        fontSize: isWinner ? '1.8em' : '1.2em',
        fontWeight: isCurrentUser ? 'bold' : 'normal',
        color: isCurrentUser ? 'white' : '#ccc',
    }),
    buttonGroup: { 
        display: 'flex', 
        gap: '10px' 
    }
};

export default GameOver;