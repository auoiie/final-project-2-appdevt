const router = require('express').Router();
const User = require('../models/User');
const GameSession = require('../models/GameSession');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/update-username', auth, async (req, res) => {
    const { newUsername } = req.body;

    if (!newUsername || newUsername.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }
    
    if (newUsername.length > 10) {
        return res.status(400).json({ message: 'Username cannot be longer than 10 characters.' });
    }

    try {
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        const user = await User.findById(req.user._id);
        const oldUsername = user.username;
        user.username = newUsername;
        await user.save();

        await GameSession.updateMany(
            { "players.username": oldUsername },
            { $set: { "players.$[elem].username": newUsername } },
            { arrayFilters: [{ "elem.username": oldUsername }] }
        );

        await GameSession.updateMany(
            { winner: oldUsername },
            { $set: { winner: newUsername } }
        );

        res.json({ message: 'Username updated successfully!', user: { username: newUsername } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;