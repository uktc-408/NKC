import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UserAnalysis from '../Main/UserAnalysis';
import UserProfile from '../Main/UserProfile';
import TokenInfo from '../Token/TokenInfo';
import TokenAnalytics from '../Token/TokenAnalytics';
import WebsitePreview from '../Main/WebsitePreview';
import TweetList from '../Main/TweetList';
import LoadingSpinner from '../Common/LoadingSpinner';
import ImageViewer from '../Common/ImageViewer';
import { DB } from '../../utils/db';
import config from '@/config';

export default function TwitterSearchResults({ searchParams, onImagePreview }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchProgress, setSearchProgress] = useState(null);
  const [searchAddress, setSearchAddress] = useState(null);
  const [isSearchResultsExpanded, setIsSearchResultsExpanded] = useState(false);
  const [currentEventSource, setCurrentEventSource] = useState(null);

  useEffect(() => {
    if (searchParams) {
      handleSearch(searchParams);
    }
    
    return () => {
      if (currentEventSource) {
        currentEventSource.close();
        setCurrentEventSource(null);
      }
    };
  }, [searchParams]);

  const handleSearch = async (searchParams) => {
    if (currentEventSource) {
      currentEventSource.close();
      setCurrentEventSource(null);
    }

    setLoading(true);
    setSearchProgress(searchParams.mode === 'contract' ? 
      t('search.progress.gettingInfo') : 
      t('search.progress.searchingUser')
    );
    
    setData(null);
    setError(null);
    setIsSearchResultsExpanded(false);
    
    if (searchParams.mode === 'contract') {
      setSearchAddress(searchParams.address);
    } else {
      setSearchAddress(null);
    }

    try {
      const queryParams = new URLSearchParams();
      if (searchParams.mode === 'username') {
        queryParams.append('username', searchParams.username);
        queryParams.append('mode', 'username');
      } else {
        queryParams.append('address', searchParams.address);
        queryParams.append('mode', 'contract');
      }

      const eventSource = new EventSource(
        `${config.api.baseUrl}/api/twitter/search/stream?${queryParams.toString()}`,
        { withCredentials: true }
      );
      
      setCurrentEventSource(eventSource);

      eventSource.addEventListener('tokenInfo', async (event) => {
        const tokenData = JSON.parse(event.data);
        setSearchProgress(t('search.progress.searchingProject'));
        
        if (tokenData.tokenInfo && tokenData.tokenInfo.name !== 'Name not found') {
          try {
            const history = await DB.getSearchHistory();
            const existingRecord = history.find(item => item.query === searchParams.address);
            
            if (existingRecord) {
              await DB.addSearchHistory({
                ...existingRecord,
                timestamp: new Date().toISOString(),
                tokenName: tokenData.tokenInfo.name,
                avatar: tokenData.tokenInfo.avatar
              });
            } else {
              await DB.addSearchHistory({
                query: searchParams.address,
                mode: 'contract',
                timestamp: new Date().toISOString(),
                tokenName: tokenData.tokenInfo.name,
                avatar: tokenData.tokenInfo.avatar
              });
            }

            await DB.addTokenInfo({
              address: searchParams.address,
              name: tokenData.tokenInfo.name
            });
          } catch (error) {
            console.error('Save token info failed:', error);
          }
        }
        
        setData(prevData => ({
          ...prevData,
          tokenInfo: tokenData.tokenInfo
        }));
      });

      eventSource.onmessage = (event) => {
        console.log('Received message:', event.data);
      };

      eventSource.addEventListener('userDataComplete', (event) => {
        const userData = JSON.parse(event.data);
        setSearchProgress(t('search.progress.analyzingProject'));
        setData(prevData => ({
          ...prevData,
          userInfo: userData.userInfo,
          tweets: userData.tweets,
          tokenInfo: userData.tokenInfo || prevData?.tokenInfo
        }));
      });

      eventSource.addEventListener('contractDataComplete', (event) => {
        const contractData = JSON.parse(event.data);
        setSearchProgress(t('search.progress.searchingTwitter'));
        setData(prevData => ({
          ...prevData,
          searchResults: contractData.searchResults,
          tokenInfo: contractData.tokenInfo || prevData?.tokenInfo
        }));
      });

      eventSource.addEventListener('analysisComplete', (event) => {
        const analysisData = JSON.parse(event.data);
        setData(prevData => ({
          ...prevData,
          userProfile: analysisData.userProfile
        }));
        setLoading(false);
        setSearchProgress(null);
        eventSource.close();
        setCurrentEventSource(null);
      });

      eventSource.addEventListener('error', (event) => {
        const errorData = event.data ? JSON.parse(event.data) : { error: t('errors.connectionLost') };
        let errorMessage = errorData.error;
        
        console.log('Error message:', errorMessage);
        // Check if error message contains "rest_id not found"
        if (errorMessage && errorMessage.includes('rest_id not found')) {
          errorMessage = t('errors.accountSuspended');
        }
        
        setError(errorMessage);
        setLoading(false);
        setSearchProgress(null);
        eventSource.close();
        setCurrentEventSource(null);
      });

    } catch (error) {
      setError(error.response?.data?.error || error.message);
      setLoading(false);
      setSearchProgress(null);
      if (currentEventSource) {
        currentEventSource.close();
        setCurrentEventSource(null);
      }
    }
  };

  return (
    <>
      {loading && (
        <div className="mt-0">
          <LoadingSpinner text={searchProgress || t('common.loading')} />
        </div>
      )}
      
      {error && (
        <div className="mt-4 mb-8">
          <div className="p-4 bg-gray-800/50 border border-red-500/30 rounded-lg">
            <div className="flex flex-col items-center">
              <p className="mb-3 text-red-400">{error}</p>
              <button
                onClick={() => handleSearch(searchParams)}
                className="px-4 py-2 rounded-lg bg-gray-800/50 border border-cyan-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center space-x-2"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                <span>{t('common.retry')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {data && (
        <div className="mb-8 space-y-6 w-full overflow-x-hidden">
          {data.userProfile && (
            <UserAnalysis 
              analysis={data.userProfile} 
              searchAddress={searchAddress}
            />
          )}
          {data.tokenInfo && (
            <TokenInfo 
              tokenInfo={data.tokenInfo} 
              searchAddress={searchAddress}
              onRefresh={(newTokenInfo) => {
                setData(prevData => ({
                  ...prevData,
                  tokenInfo: newTokenInfo
                }));
              }}
            />
          )}
          {searchAddress && data.tokenInfo && data.tokenInfo.name !== null && (
            <TokenAnalytics tokenInfo={data.tokenInfo} tokenAddress={searchAddress} />
          )}
          
            <div className="relative">
              {data.tokenInfo?.websiteLink && <WebsitePreview url={data.tokenInfo.websiteLink} />}
              {data.userInfo?.website && !data.tokenInfo?.websiteLink && (
                <WebsitePreview url={data.userInfo.website} />
              )}
            </div>
          
          {data.userInfo && <UserProfile user={{...data.userInfo, tweets: data.tweets}} />}
          {!data.userInfo && data.tweets && (
            <TweetList 
              tweets={data.tweets} 
              title={t('search.tweetDetails')}
              searchAddress={searchAddress}
              onImagePreview={onImagePreview}
              isExpanded={true}
              showExpandButton={false}
            />
          )}
          {data.searchResults && (
            <TweetList 
              tweets={data.searchResults} 
              title={t('search.searchResults')} 
              searchAddress={searchAddress}
              onImagePreview={onImagePreview}
              isExpanded={isSearchResultsExpanded}
              onToggleExpand={() => setIsSearchResultsExpanded(!isSearchResultsExpanded)}
            />
          )}
        </div>
      )}
    </>
  );
} 