import { useState, useEffect, useRef } from 'react';
import LoginModal from './LoginModal';
import UserInfo from './UserInfo';

export default function LoginButton() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [user, setUser] = useState(null);
  const userInfoRef = useRef(null);

  const handleLogin = (userData) => {
    console.log('Login userData:', userData);
    // Create a new user object, using username as twitterUsername
    const enhancedUserData = {
      ...userData,
      twitterUsername: userData.username
    };
    setUser(enhancedUserData);
    setShowLoginModal(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setShowUserInfo(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // Check login status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <style jsx>{`
        /* Add neon effect animation for social buttons */
        @keyframes nav-neon-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 1px #67e8f9);
          }
          50% { 
            filter: drop-shadow(0 0 2px #67e8f9);
          }
        }
        .nav-social-icon {
          transition: all 0.3s ease;
        }
        .nav-social-icon:hover {
          animation: nav-neon-pulse 2s ease-in-out infinite;
          transform: scale(1.05);
        }
      `}</style>

      {user ? (
        <div className="relative" ref={userInfoRef}>
          <button
            onClick={(e) => {
              console.log('Current user data:', user);
              e.stopPropagation();
              setShowUserInfo(!showUserInfo);
            }}
            className="nav-social-icon p-2 rounded-lg bg-gray-800/50 border border-cyan-500/20 text-gray-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center w-9 h-9"
          >
            {user.twitterUsername ? (
              <img
                src={`https://unavatar.io/twitter/${user.twitterUsername}`}
                alt={user.username}
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  console.log('Avatar load error for user:', user);
                  e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=0D2235&color=67e8f9`;
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${user.username}&background=0D2235&color=67e8f9`}
                alt={user.username}
                className="w-full h-full rounded-lg object-cover"
              />
            )}
          </button>
          <UserInfo
            user={user}
            onLogout={handleLogout}
            isOpen={showUserInfo}
            onClose={() => setShowUserInfo(false)}
          />
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowLoginModal(true);
          }}
          className="nav-social-icon p-2 rounded-lg bg-gray-800/50 border border-cyan-500/20 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors w-9 h-9 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
} 