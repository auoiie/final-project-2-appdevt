import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;

const LevelPreview = ({ platforms, spawnPoints }) => (
    <div style={styles.previewContainer}>
        <div style={styles.previewCanvas}>
            {platforms.map((p, index) => (
                <div key={`platform-${index}`} style={{
                    ...styles.previewPlatform,
                    left: `${(p.x / CANVAS_WIDTH) * 100}%`,
                    top: `${(p.y / CANVAS_HEIGHT) * 100}%`,
                    width: `${(p.width / CANVAS_WIDTH) * 100}%`,
                    height: `${(p.height / CANVAS_HEIGHT) * 100}%`,
                }} />
            ))}
            {spawnPoints.map((s, index) => (
                <div key={`spawn-${index}`} style={{
                    ...styles.previewSpawn,
                    left: `${(s.x / CANVAS_WIDTH) * 100}%`,
                    top: `${(s.y / CANVAS_HEIGHT) * 100}%`,
                }} />
            ))}
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editingLevelId, setEditingLevelId] = useState(null);
    const [levelName, setLevelName] = useState('');
    const [platforms, setPlatforms] = useState([]);
    const [spawnPoints, setSpawnPoints] = useState([]);

    const fetchLevels = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:3001/api/levels', { headers: { 'auth-token': token } });
            setLevels(res.data);
        } catch (err) { setError('Could not fetch levels.'); }
    };

    useEffect(() => { fetchLevels(); }, []);

    const resetForm = () => {
        setEditingLevelId(null);
        setLevelName('');
        setPlatforms([]);
        setSpawnPoints([]);
        setError('');
        setSuccess('');
    };
    
    const handleEditClick = async (levelId) => {
        resetForm();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`http://localhost:3001/api/levels/${levelId}`, { headers: { 'auth-token': token } });
            const { name, platforms, spawnPoints } = res.data;
            setEditingLevelId(levelId);
            setLevelName(name);
            setPlatforms(platforms || []);
            setSpawnPoints(spawnPoints || []);
        } catch (err) { setError('Failed to load level data.'); }
    };

    const addPlatform = () => setPlatforms([...platforms, { x: 0, y: 0, width: 100, height: 20 }]);
    const handlePlatformChange = (index, field, value) => {
        const updated = [...platforms];
        updated[index][field] = Number(value);
        setPlatforms(updated);
    };
    const removePlatform = (index) => setPlatforms(platforms.filter((_, i) => i !== index));

    const addSpawnPoint = () => setSpawnPoints([...spawnPoints, { x: 100, y: 100 }]);
    const handleSpawnPointChange = (index, field, value) => {
        const updated = [...spawnPoints];
        updated[index][field] = Number(value);
        setSpawnPoints(updated);
    };
    const removeSpawnPoint = (index) => setSpawnPoints(spawnPoints.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        const levelData = { name: levelName, platforms, spawnPoints };

        try {
            if (editingLevelId) {
                await axios.put(`http://localhost:3001/api/levels/${editingLevelId}`, levelData, { headers: { 'auth-token': token } });
                setSuccess(`Level "${levelName}" updated successfully!`);
            } else {
                await axios.post('http://localhost:3001/api/levels', levelData, { headers: { 'auth-token': token } });
                setSuccess(`Level "${levelName}" created successfully!`);
            }
            resetForm();
            fetchLevels();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save level.');
        }
    };

    const handleDeleteLevel = async (levelId) => {
        if (!window.confirm('Are you sure you want to delete this level?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3001/api/levels/${levelId}`, { headers: { 'auth-token': token } });
            setSuccess('Level deleted successfully!');
            fetchLevels();
        } catch (err) { setError(err.response?.data?.message || 'Failed to delete level.'); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.dashboardBox}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <div style={styles.mainContent}>
                    <div style={styles.editorPanel}>
                        <h2 style={styles.subtitle}>{editingLevelId ? 'Edit Level' : 'Create New Level'}</h2>
                        {error && <p style={styles.errorText}>{error}</p>}
                        {success && <p style={styles.successText}>{success}</p>}
                        <form onSubmit={handleSubmit}>
                            <Input type="text" placeholder="Level Name" value={levelName} onChange={(e) => setLevelName(e.target.value)} required />
                            <div style={styles.editorSection}>
                                <h3>Platforms</h3>
                                {platforms.map((p, index) => (
                                    <div key={index} style={styles.itemRow}>
                                        <Input style={styles.coordInput} type="number" value={p.x} onChange={(e) => handlePlatformChange(index, 'x', e.target.value)} placeholder="X" />
                                        <Input style={styles.coordInput} type="number" value={p.y} onChange={(e) => handlePlatformChange(index, 'y', e.target.value)} placeholder="Y" />
                                        <Input style={styles.coordInput} type="number" value={p.width} onChange={(e) => handlePlatformChange(index, 'width', e.target.value)} placeholder="W" />
                                        <Input style={styles.coordInput} type="number" value={p.height} onChange={(e) => handlePlatformChange(index, 'height', e.target.value)} placeholder="H" />
                                        <Button type="button" onClick={() => removePlatform(index)} style={styles.removeButton}>X</Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={addPlatform} style={styles.addButton}>Add Platform</Button>
                            </div>
                            <div style={styles.editorSection}>
                                <h3>Spawn Points</h3>
                                {spawnPoints.map((s, index) => (
                                    <div key={index} style={styles.itemRow}>
                                        <Input style={styles.coordInput} type="number" value={s.x} onChange={(e) => handleSpawnPointChange(index, 'x', e.target.value)} placeholder="X" />
                                        <Input style={styles.coordInput} type="number" value={s.y} onChange={(e) => handleSpawnPointChange(index, 'y', e.target.value)} placeholder="Y" />
                                        <Button type="button" onClick={() => removeSpawnPoint(index)} style={styles.removeButton}>X</Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={addSpawnPoint} style={styles.addButton}>Add Spawn Point</Button>
                            </div>
                            <Button type="submit" style={{ marginTop: '20px' }}>{editingLevelId ? 'Save Changes' : 'Create Level'}</Button>
                            {editingLevelId && <Button type="button" onClick={resetForm} style={{ marginTop: '10px', backgroundColor: '#6c757d' }}>Cancel Edit</Button>}
                        </form>
                    </div>
                    <div style={styles.rightPanel}>
                        <LevelPreview platforms={platforms} spawnPoints={spawnPoints} />
                        <div style={styles.section}>
                            <h2 style={styles.subtitle}>Existing Levels</h2>
                            <div style={styles.levelList}>
                                {levels.length > 0 ? levels.map(level => (
                                    <div key={level._id} style={styles.levelItem}>
                                        <span>{level.name}</span>
                                        <div>
                                            <Button onClick={() => handleEditClick(level._id)} style={styles.editButton}>Edit</Button>
                                            <Button onClick={() => handleDeleteLevel(level._id)} style={styles.deleteButton}>Delete</Button>
                                        </div>
                                    </div>
                                )) : <p>No levels found.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <Button onClick={() => navigate('/lobby')} style={{ marginTop: '20px', backgroundColor: '#555' }}>Back to Lobby</Button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' },
    dashboardBox: { width: '95%', maxWidth: '1400px', height: '90vh', display: 'flex', flexDirection: 'column', padding: '30px', backgroundColor: 'rgba(20, 20, 20, 0.9)', border: '1px solid #555', borderRadius: '8px' },
    title: { textAlign: 'center', color: 'darkorange', marginBottom: '20px', flexShrink: 0 },
    mainContent: { display: 'flex', gap: '30px', flexGrow: 1, overflow: 'hidden' },
    editorPanel: { flex: 2, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '15px' },
    rightPanel: { flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' },
    subtitle: { borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '20px' },
    section: { flexShrink: 0 },
    editorSection: { border: '1px solid #444', borderRadius: '5px', padding: '15px', margin: '20px 0' },
    itemRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    coordInput: { width: '100%', margin: 0 },
    addButton: { width: '100%', backgroundColor: '#0062cc' },
    removeButton: { width: 'auto', padding: '10px 15px', backgroundColor: '#dc3545', margin: 0 },
    levelList: { maxHeight: '200px', overflowY: 'auto', border: '1px solid #444', borderRadius: '5px', padding: '10px' },
    levelItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #444' },
    editButton: { width: 'auto', padding: '5px 15px', fontSize: '14px', backgroundColor: '#17a2b8', marginRight: '10px' },
    deleteButton: { width: 'auto', padding: '5px 15px', fontSize: '14px', backgroundColor: '#dc3545' },
    errorText: { color: '#dc3545', backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: '10px', borderRadius: '5px', textAlign: 'center' },
    successText: { color: '#28a745', backgroundColor: 'rgba(0, 255, 0, 0.1)', padding: '10px', borderRadius: '5px', textAlign: 'center' },
    previewContainer: { flexGrow: 1, backgroundColor: '#000', border: '1px solid #555', borderRadius: '8px', padding: '10px' },
    previewCanvas: { position: 'relative', width: '100%', height: '100%', backgroundColor: 'rgba(70, 40, 10, 0.8)' },
    previewPlatform: { position: 'absolute', backgroundColor: 'darkorange', borderRadius: '2px' },
    previewSpawn: { position: 'absolute', width: '10px', height: '10px', backgroundColor: 'cyan', borderRadius: '50%', transform: 'translate(-50%, -50%)' },
};

export default AdminDashboard;