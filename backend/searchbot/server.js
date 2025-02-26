const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const redis = require('./config/redis');

const fs = require('fs');
const { TwitterSearchService, TwitterAccountPool } = require('./twitterSearchService');
const tokenInfoService = require('./tokenInfoService');
const { serverLogger: logger } = require('./config/logger');
const { SYSTEM_CONFIG, TWITTER_CONFIG } = require('./config/constants');
const { router: authRouter, checkAuth } = require('./routes/auth');
const REDIS_KEYS = require('./config/redisKeys');

// SSL configuration
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || './ssl/privkey.pem';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || './ssl/fullchain.pem';

const sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
};

// CORS configuration
const CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://192.168.1.3:5173',

    'https://aiphago.com',
    'http://aiphago.com',
];

const corsOptions = {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
};

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/searchbot';

class SearchServer {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.connectToMongoDB();
    }

    async connectToMongoDB() {
        try {
            await mongoose.connect(MONGODB_URI);
            logger.info('Connected to MongoDB');
        } catch (error) {
            logger.error('MongoDB connection failed:', error);
            throw error;
        }
    }

    setupMiddleware() {
        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        
        // Add session middleware
        this.app.use(session({
            secret: process.env.SESSION_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({ 
                mongoUrl: MONGODB_URI,
                ttl: 24 * 60 * 60 // session valid for one day
            }),
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }
        }));
    }

    setupRoutes() {
        // Use authentication router
        this.app.use('/api/auth', authRouter);

        // For routes that require authentication
        this.app.get('/api/token/info/:address', async (req, res) => {
            try {
                const { address } = req.params;
                // const useCache = req.query.useCache !== 'false'; // Default to use cache
                const tokenInfo = await tokenInfoService(address, true);
                res.json(tokenInfo);
            } catch (error) {
                logger.error('Failed to get token info:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/twitter/search/stream',  async (req, res) => {
            try {
                // Increment request count
                await redis.incr(`${REDIS_KEYS.API_COUNTER}twitter_search`);
                const loggedInUsername = req.session.twitterUsername;
                const { username, address } = req.query;
                const forceUpdate = TWITTER_CONFIG.SEARCH.FORCE_UPDATE;  // Set to true for testing

                console.log('address:', address);
                // Set response headers
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                let searchUsername = username;
                let tokenInfo = null;
                let contractData = null;

                // Step 1: Retrieve token information and search for contract-related tweets
                try {
                    tokenInfo = await tokenInfoService(address, false);
                    res.write(`event: tokenInfo\ndata: ${JSON.stringify({ tokenInfo })}\n\n`);

                    // Pass logged-in username to the search method
                    contractData = await this.searchService.searchContractData(address, forceUpdate, loggedInUsername);

                    // Use the new extraction function
                    const extractedUsername = this.extractTwitterUsername(tokenInfo.twitterLink);
                    if (extractedUsername) {
                        searchUsername = extractedUsername;
                    }
                } catch (error) {
                    logger.error('First step search failed:', error);
                    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
                    res.end();
                    return;
                }

                // Send contract/user search results
                res.write(`event: contractDataComplete\ndata: ${JSON.stringify({
                    ...contractData,
                    tokenInfo
                })}\n\n`);
                
                // Step 2: Search for user information and tweets
                let userData = null;
                try {
                    // Check if it is a complete tweet URL
                    const tweetUrlMatch = searchUsername?.match(/x\.com\/([^\/]+)\/status\/(\d+)/);
                    if (tweetUrlMatch) {
                        const [_, extractedUsername, tweetId] = tweetUrlMatch;
                        // Pass logged-in username to the method for retrieving a single tweet
                        userData = await this.searchService.getSingleTweetData(tweetId, loggedInUsername);
                    } else {
                        console.log('searchUsername:', searchUsername);
                        // Pass logged-in username to the user data search method
                        userData = await this.searchService.searchUserData(searchUsername, forceUpdate, loggedInUsername);
                    }
                } catch (error) {
                    logger.error('User data search failed:', error);
                    res.write(`event: error\ndata: ${JSON.stringify({ error: 'User data search failed: ' + error.message })}\n\n`);
                    userData = { userInfo: null, tweets: null };
                }

                res.write(`event: userDataComplete\ndata: ${JSON.stringify({
                    ...userData,
                    tokenInfo
                })}\n\n`);

                // Add logs before analysis
                logger.info('Preparing to analyze data:', {
                    hasUserInfo: !!userData?.userInfo,
                    tweetsCount: userData?.tweets?.length,
                    searchResultsCount: contractData?.searchResults?.length,
                    hasTokenDescription: !!tokenInfo?.description
                });

                // Step 3: Analyze user profile
                try {
                    const analysisData = await this.searchService.analyzeProfile({
                        userInfo: userData?.userInfo,
                        tweets: userData?.tweets,
                        searchResults: contractData?.searchResults || [],
                        tokenDescription: tokenInfo?.description
                    }, address, forceUpdate);
                    
                    res.write(`event: analysisComplete\ndata: ${JSON.stringify(analysisData)}\n\n`);
                } catch (error) {
                    logger.error('User profile analysis failed:', error);
                    res.write(`event: error\ndata: ${JSON.stringify({ error: 'User profile analysis failed: ' + error.message })}\n\n`);
                    res.write(`event: analysisComplete\ndata: ${JSON.stringify({ userProfile: null })}\n\n`);
                }

                res.end();

            } catch (error) {
                logger.error('Stream search request failed:', error);
                res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
                res.end();
            }
        });



        // Add proxy endpoint for retrieving developer tokens list
        this.app.get('/api/pump/dev-tokens/:creator', async (req, res) => {
            try {
                const { creator } = req.params;
                const { limit = 10, offset = 0, includeNsfw = true, exclude } = req.query;
                
                const response = await axios.get(
                    `https://frontend-api.pump.fun/coins/user-created-coins/${creator}`, {
                    params: {
                        limit,
                        offset,
                        includeNsfw
                    },
                    headers: {
                        'accept': '*/*'
                    }
                });
                
                // Check and process the returned data
                let data = response.data;
                
                // Add log to inspect the data structure
                // console.log('Original API data:', JSON.stringify(data));
                
                // Ensure that data and data.coins exist
                if (data && Array.isArray(data)) {
                    // If an array is returned directly
                    if (exclude) {
                        data = data.filter(coin => coin.mint !== exclude);
                    }
                } else if (data && data.coins && Array.isArray(data.coins)) {
                    // If an object containing a coins array is returned
                    if (exclude) {
                        data.coins = data.coins.filter(coin => coin.mint !== exclude);
                    }
                } else {
                    // If the data structure does not match expectations, return an empty array
                    data = { coins: [] };
                }
                
                res.json(data);
            } catch (error) {
                logger.error('Failed to get developer token list:');
                res.status(500).json({ error: error.message });
            }
        });

        // Health check route
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'ok',
                contractAddress: SYSTEM_CONFIG.CONTRACT_ADDRESS,
                availableAccounts: this.searchService?.accountPool?.availableAccounts?.size || 0,
                busyAccounts: this.searchService?.accountPool?.busyAccounts?.size || 0,
                timeoutAccounts: this.searchService?.accountPool?.timeoutAccounts?.size || 0
            });
        });
    }

    async initialize() {
        // Extract accounts from configuration
        this.searchService = new TwitterSearchService();
    }

    start(port = 3000) {
        return new Promise((resolve, reject) => {
            try {
                // Create HTTPS server
                // const httpsServer = https.createServer(sslOptions, this.app);
                const httpsServer = http.createServer(this.app);
                
                httpsServer.listen(port, () => {
                    logger.info(`Twitter Search Service (HTTPS) started on port ${port}`);
                    resolve();
                });

                // Error handling
                httpsServer.on('error', (error) => {
                    logger.error('HTTPS server error:', error);
                    reject(error);
                });

                // Save server instance for later shutdown
                this.server = httpsServer;
            } catch (error) {
                logger.error('Failed to start service:', error);
                reject(error);
            }
        });
    }

    // Add method to shut down the server
    async stop() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) {
                        logger.error('Error while closing server:', err);
                        reject(err);
                    } else {
                        logger.info('Server successfully closed');
                        resolve();
                    }
                });
            });
        }
    }

    // https://x.com/username/
    // https://twitter.com/username/
    // https://x.com/username
    // https://twitter.com/username
    // https://x.com/username?s=21
    // https://twitter.com/username?s=21
    extractTwitterUsername(twitterLink) {
        if (!twitterLink || twitterLink === 'Twitter link not found') {
            return null;
        }

        // Check if it is a search URL; if so, return null.
        if (twitterLink.includes('/search?')) {
            return null;
        }

        // Check if it is a broadcast URL; if so, return null.
        if (twitterLink.includes('/broadcasts/')) {
            return null;
        }

        // Check if it is a tweet URL format
        if (twitterLink.match(/x\.com\/[^\/]+\/status\/\d+/)) {
            return twitterLink;
        }

        // Remove query parameters
        const urlWithoutParams = twitterLink.split('?')[0];
        // Remove trailing slash
        const cleanUrl = urlWithoutParams.replace(/\/$/, '');
        const extractedUsername = cleanUrl.split('/').pop();
        
        if (extractedUsername && 
            !extractedUsername.includes('http') && 
            !extractedUsername.includes('twitter.com') && 
            !extractedUsername.includes('x.com') &&
            /^[A-Za-z0-9_]{1,15}$/.test(extractedUsername)) {
            return extractedUsername;
        }

        return null;
    }
}

// Start the service
async function main() {
    try {
        const server = new SearchServer();
        await server.initialize();
        await server.start(3000);
        
        // Graceful shutdown handling
        process.on('SIGTERM', async () => {
            logger.info('Received SIGTERM signal, preparing to close service...');
            await server.stop();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            logger.info('Received SIGINT signal, preparing to close service...');
            await server.stop();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Failed to start service:', error);
        process.exit(1);
    }
}

// If this file is run directly (not imported), start the service
if (require.main === module) {
    main().catch(error => {
        logger.error('Unhandled error:', error);
        process.exit(1);
    });
}

// Export the SearchServer class so that other modules can use it
module.exports = {
    SearchServer
}; 