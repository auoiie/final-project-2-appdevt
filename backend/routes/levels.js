const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Level = require('../models/Level');

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

router.get('/', auth, async (req, res) => {
    try {
        const levels = await Level.find().sort({ name: 1 });
        res.json(levels);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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

module.exports = router;