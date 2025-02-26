import { useEffect, useState, useRef } from 'react';

export default function SlideUp({ isOpen, onClose, children }) {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);

  // Detect device type
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); // 改回300ms
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Monitor scroll events
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      setShowScrollTop(content.scrollTop > 300);
    };

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    const handleCloseSlideUp = () => {
      if (isOpen) {
        onClose();
        // Clear URL path, keep only base URL
        window.history.pushState({}, '', window.location.origin);
      }
    };

    window.addEventListener('closeSlideUp', handleCloseSlideUp);
    return () => window.removeEventListener('closeSlideUp', handleCloseSlideUp);
  }, [isOpen, onClose]);

  const scrollToTop = () => {
    const content = contentRef.current;
    if (!content) return;
    
    content.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Clear URL function
  const handleClose = () => {
    onClose();
    // Clear URL path, keep only base URL
    window.history.pushState({}, '', window.location.origin);
  };

  if (!isRendered && !isOpen) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slide-scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        .slide-animate-scan {
          animation: slide-scan 2s linear infinite;
        }
        
        @keyframes slide-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .slide-animate-pulse {
          animation: slide-pulse 4s ease-in-out infinite;
        }
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Mask layer */}
      <div 
        className={`fixed inset-0 bg-gray-900 z-[80] transition-opacity duration-300 ease-in-out ${
          isAnimating ? 'bg-opacity-80 opacity-100' : 'bg-opacity-0 opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Slide panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isMobile ? 'h-[82vh]' : 'h-[93vh]'
        } bg-gray-900 rounded-t-[20px] shadow-xl z-[85] transform transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        } border-t border-x border-cyan-500/20`}
      >
        {/* Grid background layer */}
        <div className="absolute inset-0 grid-pattern rounded-t-[20px]" />
        
        {/* Content container */}
        <div className="relative h-full w-full bg-gray-900/90 rounded-t-[20px]">
          {/* Top decoration and control area */}
          <div className="sticky top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 h-12 flex items-center justify-center rounded-t-[20px]">
            <div className="w-12 h-1.5 bg-[#1a1f27] rounded-full" />
            <button
              onClick={handleClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content area */}
          <div 
            ref={contentRef}
            className={`overflow-y-auto overflow-x-hidden ${
              isMobile ? 'h-[calc(82vh-48px)]' : 'h-[calc(93vh-48px)]'
            } relative scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-gray-800 scrollbar-thumb-rounded scrollbar-track-rounded`}
          >
            <div className="max-w-4xl mx-auto px-2 w-full">
              {children}
            </div>

            {/* Back to top button */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-cyan-500/20 group"
                style={{ maxWidth: 'calc(100% - 3rem)' }}
                aria-label="Back to top"
              >
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 10l7-7m0 0l7 7m-7-7v18" 
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

    </>
  );
} 