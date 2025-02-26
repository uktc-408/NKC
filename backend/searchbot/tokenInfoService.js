const axios = require('axios');
const { tokenLogger: logger } = require('./config/logger');
const { PublicKey } = require('@solana/web3.js');
const  redisClient  = require('./config/redis');
const  REDIS_KEYS  = require('./config/redisKeys');

const BASE_URL = 'https://api.dexscreener.com';
const CHAIN_IDS = ['solana', 'ethereum','base','bsc'];
const CHAIN_IDS2 = ['ethereum','base','bsc', 'solana'];

function isSolanaAddress(address) {
    try {
        new PublicKey(address);
        return true;
    } catch (error) {
        return false;
    }
}

function formatTimeAgo(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // For negative diff (future date), return the original format
  if (diffInSeconds < 0) {
    return dateString;
  }

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const value = Math.floor(diffInSeconds / seconds);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
}

function formatMarketCap(value) {
  if (!value) return null;
  
  // If the value is a numeric string (possibly with a $ sign), remove non-numeric characters
  const num = typeof value === 'string' ? 
    parseFloat(value.replace(/[^0-9.-]+/g, "")) : 
    value;

  if (isNaN(num)) return null;

  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

async function getTokenInfo(address, useCache = false) {
  try {
    // Check cache
    if (useCache) {
      const cacheKey = REDIS_KEYS.TOKEN_INFO + address;
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        logger.info(`Using Redis cached token info: ${address}`);
        return JSON.parse(cachedData);
      }
    }

    let multiTokens = null;
    let foundData = false;

    // Choose search order based on address format
    const searchChains = address.startsWith('0x') ? CHAIN_IDS2 : CHAIN_IDS;

    // Try each chain sequentially
    for (const chainId of searchChains) {
      try {
        multiTokens = await axios.get(`${BASE_URL}/tokens/v1/${chainId}/${address}`);
        // console.log(`${chainId} multiTokens:`, multiTokens.data);
        
        if (multiTokens.data && multiTokens.data.length > 0) {
          foundData = true;
          break;
        }
      } catch (error) {
        console.log(`Query failed on chain ${chainId}:`, error.message);
        continue;
      }
    }

    let dexData = null;
    if (foundData && multiTokens.data.length > 0) {
      dexData = multiTokens.data[0];
    }
    
    // pump.fun API data
    let pumpResponse = { data: {} };
    try {
      pumpResponse = await axios.get(`https://frontend-api.pump.fun/coins/${address}?sync=true`, {
        headers: { 'accept': '*/*' }
      });
    } catch (error) {
      logger.warn('Failed to retrieve pump.fun data:', error.message);
      // If pump.fun API fails, continue using dexData
    }
    
    // Extract social links from DexScreener data
    let websiteLink = null;
    let twitterLink = null;
    let telegramLink = null;

    if (dexData?.info) {
      // Extract website link
      if (dexData.info.websites && dexData.info.websites.length > 0) {
        websiteLink = dexData.info.websites[0].url;
      }

      // Extract social links
      if (dexData.info.socials) {
        dexData.info.socials.forEach(social => {
          if (social.type === 'twitter') twitterLink = social.url;
          if (social.type === 'telegram') telegramLink = social.url;
        });
      }
    }
    
    // Merge data giving priority to DexScreener's data
    const name = dexData?.baseToken?.name || pumpResponse.data.name || null;
    const symbol = dexData?.baseToken?.symbol || pumpResponse.data.symbol || '';
    const displayName = symbol ? `${name} (${symbol})` : name;

    // Extract price change data
    const priceChange = {
      h1: dexData?.priceChange?.h1 || null,
      h24: dexData?.priceChange?.h24 || null
    };

    const result = {
      chainId: dexData?.chainId || CHAIN_IDS[0],
      name: displayName,
      avatar: dexData?.info?.imageUrl || pumpResponse.data.image_uri || null,
      description: pumpResponse.data.description || null,
      creator: pumpResponse.data.creator || null,
      createdAt: formatTimeAgo(dexData?.pairCreatedAt ? new Date(dexData.pairCreatedAt).toISOString() : pumpResponse.data.created_at),
      marketCap: formatMarketCap(dexData?.marketCap || pumpResponse.data.market_cap),
      volume: formatMarketCap(dexData?.volume?.h24 || null),
      price: dexData?.priceUsd || null,
      priceChange,
      liquidity: formatMarketCap(dexData?.liquidity?.usd || null),
      change: {
        h1: dexData?.priceChange?.h1 ? `${dexData.priceChange.h1.toFixed(2)}%` : null,
        h24: dexData?.priceChange?.h24 ? `${dexData.priceChange.h24.toFixed(2)}%` : null
      },
      vol: formatMarketCap(dexData?.volume?.h24 || null),
      twitterLink: twitterLink || pumpResponse.data.twitter || null,
      websiteLink: websiteLink || pumpResponse.data.website || null,
      telegramLink: telegramLink || pumpResponse.data.telegram || null
    };

    // Store in Redis cache with an expiration time of 10 seconds
    const cacheKey = REDIS_KEYS.TOKEN_INFO + address;
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 10);

    return result;

  } catch (error) {
    logger.error('Error retrieving token info:', error.message);
    const errorResult = {
      chainId: null,
      name: null,
      avatar: null,
      description: null,
      creator: null,
      createdAt: null,
      marketCap: null,
      volume: null,
      price: null,
      priceChange: {
        h1: null,
        h24: null
      },
      liquidity: null,
      change: {
        h1: null,
        h24: null
      },
      vol: null,
      twitterLink: null,
      websiteLink: null,
      telegramLink: null
    };

    // Cache error result for 10 seconds as well
    const cacheKey = REDIS_KEYS.TOKEN_INFO + address;
    await redisClient.set(cacheKey, JSON.stringify(errorResult), 'EX', 10);

    return errorResult;
  }
}

// Test code
async function test() {
    const tokenAddress = '0x432665a9709593149dab052fcda7e389122d98ae';
    console.log('Fetching token info...');
    
    const tokenInfo = await getTokenInfo(tokenAddress);
    console.log('\nToken information:', JSON.stringify(tokenInfo, null, 2));
}

// If this file is run directly then execute the test
if (require.main === module) {
    test();
} else {
    module.exports = getTokenInfo;
}