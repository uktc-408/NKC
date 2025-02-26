const redis = require('./config/redis');
const REDIS_KEYS = require('./config/redisKeys');
const { initializeScraper } = require('./twitterLogin');
const { twitterLogger: logger } = require('./config/logger');
const { TWITTER_CONFIG } = require('./config/constants');

class TwitterAccountPool {
    constructor(accounts) {
        this.accounts = accounts;
        this.availableAccounts = new Set(accounts);
        this.busyAccounts = new Set();
    }

    async getLoggedInScraper(username) {
        if (!username) return null;

        try {
            // Check if the account is in a timeout state
            // const timeoutKey = `${REDIS_KEYS.ACCOUNT_TIMEOUT}${username}`;
            // const isTimeout = await redis.get(timeoutKey);
            
            // if (isTimeout) {
            //     logger.warn(`Logged-in user ${username} is in timeout state`);
            //     return null;
            // }

            // Always create a new scraper
            const scraper = await initializeScraper(username);
            if (scraper) {
                logger.info(`Created a new scraper for logged-in user ${username}`);
                return {
                    account: { username },
                    scraper
                };
            }
        } catch (error) {
            logger.error(`Failed to get scraper for user ${username}:`, error);
        }
        return null;
    }

    async getAvailableAccount(username) {
        // Prefer to use the specified user's logged-in scraper
        if (username) {
            const loggedInScraper = await this.getLoggedInScraper(username);
            if (loggedInScraper) {
                return loggedInScraper;
            }
            logger.warn(`Scraper for logged-in user ${username} is unavailable, trying fallback account`);
        }

        // If no logged-in scraper is available, use the fallback account pool
        if (this.availableAccounts.size === 0) {
            logger.warn('No fallback accounts are available');
            return null;
        }

        const account = Array.from(this.availableAccounts)[0];
        
        // Check if the account is in a timeout state
        const timeoutKey = `${REDIS_KEYS.ACCOUNT_TIMEOUT}${account.username}`;
        const isTimeout = await redis.get(timeoutKey);
        if (isTimeout) {
            this.availableAccounts.delete(account);
            return this.getAvailableAccount(); // Recursively try the next account
        }

        this.availableAccounts.delete(account);
        this.busyAccounts.add(account);

        // Always create a new scraper
        try {
            const scraper = await initializeScraper(account);
            if (scraper) {
                return {
                    account,
                    scraper
                };
            } else {
                await this.markAccountTimeout(account);
                return this.getAvailableAccount(); // Recursively try the next account
            }
        } catch (error) {
            logger.error(`Failed to initialize account ${account.username}:`, error);
            await this.markAccountTimeout(account);
            return this.getAvailableAccount(); // Recursively try the next account
        }
    }

    async markAccountTimeout(account) {
        this.busyAccounts.delete(account);
        
        // Set Redis timeout flag, automatically expiring after 24 hours
        const timeoutKey = `${REDIS_KEYS.ACCOUNT_TIMEOUT}${account.username}`;
        await redis.setex(timeoutKey, TWITTER_CONFIG.TIMEOUT.ACCOUNT, '1');
        
        logger.warn(`Account ${account.username} has been marked as timed out`);
    }

    releaseAccount(accountWrapper) {
        if (this.busyAccounts.has(accountWrapper.account)) {
            this.busyAccounts.delete(accountWrapper.account);
            this.availableAccounts.add(accountWrapper.account);
        }
    }
}

module.exports = TwitterAccountPool; 