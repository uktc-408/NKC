const config = {
  api: {
    dexscreener: 'https://api.dexscreener.com',
    dexscreenerSearch: 'https://api.dexscreener.com/latest/dex/search',
    dexscreenerTokens: 'https://api.dexscreener.com/tokens/v1',

    baseUrl:  'http://localhost:3000',
    wsUrl:  'http://localhost:3002',
    devTokens: 'http://localhost:3000/api/pump/dev-tokens',
    health: 'http://localhost:3000/health',
    tokenInfo: 'http://localhost:3000/api/token/info',
    contract: 'http://localhost:3002/api/contract',
    contractsBatch: 'http://localhost:3002/api/contracts/short/batch',
    twitterSearchStream: 'http://localhost:3000/api/twitter/search/stream'
  },
  social: {
    twitter: 'https://x.com/aiphaofficial',
    telegram: 'https://t.me/aiphaogo',
    github: 'https://github.com/aiphaofficial/aipha',
  },
  site: {
    lastUpdate: '2024.12.26'
  },
  chainId: 'solana'
};

export default config;