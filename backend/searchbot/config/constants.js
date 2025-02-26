// Twitter configuration
const TWITTER_CONFIG = {
    // Search related
    SEARCH: {
        MIN_RESULTS_FOR_CACHE: 30,    // Minimum search results for cache
        MAX_TWEETS_PER_SEARCH: 30,    // Maximum tweets per search
        SAMPLE_SEARCH_RESULTS: 30,    // Sample size of search results for analysis
        FORCE_UPDATE: false,         // Force update cache
        MAX_USER_TWEETS: 20,          // Maximum tweets to fetch for a user
        SAMPLE_TWEETS: 10,            // Sample size of tweets for analysis
    },
    
    // Timeout related
    TIMEOUT: {
        REQUEST: 12000,               // Request timeout (30 seconds)
        ACCOUNT: 24 * 60 * 60,        // Account timeout period (24 hours)
    },
    
    // Cache related
    CACHE: {
        DEFAULT_EXPIRE: 3600,         // Default cache expiration time (1 hour)
        USER_PROFILE: 1 * 60 * 60,     // User profile cache expiration time (1 hour)
        SHORT_EXPIRE: 300,            // Short-term cache expiration time (5 minutes)
        SINGLE_TWEET: 7 * 24 * 60 * 60, // Single tweet cache expiration time (1 week)
    },

    // GPT API configuration
    // GPT: {
    //     API_URL: 'https://api.deerapi.com/v1/chat/completions',
    //     API_KEY: 'sk-GUC5IEimtPWWnD1CVnt80A6SfPKIs5vmeaLTHiJQcvDFwJff',
    //     MODEL: 'gpt-4o-mini-2024-07-18'
    // },


    // Alternative GPT configuration
    GPT1: {
        API_URL: 'https://api.deepseek.com/v1/chat/completions',
        API_KEY: 'your-api-key',
        MODEL: 'deepseek-chat'
    },

    GPT: {
        API_URL: 'https://api.openai.com/v1/chat/completions',
        API_KEY: 'your-api-key',
        MODEL: 'gpt-4o-mini-2024-07-18'
    },
    

    // GPT: {
    //     API_URL: 'https://api-inference.huggingface.co/v1/chat/completions',
    //     API_KEY: 'your-api-key',
    //     MODEL: 'meta-llama/Llama-3.3-70B-Instruct'
    // }

    // Another alternative GPT configuration
    // GPT: {
    //     API_URL: 'https://api-inference.huggingface.co/v1/chat/completions',
    //     API_KEY: 'your-api-key',
    //     MODEL: 'deepseek-ai/DeepSeek-V3'
    // }
};

// System configuration,
const SYSTEM_CONFIG = {
    CONTRACT_ADDRESS: ''
};

module.exports = {
    TWITTER_CONFIG,
    SYSTEM_CONFIG
}; 