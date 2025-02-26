import React from 'react';
import './LogoSection.css';

const LogoSection = ({ onStart }) => {
  return (
    <div id="logoContainer">
      <div id="fullscreenLogo" className="fullscreen">
        <div className="logo-wrapper">
        <img src="/NKC/logo.png" alt="Logo"className="logo"/>

          <button id="externalButton" className="neon-button" onClick={onStart}>
            { "START" }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoSection; // <-- default export
