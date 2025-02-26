// Redis key constant configuration
const REDIS_KEYS = {
    
    // Bot activity logs
    BOT_ACTIVITY_LOGS: 'bot_activity_logs',
    
    // Account related keys
    ACCOUNT_SEARCH_COUNT: 'account_search_count:', // + username
    ACCOUNT_COOLDOWN: 'account_cooldown:', // + username
    ACCOUNT_TIMEOUT: 'account4_timeout:', // + username, used to mark timed-out accounts

    // Twitter tweet related keys
    TWITTER_COOKIES: 'twitter_cookies:', // + username, stores Twitter account cookies
    

    // New: Twitter user profiling related keys
    USER_PROFILE: 'twitter_user_profile6:', // + username, user profiling analysis result
    TWITTER_USER_INFO: 'twitter_user_info6:', // + username, user info cache
    TWITTER_USER_TWEETS: 'twitter_user_tweets6:', // + username, user tweets cache
    TWITTER_SEARCH_RESULTS: 'twitter_search_results6:', // + query, search results cache

    // New: Token information cache
    TOKEN_INFO: 'token_info4:', // + address

    // New: API request counting prefix
    API_COUNTER: 'api_counter:', // prefix used for API request counting
};

module.exports = REDIS_KEYS; 