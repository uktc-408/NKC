import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username, 
          password,
          email: '',
          twoFactorSecret: ''
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onLogin(data.user);
          onClose();
        }, 1000);
      } else {
        setError(data.error || t('auth.login.error.loginFailed'));
      }
    } catch (err) {
      setError(t('auth.login.error.requestFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); 
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[1000]
      ${isClosing ? 'animate-[loginFadeOut_0.2s_ease-in-out]' : 'animate-[loginFadeIn_0.2s_ease-in-out]'}`}
      onClick={(e) => {
        e.stopPropagation();
        handleBackdropClick(e);
      }}
    >
      <div 
        className={`bg-gray-900/90 p-6 border border-cyan-500/20 w-[420px] relative
        ${isClosing ? 'animate-[loginSlideOut_0.2s_ease-in-out]' : 'animate-[loginSlideIn_0.3s_ease-out]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <style jsx global>{`
          @keyframes loginFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes loginSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes loginFadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          @keyframes loginSlideOut {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(20px);
            }
          }
        `}</style>

        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          {/* Diagonal decorations */}
          <div className="absolute -right-20 top-10 w-40 h-[1px] bg-cyan-500/5 rotate-45"></div>
          <div className="absolute -left-20 bottom-10 w-40 h-[1px] bg-purple-500/5 -rotate-45"></div>
          
          {/* Tech-style circles */}
          <div className="absolute top-[10%] right-[10%] w-20 h-20 rounded-full border border-cyan-500/5 
            before:absolute before:inset-0 before:border before:border-cyan-500/10 before:rounded-full before:scale-150"></div>
          
          {/* Dot matrix decorations */}
          <div className="absolute top-[20%] left-[20%] grid grid-cols-3 gap-[2px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-[2px] h-[2px] bg-cyan-500/10"></div>
            ))}
          </div>
          <div className="absolute bottom-[20%] right-[20%] grid grid-cols-3 gap-[2px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-[2px] h-[2px] bg-purple-500/10"></div>
            ))}
          </div>

          {/* Decorative borders */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/2 via-purple-500/2 to-cyan-500/2"></div>
          
          {/* Top decorative line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          
          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500/20"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-cyan-500/20"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-cyan-500/20"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500/20"></div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 transition-colors z-50"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl text-gray-100 font-medium mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {t('auth.login.title.prefix')}
            {i18n.language === 'en' ? (
              <>
                {t('auth.login.title.with')}
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-6 h-6 ml-1 text-gray-100"
                >
                  <path 
                    fill="currentColor" 
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </>
            ) : (
              <>
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-6 h-6 mx-1 text-gray-100"
                >
                  <path 
                    fill="currentColor" 
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
                {t('auth.login.title.with')}
              </>
            )}
          </div>
          {/* <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('auth.login.twitterHint')}
          </div> */}
        </h2>

        {showSuccess && (
          <div className="text-green-400 mb-4 text-sm bg-green-500/10 border border-green-500/20 px-3 py-2 flex items-center">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('auth.login.success')}
          </div>
        )}

        {error && (
          <div className="text-red-400 mb-4 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 flex items-center break-words">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="flex-1 break-all">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <span className="text-gray-500">@</span>
              </div>
              <input
                type="text"
                placeholder={t('auth.login.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 pl-8 bg-gray-800/50 border border-cyan-500/30 text-gray-200 text-[16px] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-gray-500 placeholder:text-[16px] rounded-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-800/50 border border-cyan-500/30 text-gray-200 text-[16px] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-gray-500 placeholder:text-[16px] rounded-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-2">
            <a
              href="https://twitter.com/i/flow/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-1.5 text-sm border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300 relative group disabled:opacity-50 disabled:pointer-events-none"
              tabIndex={isLoading ? -1 : 0}
              aria-disabled={isLoading}
            >
              <span className="relative z-10 flex items-center">{t('auth.login.register')}</span>
            </a>
            <button
              type="submit"
              disabled={isLoading}
              className="block px-4 py-1.5 text-sm border border-pink-500/30 text-pink-400 transition-all duration-300 relative group 
              disabled:opacity-50 disabled:cursor-not-allowed
              enabled:hover:bg-pink-500/10 enabled:hover:border-pink-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('auth.login.loading')}
                  </>
                ) : (
                  t('auth.login.submit')
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
} 