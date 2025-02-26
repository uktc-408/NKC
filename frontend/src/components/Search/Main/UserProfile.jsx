import { useTranslation } from 'react-i18next';
import TweetList from './TweetList';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import ImagePreviewModal from '../Token/ImagePreviewModal';

export default function UserProfile({ user }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  if (!user) return null;

  const displayTweets = user.tweets ? (isExpanded ? user.tweets : user.tweets.slice(0, 1)) : [];

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-2 px-2 sm:px-0">
        <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
          <div className="relative">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="absolute inset-0 bg-cyan-400/20 blur-[6px] -z-10"></div>
          </div>
          {t('profile.userInfo')}
        </h3>
        <div className="flex items-center gap-4">
          {user.tweets?.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium focus:outline-none"
            >
              {isExpanded ? t('common.showLess') : t('common.showMore1', { count: user.tweets.length })}
            </button>
          )}
          {user.username && (
            <a 
              href={`https://twitter.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-1"
            >
              {t('profile.openInTwitter')} <svg width='20' height='20' viewBox='0 0 24 24' style={{transform: 'scale(0.9)'}}>
                <path 
                  fill='currentColor' 
                  d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
                />
              </svg>
            </a>
          )}
        </div>
      </div>
      <div className="bg-gray-900/50 rounded-lg shadow-lg border border-cyan-500/20 backdrop-blur-sm overflow-hidden">
        <div 
          className="h-32 w-full bg-cover bg-center" 
          style={{ 
            backgroundImage: user.banner 
              ? `url(${user.banner})` 
              : 'linear-gradient(to right, #4a90e2, #63b3ed)'
          }} 
        />
        
        <div className="relative p-2 sm:p-4">
          {user.avatar && (
            <>
              <img
                src={user.avatar}
                alt={user.name}
                className="absolute -top-10 left-4 w-20 h-20 rounded-full border-4 border-gray-900 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowAvatarModal(true)}
              />
              {showAvatarModal && (
                <ImagePreviewModal
                  image={user.avatar}
                  alt={user.name}
                  onClose={() => setShowAvatarModal(false)}
                />
              )}
            </>
          )}
          
          <div className="mt-10 space-y-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-bold text-gray-200">{user.name}</h2>
                <span className="text-gray-400 text-sm font-medium opacity-80">@{user.username}</span>
              </div>
            </div>
            
            {user.biography && (
              <p className="mt-5 text-gray-300 whitespace-pre-wrap break-words">{user.biography}</p>
            )}
            
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">
              {user.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{user.location}</span>
                </div>
              )}
              {user.joined && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t('profile.joinedAt', { date: new Date(user.joined).toLocaleDateString() })}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-y-3 gap-x-6">
              <div>
                <span className="font-bold text-gray-200">{user.followersCount}</span>
                <span className="text-gray-400 ml-1">{t('profile.followers')}</span>
              </div>
              <div>
                <span className="font-bold text-gray-200">{user.followingCount}</span>
                <span className="text-gray-400 ml-1">{t('profile.following')}</span>
              </div>
              <div>
                <span className="font-bold text-gray-200">{user.tweetsCount}</span>
                <span className="text-gray-400 ml-1">{t('profile.tweets')}</span>
              </div>
              <div>
                <span className="font-bold text-gray-200">{user.likesCount}</span>
                <span className="text-gray-400 ml-1">{t('profile.likes')}</span>
              </div>
            </div>

            {user.website && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  {user.website}
                </a>
              </div>
            )}
          </div>

          {displayTweets.length > 0 && (
            <div className="mt-6 border-t border-gray-700/30 pt-6">
              <TweetList 
                tweets={displayTweets}
                showTitle={false}
                containerClassName="!shadow-none !bg-transparent !p-0"
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 