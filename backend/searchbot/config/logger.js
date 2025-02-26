const log4js = require('log4js');

// 统一的日志配置
log4js.configure({
    appenders: {
        console: { type: 'console' },
        server: { type: 'file', filename: 'logs/search_server.log' },
        twitter: { type: 'file', filename: 'logs/twitter_search.log' },
        token: { type: 'file', filename: 'logs/token_info.log' },
        profile: { type: 'file', filename: 'logs/profile_analyzer.log' }
    },
    categories: {
        server: { appenders: ['console', 'server'], level: 'info' },
        twitter: { appenders: ['console', 'twitter'], level: 'info' },
        token: { appenders: ['console', 'token'], level: 'info' },
        profile: { appenders: ['console', 'profile'], level: 'info' },
        default: { appenders: ['console'], level: 'info' }
    }
});

// 导出不同模块使用的logger
module.exports = {
    serverLogger: log4js.getLogger('server'),
    twitterLogger: log4js.getLogger('twitter'),
    tokenLogger: log4js.getLogger('token'),
    profileLogger: log4js.getLogger('profile')
}; 