const axios = require('axios');
const { profileLogger: logger } = require('./config/logger');
const redis = require('./config/redis');
const REDIS_KEYS = require('./config/redisKeys');
const { TWITTER_CONFIG } = require('./config/constants');

class UserProfileAnalyzer {
    constructor() {
        this.GPT_API_URL = TWITTER_CONFIG.GPT.API_URL;
        this.GPT_API_KEY = TWITTER_CONFIG.GPT.API_KEY;
        this.CACHE_EXPIRE = TWITTER_CONFIG.CACHE.USER_PROFILE;
        this.GPT1_API_URL = TWITTER_CONFIG.GPT1.API_URL;
        this.GPT1_API_KEY = TWITTER_CONFIG.GPT1.API_KEY;
        this.GPT1_MODEL = TWITTER_CONFIG.GPT1.MODEL;
    }

    // Data cleaning function
    cleanData(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        return data
            .replace(/\\n/g, '\n')           // Replace escaped newlines
            .replace(/\\"/g, '"')            // Replace escaped quotes
            .replace(/<br>/g, '\n')          // Convert HTML line breaks to actual newlines
            .replace(/<[^>]*>/g, '')         // Remove all HTML tags
            .replace(/\\\\"/g, '"')          // Handle double-escaped quotes
            .replace(/\\\\/g, '\\');         // Handle other escaped characters
    }

    async analyzeUserProfile(userInfo, tweets, searchResults, address, tokenDescription, forceUpdate = false) {
        const cacheKey = `${REDIS_KEYS.USER_PROFILE}${address || userInfo?.username || 'null'}`;
        
        // Only try to get from cache if not force update
        if (!forceUpdate) {
            try {
                const cachedProfile = await redis.get(cacheKey);
                if (cachedProfile) {
                    logger.info(`Using cached user profile: ${address || userInfo?.username || 'null'}`);
                    return JSON.parse(cachedProfile);
                }
            } catch (error) {
                logger.error('Failed to read cache:', error);
            }
        }
        if (!searchResults || searchResults.length === 0) {
            return "Insufficient data for analysis. Please try again later or provide more relevant information.";
        }
            
        // 优化传给 GPT 的推文数据
        const optimizedTweets = tweets?.slice(0, TWITTER_CONFIG.SEARCH.SAMPLE_TWEETS).map(tweet => ({
            text: tweet.text,
            username: tweet.username,
            timeParsed: tweet.timeParsed,
            likes: tweet.likes,
            retweets: tweet.retweets,
            quotedText: tweet.quotedText
        }));

        const optimizedSearchResults = searchResults?.slice(0, TWITTER_CONFIG.SEARCH.SAMPLE_SEARCH_RESULTS).map(tweet => ({
            text: tweet.text,
            username: tweet.username,
            timeParsed: tweet.timeParsed,
            likes: tweet.likes,
            retweets: tweet.retweets,
            quotedText: tweet.quotedText
        }));

        // 简化用户信息，只保留关键字段
        const simplifiedUserInfo = userInfo ? {
            username: userInfo.username,
            name: userInfo.name,
            biography: userInfo.biography
        } : null;

        // 清理数据
        const cleanedUserInfo = simplifiedUserInfo ? this.cleanData(simplifiedUserInfo) : null;
        const cleanedTweets = tweets ? this.cleanData(optimizedTweets) : null;
        const cleanedSearchResults = searchResults ? this.cleanData(optimizedSearchResults) : null;
        const cleanedTokenDescription = tokenDescription ? this.cleanData(tokenDescription) : null;

        // 打印清理后的数据
        // console.log('=== 清理后的数据 ===');
        // console.log('cleanedUserInfo:', cleanedUserInfo);
        // console.log('cleanedTweets:', cleanedTweets);
        // console.log('cleanedSearchResults:', cleanedSearchResults);
        console.log('cleanedTokenDescription:', cleanedTokenDescription);

        // Modify system prompt to generate both Chinese and English versions through function call
        const messages = [{
            "role": "system",
            "content": "You are a professional crypto project analyst. Please analyze the project's main narrative and key people's background in concise language (try not to exceed 100 words), generating both Chinese and English versions. Output the analysis results through function call 'setAnalysisResult' with parameters 'chinese' (Chinese version) and 'english' (English version). Avoid discussing volatile information like prices, market cap, and holders."
        }, {
            "role": "user",
            "content": `Please analyze this project's main narrative:
${cleanedUserInfo ? `User Info: ${cleanedUserInfo}` : 'Official Twitter account not found'}
${cleanedSearchResults ? `Twitter Search Results (pay special attention to most discussed points): ${cleanedSearchResults}` : ''}
${cleanedTweets ? `Recent Tweet Samples: ${cleanedTweets}` : ''}
${cleanedTokenDescription ? `Project Description: ${cleanedTokenDescription}` : ''}

Please summarize (don't use bold markers):
- Describe the project's main narrative and hype points (e.g., AI, notable figures, KOLs, TikTok, etc.)
- For key people, provide one-sentence introduction highlighting their most important background or achievement
- Token transfer movements and distribution patterns, please include all mentioned token transfer information

Notes:
- Use concise language, natural output, avoid using numbered lists
- Keep key people introductions brief and focused on most representative background
- Avoid discussing volatile information like prices, market cap, and holders
${!userInfo ? '- Analysis mainly based on search results as official Twitter account not found' : ''}`
        }];

        // 定义 function call 的参数描述
        const functionsDefinition = [
            {
                name: "setAnalysisResult",
                description: "Output analysis results in Chinese and English versions",
                parameters: {
                    type: "object",
                    properties: {
                        chinese: {
                            type: "string",
                            description: "Chinese version of the analysis result"
                        },
                        english: {
                            type: "string",
                            description: "English version of the analysis result"
                        }
                    },
                    required: ["chinese", "english"]
                }
            }
        ];

        try {
            // 尝试使用主要的 GPT 配置
            try {
                const response = await axios({
                    method: 'post',
                    url: this.GPT_API_URL,
                    headers: {
                        'Authorization': `Bearer ${this.GPT_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        model: TWITTER_CONFIG.GPT.MODEL,
                        messages,
                        functions: functionsDefinition,
                        function_call: { name: "setAnalysisResult" },
                        temperature: 0.7,
                        max_tokens: 1000
                    },
                    timeout: 20000,
                    maxRetries: 3,
                    retryDelay: 3000
                });

                const message = response.data.choices[0].message;
                let analysis;
                if (message.function_call && message.function_call.arguments) {
                    try {
                        analysis = JSON.parse(message.function_call.arguments);
                    } catch (err) {
                        // 如果解析失败，则使用content内容生成双版本的备选方案
                        analysis = { chinese: message.content, english: message.content };
                    }
                } else {
                    analysis = { chinese: message.content, english: message.content };
                }
                await this.cacheAnalysisResult(cacheKey, analysis, searchResults);
                return analysis;

            } catch (error) {
                logger.warn('主要GPT分析失败，尝试使用备用GPT1:', error.message);
                
                // 使用 GPT1 配置重试
                const response = await axios({
                    method: 'post',
                    url: this.GPT1_API_URL,
                    headers: {
                        'Authorization': `Bearer ${this.GPT1_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        model: this.GPT1_MODEL,
                        messages,
                        functions: functionsDefinition,
                        function_call: { name: "setAnalysisResult" },
                        temperature: 0.7,
                        max_tokens: 1000
                    },
                    timeout: 20000,
                    maxRetries: 3,
                    retryDelay: 3000
                });

                const message = response.data.choices[0].message;
                let analysis;
                if (message.function_call && message.function_call.arguments) {
                    try {
                        analysis = JSON.parse(message.function_call.arguments);
                    } catch (err) {
                        analysis = { chinese: message.content, english: message.content };
                    }
                } else {
                    analysis = { chinese: message.content, english: message.content };
                }
                await this.cacheAnalysisResult(cacheKey, analysis, searchResults);
                return analysis;
            }
        } catch (error) {
            logger.error('All GPT analysis attempts failed:', error);
            throw new Error('Unable to complete analysis, please try again later');
        }
    }

    // Helper method for caching results
    async cacheAnalysisResult(cacheKey, analysis, searchResults) {
        try {
            if (searchResults && searchResults.length >= TWITTER_CONFIG.SEARCH.MIN_RESULTS_FOR_CACHE) {
                await redis.setex(cacheKey, this.CACHE_EXPIRE, JSON.stringify(analysis));
                logger.info(`Cached analysis result, search results count: ${searchResults.length}`);
            } else if (searchResults && searchResults.length > 0) {
                await redis.setex(cacheKey, TWITTER_CONFIG.CACHE.SHORT_EXPIRE, JSON.stringify(analysis));
                logger.info(`Search results less than ${TWITTER_CONFIG.SEARCH.MIN_RESULTS_FOR_CACHE} (${searchResults.length}), using short-term cache`);
            } else {
                logger.info(`Search results less than ${TWITTER_CONFIG.SEARCH.MIN_RESULTS_FOR_CACHE} (${searchResults?.length || 0}), skipping cache`);
            }
        } catch (error) {
            logger.error('Failed to cache analysis result:', error);
        }
    }

    // 将 GPT API 调用逻辑分离出来
    async callGPTAPI(userInfo, tweets, searchResults) {
        // ... 原有的 GPT API 调用代码 ...
    }
}

module.exports = UserProfileAnalyzer; 