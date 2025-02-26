import { analyzeLinks, botLinks, priceAnalyzeLinks } from './config/links';
import { useState } from 'react';

const LinkIcon = ({ url, twitterUsername }) => {
  const [iconUrl, setIconUrl] = useState(
    twitterUsername 
      ? `https://unavatar.io/twitter/${twitterUsername}`
      : `https://www.google.com/s2/favicons?domain=${url}&sz=32`
  );

  const handleError = () => {
    if (!twitterUsername) {
      try {
        setIconUrl(`${new URL(url).origin}/favicon.ico`);
      } catch (error) {
        console.error('Error setting fallback icon:', error);
      }
    }
  };

  return (
    <img 
      src={iconUrl} 
      alt="site icon" 
      className="w-4 h-4 rounded-full"
      onError={handleError}
      style={{ minWidth: '16px' }}
    />
  );
};

export default function TokenLinks({ searchAddress, tokenInfo }) {
  const linkButtonClass = "flex items-center gap-1.5 px-2 py-1 bg-gray-900/50 text-gray-300 rounded-md hover:bg-gray-800/50 transition-colors text-xs whitespace-nowrap border border-cyan-500/20 backdrop-blur-sm";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {searchAddress && analyzeLinks.map((link) => (
          <a
            key={link.name}
            href={link.fullUrl(searchAddress, tokenInfo?.chainId)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButtonClass}
            title={link.name}
          >
           <LinkIcon url={link.url} twitterUsername={link.twitterUsername} />
            <span className="hidden md:inline">{link.name}</span>
          </a>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {searchAddress && priceAnalyzeLinks.map((link) => (
          <a
            key={link.name}
            href={link.fullUrl(searchAddress, tokenInfo?.chainId)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButtonClass}
            title={link.name}
          >
            <LinkIcon url={link.url} twitterUsername={link.twitterUsername} />
            <span className="hidden md:inline">{link.name}</span>
          </a>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {searchAddress && botLinks.map((link) => (
          <a
            key={link.name}
            href={link.fullUrl(searchAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButtonClass}
            title={link.name}
          >
            <LinkIcon url={link.url} twitterUsername={link.twitterUsername} />
            <span className="hidden md:inline">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
} 