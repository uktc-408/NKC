import React, { useState, useEffect, memo, useRef } from 'react';
import ImagePreviewModal from '../Token/ImagePreviewModal';

const TwitterAvatar = memo(({ username, name, imageUrl, size = 'md', fallbackUrl, showZoom = false }) => {
  const defaultFallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23f3f4f6' rx='12' ry='12'/%3E%3Cpath fill='%23d1d5db' d='M12 14.4c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v1h16v-1c0-2.7-5.3-4-8-4z'/%3E%3C/svg%3E";
  
  // Use ref to store current image source
  const currentSrcRef = useRef(imageUrl || (username ? `https://unavatar.io/twitter/${username}` : fallbackUrl));
  
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Only update when image source actually changes
  useEffect(() => {
    const newSrc = imageUrl || (username ? `https://unavatar.io/twitter/${username}` : fallbackUrl);
    if (newSrc !== currentSrcRef.current) {
      currentSrcRef.current = newSrc;
      setIsLoading(true);
      setHasError(false);
    }
  }, [imageUrl, username, fallbackUrl]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasError) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div 
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-900/50 backdrop-blur-sm cursor-pointer hover:opacity-90 transition-opacity group`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thin border */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30"></div>

        {/* Loading animation - scan line */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full w-full avatar-scan"></div>
          </div>
        )}
        
        {/* Magnifying glass icon */}
        {showZoom && isHovered && !hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity">
            <svg 
              className="w-4 h-4 text-white/80 drop-shadow-lg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
        
        <img
          src={currentSrcRef.current || defaultFallbackImage}
          alt={name}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            currentSrcRef.current = defaultFallbackImage;
          }}
          onClick={handleClick}
        />

        <style jsx>{`
          .avatar-scan {
            background: linear-gradient(
              transparent 0%,
              rgba(6, 182, 212, 0.08) 50%,
              transparent 100%
            );
            animation: avatar-scanning 1.5s linear infinite;
          }

          @keyframes avatar-scanning {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(100%);
            }
          }
        `}</style>
      </div>

      {/* Image preview modal */}
      {showPreview && !hasError && (
        <ImagePreviewModal
          image={currentSrcRef.current}
          alt={name}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
});

TwitterAvatar.displayName = 'TwitterAvatar';

export default TwitterAvatar; 