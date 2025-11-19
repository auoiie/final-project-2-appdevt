const mongoose = require('mongoose');

// Schema for a single platform in the level
const PlatformSchema = new mongoose.Schema({
    x: { type: Number, required: true },// Main Level schema
    y: { type: Number, required: true }, // Platform Y position
    width: { type: Number, required: true },// Platform width
    height: { type: Number, required: true },// Platform height

});
// Main Level schema
const LevelSchema = new mongoose.Schema({   
    name: { type: String, required: true, unique: true },// Level name (must be unique)
    platforms: [PlatformSchema],
    spawnPoints: [{
        x: { type: Number, required: true },// Array of platforms that make up the level
        y: { type: Number, required: true },// Player spawn X position
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }// Reference to the User who created the level
}, { timestamps: true }); // Automatically adds createdAt & updatedAt

module.exports = mongoose.model('Level', LevelSchema);