const { Scraper } = require('agent-twitter-client');
const fs = require('fs');
const path = require('path');
const { Cookie } = require('tough-cookie');
const REDIS_KEYS = require('./config/redisKeys');
const redis = require('./config/redis');
const User = require('./models/user');

// Read and parse cookies
async function loadCookies(accountUsername) {
    try {
        const key = `${REDIS_KEYS.TWITTER_COOKIES}${accountUsername}`;
        console.log(`Attempting to read cookies for ${accountUsername} from Redis...`);
        const cookiesData = await redis.get(key);
        
        if (cookiesData) {
            console.log(`Successfully read cookies for ${accountUsername} from Redis, data length: ${cookiesData.length}`);
            const cookiesArray = JSON.parse(cookiesData);
            // console.log(`Parsed cookies array length: ${cookiesArray.length}`);
            const parsedCookies = cookiesArray.map(cookieData => Cookie.fromJSON(cookieData));
            // console.log(`Number of Cookie objects after conversion: ${parsedCookies.length}`);
            return parsedCookies;
        }
        
        console.log(`No cookies found for ${accountUsername}`);
    } catch (error) {
        console.error(`Failed to read cookies for ${accountUsername}:`, error);
        console.error('Detailed error:', error.stack);
    }
    return null;
}

// Save cookies
async function saveCookies(accountUsername, cookies) {
    try {
        const key = `${REDIS_KEYS.TWITTER_COOKIES}${accountUsername}`;
        console.log(`Starting to save cookies for ${accountUsername} to Redis...`);
        await redis.set(key, JSON.stringify(cookies));
        
        // Set expiration time to 7 days
        await redis.expire(key, 7 * 24 * 60 * 60);
        
        console.log(`Successfully saved cookies for ${accountUsername} to Redis with a validity of 7 days`);
    } catch (error) {
        console.error(`Failed to save cookies for ${accountUsername}:`, error);
    }
}

// Login and save cookies
async function loginAndSaveCookies(scraper, account) {
    await scraper.login(account.username, account.password, account.email, account.twoFactorSecret);
    const newCookies = await scraper.getCookies();
    console.log(`Retrieved ${newCookies.length} new cookies`);
    console.log(`Cookie example:`, newCookies[0]); // Only print the first cookie as an example
    await saveCookies(account.username, newCookies);
}

// Initialize a single Twitter Scraper
async function initializeScraper(account) {
    try {
        const username = typeof account === 'string' ? account : account.username;
        console.log(`Initializing scraper for account ${username}...`);

        const scraper = new Scraper();
        const savedCookies = await loadCookies(username);
        
        // Try using saved cookies first
        if (savedCookies?.length) {
            console.log(`Found saved cookies for ${username}, count: ${savedCookies.length}, attempting to use them...`);
            await scraper.setCookies(savedCookies);
            
            const isLoggedIn = await scraper.isLoggedIn();
            console.log(`Checking login status: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
            
            if (isLoggedIn) {
                console.log(`Account ${username} successfully logged in using saved cookies`);
                return scraper;
            }
            console.log(`Cookies for account ${username} are invalid, attempting to log in again...`);
        } else {
            console.log(`No saved cookies found for account ${username}`);
        }

        // If cookies do not exist or are invalid, fetch account information from the database
        console.log(`Attempting to fetch login information for account ${username} from the database...`);
        let fullAccount = account;
        
        if (typeof account === 'string' || (account && account.username && !account.password)) {
            const userDoc = await User.findOne({ twitterUsername: username });
            if (!userDoc) {
                throw new Error(`No information for account ${username} found in the database`);
            }
            
            fullAccount = {
                username: userDoc.twitterUsername,
                password: userDoc.password,
                email: userDoc.email,
                twoFactorSecret: userDoc.twoFactorSecret
            };
            console.log(`Successfully fetched complete information for account ${username} from the database`);
        }

        console.log('fullAccount:', fullAccount);
        // Login using complete account information
        await loginAndSaveCookies(scraper, fullAccount);
        console.log(`Account ${username} logged in successfully`);
        return scraper;
        
    } catch (error) {
        const username = typeof account === 'string' ? account : account.username;
        console.error(`Failed to initialize account ${username}:`, error);
        console.error('Detailed error:', error.stack);
        throw error;
    }
}

// Initialize all scrapers
async function initializeScrapers(accounts) {
    const scrapers = [];
    for (const account of accounts) {
        const scraper = await initializeScraper(account);
        if (scraper) scrapers.push(scraper);
    }
    return scrapers;
}

// Distribute tasks among different scrapers
async function distributeWork(users, scrapers) {
    const chunks = [];
    const chunkSize = Math.ceil(users.length / scrapers.length);
    
    for (let i = 0; i < scrapers.length; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        chunks.push(users.slice(start, end));
    }
    
    return chunks;
}

// Get available accounts
async function getAvailableAccounts(accounts) {
    const availableAccounts = [];
    
    for (const account of accounts) {
        const searchCountKey = `${REDIS_KEYS.ACCOUNT_SEARCH_COUNT}${account.username}`;
        const cooldownKey = `${REDIS_KEYS.ACCOUNT_COOLDOWN}${account.username}`;
        
        // Check if the account is in cooldown
        console.log(`Checking cooldown status for account ${account.username}...`);
        const isInCooldown = await redis.exists(cooldownKey);
        if (isInCooldown) {
            console.log(`Account ${account.username} is in cooldown, skipping`);
            continue;
        }
        
        // Check search count
        console.log(`Checking search count for account ${account.username}...`);
        const searchCount = await redis.get(searchCountKey) || 0;
        console.log(`Account ${account.username} current search count: ${searchCount}`);
        
        // if (searchCount >= 100) {
        //     console.log(`Account ${account.username} reached the search limit (100), setting cooldown period`);
        //     await redis.setex(cooldownKey, 24 * 60 * 60, '1'); // Set 24-hour cooldown
        //     await redis.del(searchCountKey); // Reset count
        //     console.log(`Account ${account.username} is now under a 24-hour cooldown`);
        //     continue;
        // }
        
        availableAccounts.push(account);
    }
    
    console.log(`Total available accounts: ${availableAccounts.length}`);
    return availableAccounts;
}

// Increase account search count
async function incrementSearchCount(username) {
    const key = `${REDIS_KEYS.ACCOUNT_SEARCH_COUNT}${username}`;
    const newCount = await redis.incr(key);
    console.log(`Search count for account ${username} increased to: ${newCount}`);
    
    // Set expiration to 24 hours to avoid residual count
    await redis.expire(key, 24 * 60 * 60);
    console.log(`Search count for account ${username} will expire after 24 hours`);
}

// Delete cookies
async function deleteCookies(accountUsername) {
    try {
        const key = `${REDIS_KEYS.TWITTER_COOKIES}${accountUsername}`;
        const result = await redis.del(key);
        
        // Also delete the file (if exists)
        // const cookiesPath = path.join(__dirname, 'data', `twitter_cookies_${accountUsername}.json`);
        // if (fs.existsSync(cookiesPath)) {
        //     await fs.promises.unlink(cookiesPath);
        // }
        
        console.log(`Successfully deleted cookies for ${accountUsername}`);
        return result > 0;
    } catch (error) {
        console.error(`Failed to delete cookies for ${accountUsername}:`, error);
        return false;
    }
}

module.exports = {
    initializeScraper,
    initializeScrapers,
    loadCookies,
    saveCookies,
    loginAndSaveCookies,
    distributeWork,
    getAvailableAccounts,
    incrementSearchCount,
    deleteCookies,
}; 
