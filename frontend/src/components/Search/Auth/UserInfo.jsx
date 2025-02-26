import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function UserInfo({ user, onLogout, isOpen, onClose }) {
  const { t } = useTranslation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      console.log('UserInfo opened with user data:', user);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="py-1" role="menu">
        <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="truncate flex-1 mr-2">
              {(user.twitterUsername || user.username).includes('@') 
                ? (user.twitterUsername || user.username)
                : `@${user.twitterUsername || user.username}`}
            </span>
            {user.twitterUsername && (
              <a
                href={`https://x.com/${user.twitterUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-gray-100 flex-shrink-0"
                title={t('auth.userInfo.openInX')}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path 
                    fill="currentColor" 
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
            )}
          </div>
          {user.email && (
            <div className="text-xs text-gray-500 mt-1">{user.email}</div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
        >
          {t('auth.userInfo.logout')}
        </button>
      </div>
    </div>
  );
} 