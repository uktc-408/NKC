import { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import SearchHistory from './SearchHistory';
import { DB } from '../../utils/db';
import axios from 'axios';
import config from '../../../config';
import { useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

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

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      console.log('isMobile:', window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Debounce search effect
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (input.trim().length >= 2) {
        setIsSearching(true);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        try {
          const response = await axios.get(
            `${config.api.dexscreenerSearch}?q=${input.trim()}`,
            { signal: abortControllerRef.current.signal }
          );
          setSearchResults(response.data.pairs || []);
          setShowHistory(true);
        } catch (error) {
          if (error.name === 'CanceledError') return;
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowHistory(false);
      }
    }, 300);
    return () => {
      clearTimeout(debounceTimeout);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [input]);

  const loadSearchHistory = async () => {
    try {
      const history = await DB.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const handleDirectSearch = (inputValue) => {
    const isValidEthAddress = ethers.isAddress(inputValue);
    let isValidSolAddress = false;
    try {
      new PublicKey(inputValue);
      isValidSolAddress = true;
    } catch (error) {
      isValidSolAddress = false;
    }
    if (!isValidEthAddress && !isValidSolAddress) {
      setError(t('log.invalidAddress'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    const params = {
      address: inputValue,
      mode: 'contract',
      fromSearchButton: true,
    };
    handleSearch(params);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) {
      setError(t('log.enterContent'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      onSearch({
        address: firstResult.baseToken.address,
        mode: 'contract',
        fromSearchButton: true,
      });
      setShowHistory(false);
    } else {
      handleDirectSearch(input.trim());
    }
  };

  const handleSearch = async (searchParams) => {
    if (!searchParams.fromSearchButton && !searchParams.fromSearchResults) {
      setInput('');
    }
    try {
      const query =
        searchParams.mode === 'contract'
          ? searchParams.address
          : searchParams.username;
      let history = await DB.getSearchHistory();
      history = history.filter((item) => item.query !== query);
      const newRecord = {
        query,
        mode: searchParams.mode,
        timestamp: new Date().toISOString(),
      };
      if (searchParams.fromHistory) {
        newRecord.avatar = searchParams.avatar || null;
        newRecord.tokenName = searchParams.tokenName || null;
      } else if (
        searchParams.fromSearchResults &&
        searchResults.length > 0
      ) {
        const token = searchResults.find(
          (t) => t.baseToken.address === searchParams.address
        );
        if (token) {
          newRecord.avatar = token.info?.imageUrl || null;
          newRecord.tokenName = token.baseToken.name || null;
        }
      }
      history.unshift(newRecord);
      await DB.clearSearchHistory();
      for (const record of history) {
        await DB.addSearchHistory(record);
      }
      await loadSearchHistory();
      onSearch(searchParams);
      setShowHistory(false);
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to save search history:', error);
      onSearch(searchParams);
    }
  };

  const clearHistory = async () => {
    try {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setIsSearching(false);
      setSearchResults([]);
      setInput('');
      await DB.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const handleClose = () => {
    setShowHistory(false);
    setSearchResults([]);
  };

  // Attach global click listener only on mobile to hide history when clicking outside
  useEffect(() => {
    if (!isMobile) return;
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
  }, [isMobile]);

  const handleInputFocus = async () => {
    setShowHistory(true);
    await loadSearchHistory();
  };

  return (
    <div className="relative search-form-container">
      <form onSubmit={handleSubmit} className="w-full">
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
                  onBlur={() => {
                    // Only hide on mobile on blur
                    if (isMobile) {
                      setTimeout(() => setShowHistory(false), 150);
                    }
                  }}
                  className={`w-full h-9 px-4 bg-gray-800 border text-gray-100 focus:outline-none focus:border-cyan-500/50 appearance-none ${
                    error ? 'border-red-500/50' : 'border-gray-700'
                  }`}
                  placeholder={t('search.placeholder')}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
              </div>
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
      <SearchHistory
        history={searchHistory}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearch={handleSearch}
        onClear={clearHistory}
        visible={showHistory && searchResults.length > 0}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
