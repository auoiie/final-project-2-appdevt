const router = require('express').Router();// Import express router
const auth = require('../middleware/auth');// Import authentication middleware
const admin = require('../middleware/admin');// Import admin middleware
const Level = require('../models/Level');// Import Level model

// Create a new level (admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { name, platforms, spawnPoints } = req.body;
        const newLevel = new Level({ name, platforms, spawnPoints, createdBy: req.user._id });
        const level = await newLevel.save();
        res.status(201).json(level);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Get all levels
router.get('/', auth, async (req, res) => {
    try {
        const levels = await Level.find().sort({ name: 1 });
        res.json(levels);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Get a specific level by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ message: 'Level not found' });
        res.json(level);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Update a level by ID (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { name, platforms, spawnPoints } = req.body;
        const updatedLevel = await Level.findByIdAndUpdate(
            req.params.id,
            { $set: { name, platforms, spawnPoints } },
            { new: true }
        );
        if (!updatedLevel) return res.status(404).json({ message: 'Level not found' });
        res.json(updatedLevel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Delete a level by ID (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const level = await Level.findByIdAndDelete(req.params.id);
        if (!level) return res.status(404).json({ message: 'Level not found' });
        res.json({ message: 'Level removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;// Export the router