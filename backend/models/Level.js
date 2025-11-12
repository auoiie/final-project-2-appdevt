const mongoose = require('mongoose');

const PlatformSchema = new mongoose.Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
});

const LevelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    platforms: [PlatformSchema],
    spawnPoints: [{
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Level', LevelSchema);