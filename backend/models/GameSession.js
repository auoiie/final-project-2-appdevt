const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    socketId: { type: String, required: true },
    color: { type: String, default: '#FFFFFF' },
    isIt: { type: Boolean, default: false },
    disqualified: { type: Boolean, default: false },
});

const GameSessionSchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true, unique: true },
    host: { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, username: { type: String } },
    players: [PlayerSchema],
    gameStarted: { type: Boolean, default: false },
    gameActive: { type: Boolean, default: false },
    winner: { type: String },
    levelName: { type: String, default: 'Default' }
}, { timestamps: true });

module.exports = mongoose.model('GameSession', GameSessionSchema);