const { TwitterSearchService } = require('../searchbot/twitterSearchService');
const TwitterAccountPool = require('../searchbot/TwitterAccountPool');

const tokenInfoService = require('../searchbot/tokenInfoService');    
const { serverLogger: logger } = require('../searchbot/config/logger');
const { ACCOUNT_GROUPS } = require('../searchbot/config/accountGroups');


class AnalysisService {
    constructor() {
        const accountPool = new TwitterAccountPool(ACCOUNT_GROUPS.flat().filter(account => 
            account && account.username && account.password && account.twoFactorSecret
        ));
        this.searchService = new TwitterSearchService(accountPool);
    }

    async analyzeFromMessage(address, forceUpdate = false) {
        try {
            let tokenInfo = null;
            let contractData = null;
            let userData = null;
            let analysisData = null;

            // Step 1: Get token information and search contract-related tweets
            try {
                tokenInfo = await tokenInfoService(address, false);
                contractData = await this.searchService.searchContractData(address, forceUpdate);

                // Extract Twitter username from token information
                let searchUsername = null;
                if (tokenInfo?.twitterLink) {
                    const extractedUsername = this.extractTwitterUsername(tokenInfo.twitterLink);
                    if (extractedUsername) {
                        searchUsername = extractedUsername;
                    }
                }

                // Step 2: Search user information and tweets
                if (searchUsername) {
                    // Check if it's a complete tweet URL
                    const tweetUrlMatch = searchUsername.match(/x\.com\/([^\/]+)\/status\/(\d+)/);
                    if (tweetUrlMatch) {
                        const [_, extractedUsername, tweetId] = tweetUrlMatch;
                        userData = await this.searchService.getSingleTweetData(tweetId);
                    } else {
                        userData = await this.searchService.searchUserData(searchUsername, forceUpdate);
                    }
                }

                // Step 3: Analyze user profile
                analysisData = await this.searchService.analyzeProfile({
                    userInfo: userData?.userInfo,
                    tweets: userData?.tweets,
                    searchResults: contractData?.searchResults || [],
                    tokenDescription: tokenInfo?.description
                }, address, forceUpdate);

                // Integrate all data
                const result = {
                    tokenInfo,
                    contractData: {
                        ...contractData,
                        tokenInfo
                    },
                    userData: {
                        ...userData,
                        tokenInfo
                    },
                    analysisData
                };

                // Cache analysis results
                // const cacheKey = `${REDIS_KEYS.ANALYSIS_RESULT}${address}`;
                // await redis.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour

                return result;

            } catch (error) {
                logger.error('Analysis failed:', error);
                throw error;
            }
        } catch (error) {
            logger.error('Analysis service error:', error);
            throw error;
        }
    }

    // Extract username from Twitter link
    extractTwitterUsername(twitterLink) {
        if (!twitterLink || twitterLink === 'Twitter link not found') {
            return null;
        }

        // Check if it's a search URL
        if (twitterLink.includes('/search?')) {
            return null;
        }

        // Check if it's a broadcast URL
        if (twitterLink.includes('/broadcasts/')) {
            return null;
        }

        // Check if it's a tweet URL format
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

if (require.main === module) {
    async function test() {
        try {
            const testAddress = "BP7YCdPC7GK9Wu28eFAMcbe5zd9j1c6q1HVadmi3pump";
            const service = new AnalysisService();
            const result = await service.analyzeFromMessage(testAddress);
            
            // Print each section separately
            console.log('\n========== Token Information ==========');
            console.log(JSON.stringify(result.tokenInfo, null, 2));
            
            console.log('\n========== Contract Related Tweets ==========');
            // console.log(JSON.stringify(result.contractData.searchResults, null, 2));
            
            console.log('\n========== User Information ==========');
            // console.log(JSON.stringify(result.userData.userInfo, null, 2));
            
            console.log('\n========== User Tweets ==========');
            // console.log(JSON.stringify(result.userData.tweets, null, 2));
            
            console.log('\n========== Analysis Results ==========');
            console.log(JSON.stringify(result.analysisData, null, 2));
            
        } catch (error) {
            console.error('Test failed:', error);
        }
    }
    
    test();
} else {
    module.exports = AnalysisService;
} 