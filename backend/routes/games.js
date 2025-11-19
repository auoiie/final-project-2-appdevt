const router = require('express').Router();// Import express router
const auth = require('../middleware/auth');// Import authentication middleware
const GameSession = require('../models/GameSession');// Import GameSession model
const User = require('../models/User'); // Import User model

// Route to get the user's game history
router.get('/my-history', auth, async (req, res) => {
      // Find the user by ID from the JWT token
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
// Find game sessions where the user played and a winner is defined
        const games = await GameSession.find({ 
            'players.username': user.username,
            'winner': { $exists: true }
        }).sort({ createdAt: -1 });// Sort by creation date (most recent first)
 // Send the list of games in response
        res.json(games);
    } catch (err) {
        // Handle any server errors
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;// Export the router