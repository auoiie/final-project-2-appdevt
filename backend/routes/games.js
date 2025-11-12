const router = require('express').Router();
const auth = require('../middleware/auth');
const GameSession = require('../models/GameSession');
const User = require('../models/User');

router.get('/my-history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const games = await GameSession.find({ 
            'players.username': user.username,
            'winner': { $exists: true }
        }).sort({ createdAt: -1 });

        res.json(games);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;