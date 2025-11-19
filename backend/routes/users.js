const router = require('express').Router(); // Import express router
const User = require('../models/User'); // Import User model
const GameSession = require('../models/GameSession'); // Import GameSession model
const auth = require('../middleware/auth'); // Import authentication middleware
const admin = require('../middleware/admin'); // Import admin middleware

// Get current logged-in user's profile (excluding password)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Exclude password from user data
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get list of all users (admin only), excluding passwords
router.get('/', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update current user's username
router.put('/update-username', auth, async (req, res) => {
    const { newUsername } = req.body;
// Validate new username length
    if (!newUsername || newUsername.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }
    
    if (newUsername.length > 10) {
        return res.status(400).json({ message: 'Username cannot be longer than 10 characters.' });
    }

    try {
        // Check if the new username already exists
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        const user = await User.findById(req.user._id); // Find the user by ID
        const oldUsername = user.username; // Save old username for updates
        user.username = newUsername; // Save changes
        await user.save();

    // Update username in all GameSessions where user played
        await GameSession.updateMany(
            { "players.username": oldUsername },
            { $set: { "players.$[elem].username": newUsername } },
            { arrayFilters: [{ "elem.username": oldUsername }] }
        );

        // Update winner username in GameSessions
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

// Delete a user by ID (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router; // Export the router
