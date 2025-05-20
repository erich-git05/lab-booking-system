const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Attempt:', { email });

    // Validate input
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('[LOGIN] Password mismatch for:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[LOGIN] Success:', email);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('[REGISTER] Attempt:', { username, email, role });

    // Validate input
    if (!username || !email || !password) {
      console.log('[REGISTER] Missing fields:', { username, email, password });
      return res.status(400).json({ 
        success: false,
        error: 'Username, email and password are required' 
      });
    }

    if (password.length < 6) {
      console.log('[REGISTER] Password too short');
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });
    if (existingUser) {
      console.log('[REGISTER] User exists:', { email, username });
      return res.status(409).json({ 
        success: false,
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: role || 'student'  // Default to 'student' if role not specified
    });
    await newUser.save();
    console.log('[REGISTER] User created:', { username, email, role: newUser.role });

    // Generate JWT token for automatic login after registration
    const token = jwt.sign(
      { 
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

module.exports = router;