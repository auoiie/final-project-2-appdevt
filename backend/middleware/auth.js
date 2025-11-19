const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
module.exports = function(req, res, next) {
    // Retrieve token from the 'auth-token' header
    const token = req.header('auth-token');
    // If no token is provided, respond with an error message
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
         // Verify the token using the secret key stored in the environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If valid, attach the decoded user data to the request object for further use
        req.user = decoded;
        // Proceed to the next middleware or route handler
        next();
    } catch (e) {
         // If the token is invalid, respond with an error message
        res.status(400).json({ message: 'Token is not valid' });
    }
};