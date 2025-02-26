import { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import SearchHistory from './SearchHistory';
import MobileSearchHistory from './MobileSearchHistory';
import { DB } from '../../utils/db';
import axios from 'axios';
import config from '../../../config';
import { useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import MobileSearchButton from './MobileSearchButton';

export default function SearchForm({ onSearch }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load search history
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Modify debounce search effect
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (input.trim().length >= 2) {
        setIsSearching(true);
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        // Create new AbortController
        abortControllerRef.current = new AbortController();
        
        try {
          const response = await axios.get(
            `${config.api.dexscreenerSearch}?q=${input.trim()}`,
            { signal: abortControllerRef.current.signal }
          );
          setSearchResults(response.data.pairs || []);
          setShowHistory(true);
        } catch (error) {
          if (error.name === 'CanceledError') {
            // Request cancelled, do nothing
            return;
          }
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimeout);
      // Cancel ongoing request when component unmounts or input updates
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [input]);

  const loadSearchHistory = async () => {
    try {
      const history = await DB.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  const handleDirectSearch = (input) => {
    // 验证是否为有效的以太坊或 Solana 地址
    const isValidEthAddress = ethers.isAddress(input);
    let isValidSolAddress = false;
    try {
      new PublicKey(input);
      isValidSolAddress = true;
    } catch (error) {
      isValidSolAddress = false;
    }

    if (!isValidEthAddress && !isValidSolAddress) {
      setError(t('log.invalidAddress'));
      // 添加 3 秒后清除错误信息
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    const params = {
      address: input,
      mode: 'contract',
      fromSearchButton: true
    };
    handleSearch(params);
    // navigate(`/${input}`);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) {
      setError(t('log.enterContent'));
      // 添加 3 秒后清除错误信息
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }
    
    // 如果有搜索结果，使用第一个结果
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      onSearch({ 
        address: firstResult.baseToken.address, 
        mode: 'contract',
        fromSearchButton: true
      });
      setShowHistory(false);  // 关闭下拉窗口
    } else {
      // 如果没有搜索结果，直接搜索输入的内容
      handleDirectSearch(input.trim());
    }
  };

  const handleSearch = async (searchParams) => {
    // 根据是否是搜索按钮触发来决定是否清空输入框
    if (!searchParams.fromSearchButton && !searchParams.fromSearchResults) {
       // if (searchParams.mode === 'contract') {
      //   setInput(searchParams.address);
      // } else {
      //   setInput(searchParams.username);
      // }
      setInput('');
    }
    
    try {
      const query = searchParams.mode === 'contract' ? searchParams.address : searchParams.username;
      
      // 获取现有历史记录
      let history = await DB.getSearchHistory();
      
      // 移除相同query的旧记录
      history = history.filter(item => item.query !== query);
      
      // 添加新记录到开头
      const newRecord = {
        query,
        mode: searchParams.mode,
        timestamp: new Date().toISOString()
      };

      if (searchParams.fromHistory) {
        newRecord.avatar = searchParams.avatar || null;
        newRecord.tokenName = searchParams.tokenName || null;
      } else if (searchParams.fromSearchResults && searchResults.length > 0) {
        const token = searchResults.find(t => t.baseToken.address === searchParams.address);
        if (token) {
          newRecord.avatar = token.info?.imageUrl || null;
          newRecord.tokenName = token.baseToken.name || null;
        }
      }
      
      // 将新记录添加到历史记录的开头
      history.unshift(newRecord);
      
      // 更新数据库
      await DB.clearSearchHistory();
      for (const record of history) {
        await DB.addSearchHistory(record);
      }
      
      await loadSearchHistory();
      onSearch(searchParams);
      setShowHistory(false);
      setSearchResults([]);
    } catch (error) {
      console.error('保存搜索历史失败:', error);
      onSearch(searchParams);
    }
  };

  const clearHistory = async () => {
    try {
      // 取消正在进行的搜索请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsSearching(false);
      setSearchResults([]);
      setInput('');  // 清空输入框
      await DB.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  };

  const handleClose = () => {
    setShowHistory(false);
    setSearchResults([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-form-container')) {
        setShowHistory(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modify input onFocus handler
  const handleInputFocus = async () => {
    setShowHistory(true);
    // Reload search history
    await loadSearchHistory();
  };

  return (
    <div className="relative search-form-container">
      {/* Show search icon on mobile, search box on desktop */}
      <div className="md:hidden">
        <MobileSearchButton 
          onClick={handleInputFocus}
        />
      </div>

      <div className="hidden md:block w-full">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="relative flex items-center h-9">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError('');
                      setShowHistory(true);
                    }}
                    onFocus={handleInputFocus}
                    className={`w-full h-9 px-4 bg-gray-800 border text-gray-100 focus:outline-none focus:border-cyan-500/50 appearance-none ${
                      error ? 'border-red-500/50' : 'border-gray-700'
                    }`}
                    placeholder={isMobile ? t('search.placeholder') : t('search.placeholder')}
                  />
                  {error && (
                    <div className="absolute top-full left-4 z-10 mt-2">
                      <div className="inline-block bg-red-500/90 text-white text-sm px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
                        {error}
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500/90 transform -rotate-45"></div>
                      </div>
                    </div>
                  )}
                  {input && (
                    <button
                      type="button"
                      onClick={() => setInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  {/* Search box bottom decoration line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                </div>
                {/* Only show search button on non-mobile */}
                {!isMobile && (
                  <button
                    type="submit"
                    className="bg-gray-800 text-gray-400 hover:text-cyan-400 px-4 focus:outline-none border border-gray-700 flex items-center h-9 transition-colors ml-px"
                  >
                    <FaSearch className="text-lg" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Show different search history component based on device type */}
      {isMobile ? (
        <MobileSearchHistory
          history={searchHistory}
          searchResults={searchResults}
          isSearching={isSearching}
          onSearch={handleSearch}
          onClear={clearHistory}
          visible={showHistory}
          onClose={() => setShowHistory(false)}
          searchInput={input}
          setSearchInput={setInput}
        />
      ) : (
        <SearchHistory
          history={searchHistory}
          searchResults={searchResults}
          isSearching={isSearching}
          onSearch={handleSearch}
          onClear={clearHistory}
          visible={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
} 