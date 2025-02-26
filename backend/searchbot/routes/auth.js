const express = require('express');
const router = express.Router();
const { serverLogger: logger } = require('../config/logger');
const { initializeScraper, deleteCookies } = require('../twitterLogin');
const { ACCOUNT_GROUPS } = require('../config/accountGroups');
const User = require('../models/user');

// Authentication middleware
const checkAuth = (req, res, next) => {
    if (!req.session.twitterUsername) {
        return res.status(401).json({ error: 'Please login first' });
    }
    next();
};

// Twitter login route
router.post('/login', async (req, res) => {
    try {
        let { username, password, email, twoFactorSecret } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // If username contains @, use it as email if no email provided
        const userEmail = email || (username.includes('@') ? username : '');

        // twoFactorSecret = '7DLHNJYZGETAXQGU'
        // Create account object
        const account = {
            username,
            password,
            email: userEmail,
            twoFactorSecret:twoFactorSecret
        };
        // console.log('account:', account);
        // Attempt Twitter login
        const scraper = await initializeScraper(account);
        
        if (scraper) {
            // Get cookies
            const cookies = await scraper.getCookies();
            
            // Update or create user info
            await User.findOneAndUpdate(
                { twitterUsername: username },
                {
                    twitterUsername: username,
                    password: password,         // Save password
                    email: userEmail,  // Use the processed email value
                    twoFactorSecret: twoFactorSecret || '', // Save 2FA key
                    lastLoginAt: new Date(),
                    cookies: JSON.stringify(cookies),
                    status: 'active'
                },
                { upsert: true, new: true }
            );

            // Login successful, set session
            req.session.twitterUsername = username;
            
            res.json({
                message: 'Login successful',
                user: { 
                    username,
                    email: userEmail 
                }
            });
        } else {
            // Return specific error message
            const error = scraper === null ? 'Login failed' : scraper.error;
            res.status(401).json({ error: error.message || error });
        }

    } catch (error) {
        logger.error('Login failed:', error);
        // Return more detailed error message
        res.status(500).json({ error: error.message || 'Login failed' });
    }
});

// Get current user info
router.get('/me', checkAuth, async (req, res) => {
    try {
        const user = await User.findOne(
            { twitterUsername: req.session.twitterUsername },
            { cookies: 0 } // Exclude cookies field
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        logger.error('Failed to get user info:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Update user status on logout
router.post('/logout', async (req, res) => {
    try {
        if (req.session.twitterUsername) {
            // Update user status
            await User.findOneAndUpdate(
                { twitterUsername: req.session.twitterUsername },
                { status: 'inactive' }
            );
            
            // Delete Twitter cookies file
            await deleteCookies(req.session.twitterUsername);
        }

        req.session.destroy(err => {
            if (err) {
                logger.error('Logout failed:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.json({ message: 'Logout successful' });
        });
    } catch (error) {
        logger.error('Logout failed:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

module.exports = {
    router,
    checkAuth
}; 