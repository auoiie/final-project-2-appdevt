const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        const user = await User.findOne({ _id: req.user._id });

        if (user.role !== 'Admin') {
            return res.status(403).json({ message: 'Admin resources access denied.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};