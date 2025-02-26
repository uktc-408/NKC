const { Scraper } = require('agent-twitter-client');
const redis = require('./config/redis');
const REDIS_KEYS = require('./config/redisKeys');
const { initializeScraper } = require('./twitterLogin');
const { twitterLogger: logger } = require('./config/logger');
const UserProfileAnalyzer = require('./userProfileAnalyzer');
const { TWITTER_CONFIG } = require('./config/constants');
const { ACCOUNT_GROUPS } = require('./config/accountGroups');
const TwitterAccountPool = require('./TwitterAccountPool');

// Search service class
class TwitterSearchService {
    constructor() {
        const accounts = ACCOUNT_GROUPS.flat().filter(account =>
            account && account.username && account.password && account.twoFactorSecret
        );

        if (accounts.length === 0) {
            throw new Error('No available account configuration found');
        }

        logger.info(`Extracted ${accounts.length} accounts from configuration`);

        // Initialize service
        const accountPool = new TwitterAccountPool(accounts);
        this.accountPool = accountPool;
        this.profileAnalyzer = new UserProfileAnalyzer();
        this.TIMEOUT = TWITTER_CONFIG.TIMEOUT.REQUEST;
    }

    // Modified withTimeout method
    async withTimeout(promise, operation, accountWrapper) {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Operation ${operation} timed out`)), this.TIMEOUT);
            });
            return await Promise.race([promise, timeoutPromise]);
        } catch (error) {
            if (error.message.includes('timed out') && accountWrapper) {
                logger.error(`${operation} timed out`);
                await this.accountPool.markAccountTimeout(accountWrapper.account);
            }
            throw error;
        }
    }

    // Modified search contract data method
    async searchContractData(address, forceUpdate = false, loggedInUsername = null) {
        const startTime = Date.now();
        let accountWrapper = null;
        try {
            let searchResults = null;
            
            if (address) {
                const cacheKey = `${REDIS_KEYS.TWITTER_SEARCH_RESULTS}${address}`;
                
                // Only try retrieving from cache if not forcing an update
                if (!forceUpdate) {
                    const cachedData = await this.getFromRedis(cacheKey);
                    console.log('cachedData:', );
                    if (cachedData) {
                        return { searchResults: cachedData };
                    }
                }

                // Get account, prioritizing the specified user's scraper
                accountWrapper = await this.accountPool.getAvailableAccount(loggedInUsername);
                if (!accountWrapper) {
                    throw new Error('No available accounts');
                }

                try {
                    searchResults = [];
                    const searchGenerator = accountWrapper.scraper.searchTweets(
                        address, 
                        TWITTER_CONFIG.SEARCH.MAX_TWEETS_PER_SEARCH
                    );
                    
                    await this.withTimeout(
                        (async () => {
                            for await (const tweet of searchGenerator) {
                                searchResults.push(this.formatTweet(tweet));
                                if (searchResults.length >= TWITTER_CONFIG.SEARCH.MAX_TWEETS_PER_SEARCH) break;
                            }
                        })(),
                        'Search contract address',
                        accountWrapper
                    );

                    if (searchResults.length >= TWITTER_CONFIG.SEARCH.MIN_RESULTS_FOR_CACHE) {
                        await this.saveToRedis(cacheKey, searchResults);
                    } else if (searchResults.length > 0) {
                        // If the number of results doesn't meet the minimum cache requirement but is greater than 0, cache for 5 minutes
                        await this.saveToRedis(cacheKey, searchResults, TWITTER_CONFIG.CACHE.SHORT_EXPIRE);
                    }

                    if (searchResults.length > 0) {
                        logger.info(`Contract search successful, found ${searchResults.length} results`);
                    } else {
                        logger.warn(`Contract search completed, but no related tweets were found`);
                    }
                } catch (error) {
                    if (error.message.includes('timed out') || error.message.includes('Denied by access')) {
                        await this.accountPool.markAccountTimeout(accountWrapper.account);
                    }
                    throw error;
                } finally {
                    await this.accountPool.releaseAccount(accountWrapper);
                }
            }

            const result = { searchResults };
            const endTime = Date.now();
            logger.info(`Search contract data complete [${address}], took: ${endTime - startTime}ms, result count: ${searchResults?.length || 0}`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            logger.error(`Search contract data failed [${address}], took: ${endTime - startTime}ms, error:`, error);
            throw error;
        }
    }

    // Modified search user data method
    async searchUserData(username, forceUpdate = false, loggedInUsername = null, skipTweets = false) {
        const startTime = Date.now();
        let accountWrapper = null;
        try {
            let userInfo = null;
            let tweets = null;
            
            if (username) {
                const userCacheKey = `${REDIS_KEYS.TWITTER_USER_INFO}${username}`;
                const tweetsCacheKey = `${REDIS_KEYS.TWITTER_USER_TWEETS}${username}`;
                
                if (!forceUpdate) {
                    userInfo = await this.getFromRedis(userCacheKey);
                    console.log('cached userInfo:',);
                    console.log('cached tweets:', );
                    if (!skipTweets) {
                        tweets = await this.getFromRedis(tweetsCacheKey);
                    }
                }
                
                if (!userInfo || (!tweets && !skipTweets)) {
                    accountWrapper = await this.accountPool.getAvailableAccount(loggedInUsername);
                    if (!accountWrapper) {
                        throw new Error('No available accounts');
                    }

                    // Fetch user information
                    if (!userInfo) {
                        try {
                            userInfo = await this.withTimeout(
                                accountWrapper.scraper.getProfile(username),
                                'Get user profile',
                                accountWrapper
                            );
                            await this.saveToRedis(userCacheKey, userInfo);
                        } catch (error) {
                            // If the user is not found, log a warning but continue
                            if (error.message.includes('User not found')) {
                                logger.warn(`User ${username} not found, but continuing with other data`);
                                userInfo = null;
                                tweets = null;
                            } else {
                                throw error;
                            }
                        }
                    }
                    
                    // Only fetch tweets if not skipping and user info was successfully obtained
                    if (userInfo && !skipTweets && !tweets) {
                        tweets = [];
                        const tweetGenerator = await accountWrapper.scraper.getTweets(
                            username, 
                            TWITTER_CONFIG.SEARCH.MAX_USER_TWEETS
                        );
                        
                        await this.withTimeout(
                            (async () => {
                                for await (const tweet of tweetGenerator) {
                                    tweets.push(this.formatTweet(tweet));
                                    if (tweets.length >= TWITTER_CONFIG.SEARCH.MAX_USER_TWEETS) break;
                                }
                            })(),
                            'Get user tweets',
                            accountWrapper
                        );
                        await this.saveToRedis(tweetsCacheKey, tweets);
                    }
                }
            }

            const result = { 
                userInfo, 
                tweets: skipTweets ? null : tweets,
                userNotFound: !userInfo && username ? true : false
            };
            const endTime = Date.now();
            logger.info(`Search user data complete [${username}], took: ${endTime - startTime}ms`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            logger.error(`Search user data failed [${username}], took: ${endTime - startTime}ms, error:`, error);
            if (accountWrapper && (error.message.includes('timed out') || error.message.includes('Denied by access'))) {
                await this.accountPool.markAccountTimeout(accountWrapper.account);
            }
            throw error;
        } finally {
            if (accountWrapper) {
                await this.accountPool.releaseAccount(accountWrapper);
            }
        }
    }

    async getSingleTweetData(tweetId, loggedInUsername = null) {
        const startTime = Date.now();
        let accountWrapper = null;
        try {
            // Attempt to retrieve tweet from cache
            const tweetCacheKey = `${REDIS_KEYS.TWITTER_SINGLE_TWEET}${tweetId}`;
            const userCacheKey = `${REDIS_KEYS.TWITTER_USER_INFO}${tweetId}`;
            
            let cachedTweet = await this.getFromRedis(tweetCacheKey);
            let cachedUserInfo = await this.getFromRedis(userCacheKey);
            
            // If complete data is available in cache, return directly
            if (cachedTweet && cachedUserInfo) {
                logger.info(`Retrieved tweet and user info [${tweetId}] from cache`);
                return {
                    userInfo: cachedUserInfo,
                    tweets: [cachedTweet],
                    isSingleTweet: true
                };
            }

            // Get account, prioritizing the specified user's scraper
            accountWrapper = await this.accountPool.getAvailableAccount(loggedInUsername);
            if (!accountWrapper) {
                throw new Error('No available accounts');
            }
            
            // If tweet is not cached, fetch tweet
            if (!cachedTweet) {
                const tweet = await this.withTimeout(
                    accountWrapper.scraper.getTweet(tweetId),
                    'Get single tweet',
                    accountWrapper
                );

                // Handle scenario where tweet does not exist
                if (!tweet) {
                    logger.warn(`Tweet does not exist or has been deleted [${tweetId}]`);
                    return {
                        userInfo: null,
                        tweets: [],
                        isSingleTweet: true,
                        tweetNotFound: true
                    };
                }

                cachedTweet = this.formatTweet(tweet);
                // Cache the tweet
                await this.saveToRedis(tweetCacheKey, cachedTweet, TWITTER_CONFIG.CACHE.SINGLE_TWEET);
                logger.info(`Cached single tweet [${tweetId}]`);
            }
            
            // If user info is not cached, fetch user info
            if (!cachedUserInfo) {
                const userInfo = await this.searchUserData(cachedTweet.username, false, loggedInUsername, true);
                if (userInfo?.userInfo) {
                    cachedUserInfo = userInfo.userInfo;
                    await this.saveToRedis(userCacheKey, cachedUserInfo, TWITTER_CONFIG.CACHE.USER_INFO);
                    logger.info(`Cached tweet author info [${cachedTweet.username}]`);
                }
            }
            
            const result = {
                userInfo: cachedUserInfo || null,
                tweets: [cachedTweet],
                isSingleTweet: true
            };

            const endTime = Date.now();
            logger.info(`Single tweet retrieval complete [${tweetId}], took: ${endTime - startTime}ms`);
            return result;
            
        } catch (error) {
            const endTime = Date.now();
            logger.error(`Single tweet retrieval failed [${tweetId}], took: ${endTime - startTime}ms, error:`, error);
            if (error.message.includes('timed out') || error.message.includes('Denied by access')) {
                await this.accountPool.markAccountTimeout(accountWrapper.account);
            }
            throw error;
        } finally {
            if (accountWrapper) {
                await this.accountPool.releaseAccount(accountWrapper);
            }
        }
    }
    
    // Modified: Analyze user profile method
    async analyzeProfile(searchData, address, forceUpdate = false) {
        const startTime = Date.now();
        try {
            const { userInfo, tweets, searchResults, tokenDescription } = searchData;
            const userProfile = await this.profileAnalyzer.analyzeUserProfile(
                userInfo,
                tweets,
                searchResults,
                address,
                tokenDescription,
                forceUpdate
            );
            const result = { userProfile };
            const endTime = Date.now();
            logger.info(`User profile analysis complete, took: ${endTime - startTime}ms`);
            return result;
        } catch (error) {
            const endTime = Date.now();
            logger.error(`User profile analysis failed, took: ${endTime - startTime}ms, error:`, error);
            logger.error('Analysis failed:', error);
            throw error;
        }
    }

    // Save data to Redis
    async saveToRedis(key, data, expireTime = TWITTER_CONFIG.CACHE.DEFAULT_EXPIRE) {
        try {
            await redis.setex(key, expireTime, JSON.stringify(data));
        } catch (error) {
            logger.error(`Failed to save data to Redis: ${error.message}`);
            throw error;
        }
    }

    // Retrieve data from Redis
    async getFromRedis(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`Failed to retrieve data from Redis: ${error.message}`);
            return null;
        }
    }

    // Format tweet data, keeping only key information
    formatTweet(tweet) {
        return {
            id: tweet.id,
            text: tweet.html,
            name: tweet.name,
            username: tweet.username,
            likes: tweet.likes,
            retweets: tweet.retweets,
            replies: tweet.replies,
            views: tweet.views,
            timeParsed: tweet.timeParsed,
            isQuoted: tweet.isQuoted,
            quotedStatus: tweet.quotedStatus ? {
                text: tweet.quotedStatus.text,
                username: tweet.quotedStatus.username
            } : null
        };
    }
}

// Modified exports
module.exports = {
    TwitterSearchService
}; 