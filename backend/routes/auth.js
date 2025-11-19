const router = require('express').Router(); // Importing the express router
const User = require('../models/User'); // Importing the User model to interact with the database
const bcrypt = require('bcryptjs'); // Importing bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Importing jsonwebtoken for creating tokens

// Register route to create a new user
router.post('/register', async (req, res) => {
    try {
         // Destructure username, email, and password from the request body
        const { username, email, password } = req.body;

        // Check if any required field is missing
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        // Check if the username exceeds 10 characters
        if (username.length > 10) {
            return res.status(400).json({ message: "Username cannot be longer than 10 characters." });
        }
        
         // Validate email domain
        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: "Please use a valid @gmail.com address." });
        }

         // Check if the email already exists in the database
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Check if the username already exists in the database
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already exists" });
        }
        // Hash the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

          // Create a new user object
        const newUser = new User({
            username,
            email,
            password: hashedPassword, // Store the hashed password
        });
         // Save the new user to the database
        const user = await newUser.save();
        // Respond with success message and the user's ID
        res.status(201).json({ message: "User registered successfully!", userId: user._id });

    } catch (err) {
        // Catch any errors and respond with a 500 status code
        res.status(500).json({ message: "Server error", error: err });
    }
});

// Login route to authenticate a user
router.post('/login', async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Compare the provided password with the stored hashed password
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: "Invalid credentials" }); // Incorrect password
        }
    // Create a JWT token with the user's ID, username, and role (expires in 1 hour)
        const token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Send the token and user info in the response
        res.header('auth-token', token).json({ 
            message: "Logged in successfully",
            token: token, // Send the token back to the client
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        // Catch any errors and respond with a 500 status code
        res.status(500).json({ message: "Server error", error: err });
    }
});

// Password reset route to update a user's password
router.post('/reset-password', async (req, res) => {
    try {
    // Destructure email and newPassword from the request body
      const { email, newPassword } = req.body;
   // Check if email and newPassword are provided
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Please provide an email and a new password." });
      }
  // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User with this email does not exist." });
      }
  // Hash the new password before saving i
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  // Update the user's password in the database
      user.password = hashedPassword;
      await user.save();
  // Respond with success message
      res.status(200).json({ message: "Password has been reset successfully." });
  
    } catch (err) {
        // Catch any errors and respond with a 500 status code
      res.status(500).json({ message: "Server error", error: err });
    }
});
// Export the router to be used in other parts of the application
module.exports = router;