const mongoose = require('mongoose');

// Define schema for individual player in a game session
const PlayerSchema = new mongoose.Schema({
    // User reference, linking player to a User document
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Username of the player
    username: { type: String, required: true },
      // Socket ID for real-time communication
    socketId: { type: String, required: true },
    // Player's color, default to white if not provided
    color: { type: String, default: '#FFFFFF' },
      // Boolean indicating if the player is "it" (for certain games)
    isIt: { type: Boolean, default: false },
     // Boolean indicating if the player is disqualified
    disqualified: { type: Boolean, default: false },
});
// Define schema for a game session
const GameSessionSchema = new mongoose.Schema({
    // Unique code for the game lobby
    lobbyCode: { type: String, required: true, unique: true },
    // Host's information, including userId and username
    host: { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, username: { type: String } },
    players: [PlayerSchema], // Array of players participating in the game session
    gameStarted: { type: Boolean, default: false }, // Array of players participating in the game session
    gameActive: { type: Boolean, default: false }, // Boolean flag indicating if the game is currently active
    winner: { type: String },    // The username of the winning player (if the game has ended)
    levelName: { type: String, default: 'Default' }     // Name of the current game level
}, { timestamps: true });

module.exports = mongoose.model('GameSession', GameSessionSchema); // Export the GameSession model based on the schema