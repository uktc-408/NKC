import React, { useState, useEffect } from 'react';
import translate from 'translate';
import ImageViewer from '../Common/ImageViewer';
import TwitterAvatar from '../Common/TwitterAvatar';
import { formatTimeAgo } from '../../utils/time';
import { useTranslation } from 'react-i18next';

// 配置翻译引擎
translate.engine = 'google';
translate.from = 'en';
translate.to = 'zh';

// 格式化推文内容的函数
const formatTweetContent = (content) => {
  if (!content) return '';
  
  // 处理链接、@用户名和话题标签
  return content
    .split(/\s+/)
    .map((word, i) => {
      if (word.startsWith('http')) {
        return (
          <a 
            key={i}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {word}
          </a>
        );
      } else if (word.startsWith('@')) {
        return (
          <a
            key={i}
            href={`https://twitter.com/${word.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {word}
          </a>
        );
      } else if (word.startsWith('#')) {
        return (
          <a
            key={i}
            href={`https://twitter.com/hashtag/${word.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {word}
          </a>
        );
      }
      return word + ' ';
    });
};

export default function TweetList({ 
  tweets, 
  title, 
  searchAddress, 
  onImagePreview,
  showTitle = true,
  containerClassName = "bg-gray-900/50 rounded-lg shadow-lg border border-cyan-500/20 backdrop-blur-sm p-2 sm:p-4",
  isExpanded,
  onToggleExpand,
  showExpandButton = true
}) {
  const { t, i18n } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [translatingIds, setTranslatingIds] = useState(new Set());
  
  // 修改图片点击处理函数
  const handleImageClick = (imageUrl) => {
    onImagePreview(imageUrl);
  };

  if (!tweets?.length) return null;

  const displayTweets = isExpanded ? tweets : tweets.slice(0, 1);

  const handleTranslate = async (tweetId, text) => {
    // 移除所有 HTML 标签，获取纯文本内容
    const plainText = text ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    
    // 如果没有文本内容，则返回
    if (!plainText) return;
    
    // 生成唯一的翻译ID，使用推文ID和文本内容组合
    const translationKey = `${tweetId}-${plainText}`;
    
    // 如果已经有翻译，则切换显示/隐藏
    if (translations[translationKey]) {
      setTranslations(prev => ({
        ...prev,
        [translationKey]: {
          ...prev[translationKey],
          show: !prev[translationKey].show
        }
      }));
      return;
    }

    // 开始翻译
    setTranslatingIds(prev => new Set(prev).add(translationKey));
    try {
      const result = await translate(plainText, { to: 'zh' });
      setTranslations(prev => ({
        ...prev,
        [translationKey]: {
          text: result,
          show: true
        }
      }));
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(translationKey);
        return newSet;
      });
    }
  };

  return (
    <div>
      {showTitle && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
            <div className="relative">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {title === t('tweets.userTweets') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                ) : title === t('tweets.tweetDetails') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                )}
              </svg>
              <div className="absolute inset-0 bg-cyan-400/20 blur-[6px] -z-10"></div>
            </div>
            {title === t('tweets.userTweets') ? t('tweets.userTweets') :
             title === t('tweets.tweetDetails') ? t('tweets.tweetDetails') :
             t('tweets.searchResults')}
          </h3>
          <div className="flex items-center gap-4">
            {showExpandButton && tweets.length > 1 && (
              <button
                onClick={onToggleExpand}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium focus:outline-none"
              >
                {isExpanded ? t('common.showLess') : t('common.showMore1', { count: tweets.length })}
              </button>
            )}
            {title === t('tweets.userTweets') && tweets[0] && (
              <a 
                href={`https://twitter.com/${tweets[0].username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-1"
              >
                {t('tweets.openInTwitter')} <svg width='20' height='20' viewBox='0 0 24 24' style={{transform: 'scale(0.9)'}}>
                  <path 
                    fill='currentColor' 
                    d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
                  />
                </svg>
              </a>
            )}
            {searchAddress && title === t('search.searchResults') && (
              <a
                href={`https://x.com/search?q=${searchAddress}&src=typed_query`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-1"
              >
                {t('tweets.searchInTwitter')} <svg width='20' height='20' viewBox='0 0 24 24' style={{transform: 'scale(0.9)'}}>
                  <path 
                    fill='currentColor' 
                    d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      <div className={containerClassName}>
        <div className="space-y-3">
          {(isExpanded ? tweets : tweets.slice(0, 1)).map((tweet) => {
            // 为每条推文生成唯一的翻译key
            const translationKey = `${tweet.id}-${tweet.text?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`;
            
            return (
              <div key={tweet.id} className="border-b border-gray-700/30 pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2 w-full">
                    <TwitterAvatar 
                      username={tweet.username} 
                      name={tweet.name}
                    />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold truncate text-gray-200">{tweet.name}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-400 truncate text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">@{tweet.username}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-400 text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
                            {formatTimeAgo(tweet.timeParsed)}
                          </span>
                        </div>
                        <a 
                          href={`https://twitter.com/${tweet.username}/status/${tweet.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <svg width='20' height='20' viewBox='0 0 24 24' style={{transform: 'scale(0.9)'}}>
                            <path 
                              fill='currentColor' 
                              d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
                            />
                          </svg>
                        </a>
                      </div>
                      
                      <div className="mt-2 whitespace-pre-wrap text-gray-300 break-words" style={{ 
                        fontFamily: "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
                      }}>
                        {tweet.text ? (
                          <>
                            <div 
                              className="max-w-full"
                              dangerouslySetInnerHTML={{ 
                                __html: tweet.text.replace(
                                  /<a href="([^"]+)">/g, 
                                  '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">'
                                ).replace(
                                  /<img([^>]+)>/g,
                                  '' // 移除原始的图片标签
                                )
                              }} 
                            />
                            {/* 单独渲染图片 */}
                            {tweet.text.match(/<img[^>]+src="([^"]+)"[^>]*>/g)?.length > 0 && (
                              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {tweet.text.match(/<img[^>]+src="([^"]+)"[^>]*>/g)?.map((img, index) => {
                                  const src = img.match(/src="([^"]+)"/)[1];
                                  return (
                                    <img
                                      key={index}
                                      src={src}
                                      className="rounded-lg w-full h-[200px] object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleImageClick(src);
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="break-words">
                            {formatTweetContent(tweet.text)}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        {/* 只在当前语言为中文时显示翻译按钮 */}
                        {i18n.language === 'zh' && (
                          <button
                            onClick={() => handleTranslate(tweet.id, tweet.text)}
                            disabled={translatingIds.has(translationKey)}
                            className={`text-sm px-3 py-1 rounded-md transition-colors ${
                              translatingIds.has(translationKey)
                                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                                : translations[translationKey]
                                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                                  : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                            }`}
                          >
                            {translatingIds.has(translationKey)
                              ? '翻译中...' 
                              : translations[translationKey]
                                ? (translations[translationKey].show ? '收起翻译' : '显示翻译')
                                : '翻译'}
                          </button>
                        )}
                        
                        {translations[translationKey]?.show && (
                          <div className="mt-2 p-3 bg-gray-800/50 rounded-md">
                            <p className="text-gray-300">{translations[translationKey].text}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 媒体内容 */}
                      {tweet.media?.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {tweet.media.map((media, index) => (
                            <img
                              key={index}
                              src={media.url}
                              alt="Tweet media"
                              className="rounded-lg w-full h-[200px] object-cover hover:opacity-90 transition-opacity cursor-pointer"
                              data-preview-url={media.url}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleImageClick(media.url);
                              }}
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 flex space-x-8">
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                          </svg>
                          <span>{tweet.replies}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                          </svg>
                          <span>{tweet.retweets}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          <span>{tweet.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 