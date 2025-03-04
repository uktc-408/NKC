import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';
import SearchForm from '../Search/Search/SearchForm';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const commandInputRef = useRef(null);
  const instructionLineRef = useRef(null);
  const externalButtonRef = useRef(null);

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // (Keep your existing event handlers, e.g., handleTerminalSubmit, useEffect for input events, etc.)
  // For brevity, we assume those functions remain the same

  // --- Render the Mobile Layout if isMobile is true ---
  if (isMobile) {
    return (
      <div className="terminal-container mobile">
        <div id="terminalContainer" className="terminal-mobile" >
          {/* Static terminal messages */}
          <div className="static-line">Willkommen to PolizAI</div>
          <div className="static-line">The ultimate pre-trade analysis for users</div>
          <div className="static-line">We analyze contracts to prevent you from falling into scams</div>
          
          {/* Instruction line */}
          <div className="instruction" id="instructionLine" ref={instructionLineRef}>
            // Add input
          </div>
          
          {/* Mobile layout: the SearchForm is rendered here */}
          <div className="command-line">
            <SearchForm terminalInput={true} />
          </div>
        </div>
        <button id="externalButton" ref={externalButtonRef} style={{ display: 'none' }}>
          External Trigger
        </button>
      </div>
    );
  }

  // --- Render the Desktop Layout ---
  return (
    <div className="terminal-container">
      <div id="terminalContainer">
        <div className="terminal" id="terminal">
          {/* Static terminal messages */}
          <div className="static-line">Willkommen to PolizAI</div>
          <div className="static-line">The ultimate pre-trade analysis for users</div>
          <div className="static-line">We analyze contracts to prevent you from falling into scams</div>
          
          {/* Instruction line */}
          <div className="instruction" id="instructionLine" ref={instructionLineRef}>
            // Add input
          </div>
          
          {/* Desktop layout: the SearchForm is rendered here */}
          <div className="command-line">
            <SearchForm terminalInput={true} />
          </div>
        </div>
      </div>
      <button id="externalButton" ref={externalButtonRef} style={{ display: 'none' }}>
        External Trigger
      </button>
    </div>
  );
};

export default Terminal;
