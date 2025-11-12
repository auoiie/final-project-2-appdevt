const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        if (username.length > 10) {
            return res.status(400).json({ message: "Username cannot be longer than 10 characters." });
        }
        
        if (!email.endsWith('@gmail.com')) {
            return res.status(400).json({ message: "Please use a valid @gmail.com address." });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();
        res.status(201).json({ message: "User registered successfully!", userId: user._id });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.header('auth-token', token).json({ 
            message: "Logged in successfully",
            token: token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Please provide an email and a new password." });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User with this email does not exist." });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password has been reset successfully." });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
});

module.exports = router;