// Chain ID to path parameter mapping
const chainPathMap = {
  'solana': 'sol',
  'ethereum': 'eth',
  'bsc': 'bsc',
  'base': 'base'
};

// Special mapping for DEBOT
const debotChainMap = {
  'solana': 'solana',
  'ethereum': 'eth',
  'bsc': 'bsc',
  'base': 'base'
};

// Special mapping for DexScreener
const dexScreenerChainMap = {
  'solana': 'solana',
  'ethereum': 'ethereum',
  'bsc': 'bsc',
  'base': 'base'
};

// Special mapping for GeckoTerminal
const geckoTerminalChainMap = {
  'solana': 'solana',
  'ethereum': 'eth',
  'bsc': 'bsc',
  'base': 'base'
};

// Special mapping for OKX
const okxChainMap = {
  'solana': '501',
  'ethereum': '1',
  'bsc': '56',
  'base': '8453'
};

// Special mapping for BullX
const bullxChainMap = {
  'solana': '1399811149',
  'ethereum': '1',
  'bsc': '56',
  'base': '8453'
};

// Special mapping for DexTools
const dexToolsChainMap = {
  'solana': 'solana',
  'ethereum': 'ether',
  'bsc': 'bnb',
  'base': 'base'
};

// Special mapping for Ave
const aveChainMap = {
  'solana': 'solana',
  'ethereum': 'eth',
  'bsc': 'bsc',
  'base': 'base'
};

// Special mapping for Birdeye
const birdeyeChainMap = {
  'solana': 'solana',
  'ethereum': 'ethereum',
  'bsc': 'bsc',
  'base': 'base'
};

// Price analysis tool links
export const priceAnalyzeLinks = [
  {
    name: 'Chain.fm',
    url: 'chain.fm',
    fullUrl: (address) => `https://chain.fm/channel/1305397292697653436?token=${address}`,
  },
  {
    name: 'DexScreener',
    url: 'dexscreener.com',
    fullUrl: (address, chainId) => {
      const chainPath = dexScreenerChainMap[chainId?.toLowerCase()] || 'solana';
      return `https://dexscreener.com/${chainPath}/${address}`;
    }
  },
  {
    name: 'GeckoTerminal',
    url: 'geckoterminal.com',
    fullUrl: (address, chainId) => {
      const chainPath = geckoTerminalChainMap[chainId?.toLowerCase()] || 'solana';
      return `https://www.geckoterminal.com/${chainPath}/pools/${address}`;
    }
  },
  {
    name: 'Ave',
    url: 'ave.ai',
    fullUrl: (address, chainId) => {
      const chain = aveChainMap[chainId?.toLowerCase()] || 'eth';
      return `https://ave.ai/token/${address}-${chain}`;
    }
  },
  {
    name: 'DexTools',
    url: 'dextools.io',
    fullUrl: (address, chainId) => {
      const chainPath = dexToolsChainMap[chainId?.toLowerCase()] || 'solana';
      return `https://www.dextools.io/app/cn/${chainPath}/pair-explorer/${address}`;
    }
  },
  {
    name: 'Birdeye',
    url: 'birdeye.so',
    fullUrl: (address, chainId) => {
      const chainPath = birdeyeChainMap[chainId?.toLowerCase()] || 'solana';
      return `https://www.birdeye.so/token/${address}?chain=${chainPath}`;
    }
  },
  {
    name: 'UniversalX',
    url: 'universalx.app',
    fullUrl: (address, chainId) => `https://universalx.app/tokens/${address}`,
  },
  // {
  //   name: 'Pump News',
  //   url: 'pump.news',
  //   fullUrl: (address) => `https://www.pump.news/zh/${address}`
  // },
  {
    name: 'Pump.fun',
    url: 'pump.fun',
    fullUrl: (address) => `https://pump.fun/coin/${address}`,
    twitterUsername: 'pumpdotfun'
  },
];

// Token analysis tool links
export const analyzeLinks = [
  {
    name: 'BullX',
    url: 'bullx.io',
    fullUrl: (address, chainId) => {
      const chainPath = bullxChainMap[chainId?.toLowerCase()] || '1399811149';
      return `https://bullx.io/terminal?chainId=${chainPath}&address=${address}`;
    }
  },

  {
    name: 'Photon',
    url: 'photon-sol.tinyastro.io', 
    fullUrl: (address, chainId) => `https://photon-sol.tinyastro.io/zh/lp/${address}`
  },
  
 
  {
    name: 'GMGN',
    url: 'gmgn.ai',
    fullUrl: (address, chainId) => {
      const chainPath = chainPathMap[chainId?.toLowerCase()] || 'sol';
      return `https://gmgn.ai/${chainPath}/token/${address}`;
    }
  },
  {
    name: 'DEBOT',
    url: 'debot.ai',
    fullUrl: (address, chainId) => {
      const chainPath = debotChainMap[chainId?.toLowerCase()] || 'solana';
      return `https://debot.ai/token/${chainPath}/${address}`;
    }
  },
  {
    name: 'OKX',
    url: 'okx.com',
    fullUrl: (address, chainId) => {
      const chainPath = okxChainMap[chainId?.toLowerCase()] || '501';
      return `https://www.okx.com/web3/detail/${chainPath}/${address}`;
    }
  },
  {
    name: 'XXYY',
    url: 'xxyy.io',
    fullUrl: (address, chainId) => {
      const chainPath = chainPathMap[chainId?.toLowerCase()] || 'sol';
      return `https://www.xxyy.io/${chainPath}/${address}`;
    }
  },
].filter(link => !priceAnalyzeLinks.find(p => p.name === link.name));

// Telegram bot links
export const botLinks = [

  {
    name: 'GMGNBot',
    url: 't.me',
    fullUrl: (address) => `https://t.me/GMGN_sol04_bot?start=i_lu7HSsHm_c_${address}`,
    twitterUsername: 'gmgnai'
  },
  {
    name: 'BananaGunBot',
    url: 't.me',
    fullUrl: (address) => `https://t.me/BananaGun_bot?start=ref_dalechn${address}`,
    twitterUsername: 'BananaGunBot'
  },
  {
    name: 'MaestroBot',
    url: 't.me',
    fullUrl: (address) => `https://t.me/MaestroSniperBot?start=${address}-dalechn`,
    twitterUsername: 'MaestroBots'
  },
  {
    name: 'PepeBoostSolBot',
    url: 't.me',
    fullUrl: (address) => `https://t.me/pepeboost_sol_bot?start=ref_02mngy_ca_${address}`,
    twitterUsername: 'PepeBoost888'
  },
  // {
  //   name: 'BONKbot',
  //   url: 't.me',
  //   fullUrl: (address) => `https://t.me/bonkbot_bot?start=ref_1of35_${address}`,
  //   twitterUsername: 'bonkbot'
  // },
  // {
  //   name: 'TrojanBot',
  //   url: 't.me',
  //   fullUrl: (address) => `https://t.me/diomedes_trojanbot?start=${address}`,
  //   twitterUsername: 'TrojanOnSolana'
  // },
  {
    name: 'DogeeBot',
    url: 't.me',
    fullUrl: (address) => `https://t.me/Tars_Dogeebot?start=rt_17293733494312_${address}`,
    twitterUsername: 'dogee_io'
  }
]; 