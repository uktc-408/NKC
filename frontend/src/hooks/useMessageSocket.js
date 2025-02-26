import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import config from '@/config';

export const useMessageSocket = () => {
  const [contractsData, setContractsData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [tokenDataMap, setTokenDataMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  // Socket connection
  useEffect(() => {
    socketRef.current = io(config.api.wsUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current.on('connect', async () => {
      try {
        const response = await fetch(config.api.contractsBatch, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setContractsData(data);
          
          const contractMessages = Object.values(data).map(contract => ({
            type: 'content_generated',
            data: {
              contractAddress: contract.contractAddress,
              promotionCount: contract.promotionCount,
              smartMoneyCount: contract.smartMoneyCount,
              signalType: contract.signalType || 1,
              latestMessage: contract.latestMessage,
              tokenInfo: contract.tokenInfo,
              description: contract.description,
              price: contract.price,
              volume: contract.volume,
              marketCap: contract.marketCap,
              priceChange: {
                h1: contract.priceChange?.h1,
                h24: contract.priceChange?.h24
              },
              createdAt: contract.createdAt,
              twitter: contract.twitter,
              telegram: contract.telegram,
              website: contract.website,
              avatar: contract.avatar || contract.tokenInfo?.avatar
            },
            timestamp: (contract.timestamp * 1000) || Date.now(),
            id: `contract-${contract.contractAddress}`
          }));
          
          setAllMessages(contractMessages.sort((a, b) => b.timestamp - a.timestamp));
        }
      } catch (error) {
        console.error('Failed to get contract info during connection:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('botActivity');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Optimize the function to get all token data using batch requests
  const fetchAllTokensData = async () => {
    try {
      const contractAddresses = allMessages
        .filter(msg => msg.type === 'content_generated' && msg.data?.contractAddress)
        .map(msg => msg.data.contractAddress);

      if (contractAddresses.length === 0) return;

      const batchSize = 30;
      const batches = [];
      
      // Split addresses into batches of 30
      for (let i = 0; i < contractAddresses.length; i += batchSize) {
        batches.push(contractAddresses.slice(i, i + batchSize));
      }

      // 依次处理每个批次
      const newTokenDataMap = {};
      for (const batch of batches) {
        try {
          // Add delay to avoid too frequent requests
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const response = await axios.get(`${config.api.dexscreenerTokens}/${config.chainId}/${batch.join(',')}`);
          console.log('Tokens Batch Response:', response.data);

          response.data.forEach(token => {
            newTokenDataMap[token.baseToken.address] = {
              name: token.baseToken?.name || 'Unknown',
              symbol: token.baseToken?.symbol || 'Unknown',
              marketCap: token.marketCap || 0,
              priceUsd: token.priceUsd || 0,
              liquidity: token.liquidity?.usd || 0,
              priceChange: {
                h1: token.priceChange?.h1 || 0,
                h24: token.priceChange?.h24 || 0
              },
              imageUrl: token.info?.avatar || '',
              avatar: token.info?.avatar || ''
            };
          });
        } catch (error) {
          console.error('Failed to get batch token data:', error);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer when error occurs
          continue;
        }
      }

      setTokenDataMap(prev => ({
        ...prev,
        ...newTokenDataMap
      }));
    } catch (error) {
      console.error('Failed to get bulk token data:', error);
    }
  };

  const handleBotActivity = (callback) => {
    if (!socketRef.current) return;

    socketRef.current.on('botActivity', (newData) => {
      setAllMessages(prev => {
        if (newData.type === 'content_generated' && newData.data?.contractAddress) {
          callback(newData);
          return [
            newData,
            ...prev.filter(msg => 
              msg.type !== 'content_generated' || 
              msg.data?.contractAddress !== newData.data.contractAddress
            )
          ];
        }
        return [newData, ...prev];
      });
    });
  };

  return {
    contractsData,
    allMessages,
    tokenDataMap,
    fetchAllTokensData,
    handleBotActivity,
    socketRef,
    isLoading
  };
}; 