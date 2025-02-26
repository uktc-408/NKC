import React from 'react';

const CyberBackground = ({ simplified = false, disabled = false }) => {
  // Optionally, you could return null if you want to disable this component entirely:
  // if (simplified || disabled) return null;

  return (
    <>
      {/* Removed the inline style block since none of the definitions are needed now */}
      
      <div className="fixed inset-0 z-[-1] bg-transparent overflow-hidden">
        {/* Removed the base gradient background */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-gray-900 to-purple-900/20"></div> */}

        {/* Removed the grid ground effect */}
        {/*
        <div className="absolute inset-0 h-[200vh] bg-cyber-grid opacity-40"></div>
        */}

        {/* Removed the floating hexagons / halo effects */}
        {/*
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0">
            <div className="w-[400px] h-[400px] rounded-full bg-purple-500/20 bg-neon-circle 
                          backdrop-blur-[50px] translate-z-0"></div>
          </div>
          <div className="absolute right-0 bottom-0">
            <div className="w-[400px] h-[400px] rounded-full bg-pink-500/20 bg-neon-circle 
                          backdrop-blur-[50px] translate-z-0"></div>
          </div>
        </div>
        */}

        {/* Removed vignette effect */}
        {/*
        <div className="absolute inset-0 bg-cyber-vignette pointer-events-none"></div>
        */}

        {/* Removed scan line effect */}
        {/*
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 h-[2px] bg-cyan-500/10 bg-scanline blur-sm"></div>
        </div>
        */}

        {/* Removed noise mask */}
        {/*
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
        */}
      </div>
    </>
  );
};

export default CyberBackground;
