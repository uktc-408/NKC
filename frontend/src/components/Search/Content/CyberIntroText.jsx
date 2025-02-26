import React from 'react';

const CyberIntroText = () => {
  return (
    <div className="relative z-20 mb-8 px-4">
      <style jsx>{`
        .pixel-text {
          font-family: 'Press Start 2P', monospace;
          color: #0ff;
          text-shadow: 
            0 0 5px rgba(0, 255, 255, 0.8),
            0 0 10px rgba(0, 255, 255, 0.8),
            0 0 20px rgba(0, 255, 255, 0.6),
            0 0 30px rgba(0, 255, 255, 0.4);
          text-align: center;
          line-height: 1.6;
          letter-spacing: 2px;
          animation: textPulse 2s infinite;
        }

        @keyframes textPulse {
          0%, 100% { 
            opacity: 1;
            text-shadow: 
              0 0 5px rgba(0, 255, 255, 0.8),
              0 0 10px rgba(0, 255, 255, 0.8),
              0 0 20px rgba(0, 255, 255, 0.6),
              0 0 30px rgba(0, 255, 255, 0.4);
          }
          50% { 
            opacity: 0.9;
            text-shadow: 
              0 0 10px rgba(0, 255, 255, 0.9),
              0 0 20px rgba(0, 255, 255, 0.9),
              0 0 30px rgba(0, 255, 255, 0.7),
              0 0 40px rgba(0, 255, 255, 0.5);
          }
        }
      `}</style>

      <div className="pixel-text text-sm mb-2">
        SYSTEM INITIALIZED
      </div>
      <div className="pixel-text text-xs mb-2">
        AI-POWERED TWEET ANALYSIS ENGINE
      </div>
      <div className="pixel-text text-xs mb-2">
        NOW OPEN SOURCE
      </div>
      <div className="pixel-text text-[10px]">
        STATUS: <span className="text-[#0f0]">OPERATIONAL</span>
      </div>
    </div>
  );
};

export default CyberIntroText; 