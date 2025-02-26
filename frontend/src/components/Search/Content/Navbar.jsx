import SearchForm from '../Search/SearchForm';
import config from '@/config';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';
import { useState, useEffect, useRef } from 'react';
import Flag from 'react-world-flags';
import LoginButton from '../Auth/LoginButton';

export default function Navbar({ onSearch }) {
  const { i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle language change
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('displayLanguage', lang);
    const event = new CustomEvent('languageChange', { detail: lang });
    window.dispatchEvent(event);
    setShowLangMenu(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes nav-scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        .nav-animate-scan {
          animation: nav-scan 2s linear infinite;
        }
        
        @keyframes nav-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .nav-animate-pulse-slow {
          animation: nav-pulse 4s ease-in-out infinite;
        }

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

        /* Add neon logo animation */
        @keyframes neon-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 2px #8b5cf6) drop-shadow(0 0 4px #8b5cf6);
          }
          50% {
            filter: drop-shadow(0 0 4px #8b5cf6) drop-shadow(0 0 8px #8b5cf6);
          }
        }

        .neon-logo {
          animation: neon-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div 
        className="fixed top-0 left-0 right-0 bg-gray-900/80 md:bg-gray-900/30 z-[999]"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('closeSlideUp'));
        }}
      >
        {/* Top decorative line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        {/* Left decoration */}
        <div className="absolute left-0 top-0 h-full w-16 overflow-hidden hidden md:block">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-cyan-500/20"></div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-cyan-500/40 rounded-full animate-pulse-slow"></div>
        </div>

        {/* Right decoration */}
        <div className="absolute right-0 top-0 h-full w-16 overflow-hidden hidden md:block">
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-cyan-500/20"></div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-cyan-500/40 rounded-full animate-pulse-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-0 md:px-4 sm:px-6 lg:px-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 flex justify-between opacity-10">
            <div className="w-32 h-full bg-gradient-to-r from-blue-400/20 to-transparent"></div>
            <div className="w-32 h-full bg-gradient-to-l from-blue-400/20 to-transparent"></div>
          </div>

          <div className="flex justify-between items-center h-16 relative">
            {/* Logo */}
            <div className="flex items-center">
              <div className="mr-3">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 100 100" 
                  className="neon-logo"
                >
                  {/* 外圈 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#67e8f9"
                    strokeWidth="2"
                  />
                  
                  {/* 内圈 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="20"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                  
                  {/* 十字准星 - 缩短了长度 */}
                  <line x1="50" y1="20" x2="50" y2="80" stroke="#8b5cf6" strokeWidth="1.5" />
                  <line x1="20" y1="50" x2="80" y2="50" stroke="#8b5cf6" strokeWidth="1.5" />
                  
                  {/* 角落刻度 - 调整了位置和大小 */}
                  <line x1="40" y1="40" x2="35" y2="35" stroke="#67e8f9" strokeWidth="1.5" />
                  <line x1="60" y1="40" x2="65" y2="35" stroke="#67e8f9" strokeWidth="1.5" />
                  <line x1="40" y1="60" x2="35" y2="65" stroke="#67e8f9" strokeWidth="1.5" />
                  <line x1="60" y1="60" x2="65" y2="65" stroke="#67e8f9" strokeWidth="1.5" />
                  
                  {/* 中心点 - 缩小了大小 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="2"
                    fill="#8b5cf6"
                  />
                </svg>
              </div>
              
              <div 
                className="relative font-mono text-xl font-bold cursor-pointer"
                // onClick={(e) => {
                //   window.dispatchEvent(new CustomEvent('closeSlideUp'));
                // }}
              >
                <div className="relative px-2.5 py-1 bg-gray-800 rounded-md border border-cyan-500/30">
                  <span className="relative z-10 flex items-center">
                    <span className="text-cyan-400 text-base">&lt;</span>
                    <span className="text-gray-100 tracking-tight font-['Press_Start_2P'] text-sm">AI</span>
                    <span className="text-cyan-400 font-['Press_Start_2P'] text-sm">PHA</span>
                    <span className="text-cyan-400 text-base">/&gt;</span>
                  </span>
                  
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent nav-animate-scan"></div>
                  </div>
                </div>

                {/* <div className="absolute -top-2 -right-24 flex items-center">
                  <span className="text-[10px] font-medium text-gray-400 font-['Press_Start_2P']">
                    v2.0
                  </span>
                  <span className="ml-2 text-[10px] font-mono text-cyan-500/70 tracking-tighter">
                    [|=//=|]
                  </span>
                </div> */}
              </div>
            </div>

            {/* Search form section */}
            <div 
              className="flex-1 max-w-2xl mx-8 relative hidden md:block"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search box decoration - desktop only */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400/20 rounded-full"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400/20 rounded-full"></div>
              <SearchForm onSearch={onSearch} />
            </div>

            {/* Social links section */}
            <div className="flex items-center space-x-4">
              {/* Mobile search button */}
              <div className="md:hidden">
                <SearchForm onSearch={onSearch} />
              </div>

              {/* Login button component */}
              <LoginButton />

              {/* Language switch button */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLangMenu(!showLangMenu);
                  }}
                  className="nav-social-icon p-2 rounded-lg bg-gray-800/50 border border-cyan-500/20 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center"
                >
                  <span className="text-sm font-medium whitespace-nowrap leading-5 h-5 flex items-center">
                    {i18n.language === 'en' ? 'EN' : 'ZH'}
                  </span>
                </button>

                {showLangMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1" role="menu">
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full"
                      >
                        <Flag code="US" className="w-5 h-5 mr-2" />
                        English
                      </button>
                      <button
                        onClick={() => handleLanguageChange('zh')}
                        className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full"
                      >
                        <Flag code="CN" className="w-5 h-5 mr-2" />
                        简体中文
                      </button>
                    </div>
                  </div>
                )}
              </div>

          
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 