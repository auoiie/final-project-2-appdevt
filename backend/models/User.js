const mongoose = require('mongoose');

// Define schema for the User document
const UserSchema = new mongoose.Schema({
  // Username field: must be a unique, required string
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no two users can have the same username
  },
  // Email field: must be a unique, required string
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no two users can have the same email address
  },
// Password field: required for authentication
  password: {
    type: String,
    required: true,
  },
  // Role field: defines user role, defaults to 'Player' if not specified
  role: {
    type: String,
    enum: ['Player', 'Admin'], // User can either be a 'Player' or an 'Admin'
    default: 'Player' // Default value for new users
  },
   // Track the number of games the user has played
  gamesPlayed: {
    type: Number,
    default: 0, // Defaults to 0 if not specified
  },
   // Track the number of games the user has won
  gamesWon: {
    type: Number,
    default: 0, // Defaults to 0 if not specified
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields
// Export the User model based on the schema
module.exports = mongoose.model('User', UserSchema);