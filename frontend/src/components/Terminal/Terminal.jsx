import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';
import SearchForm from '../Search/Search/SearchForm';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const commandInputRef = useRef(null);
  const instructionLineRef = useRef(null);
  const externalButtonRef = useRef(null);

  // (Existing terminal logic remains unchanged…)

  useEffect(() => {
    const commandInput = commandInputRef.current;
    const instructionLine = instructionLineRef.current;
    const externalButton = externalButtonRef.current;

    const handleInputChange = (e) => {
      setCommand(e.target.value);
      if (instructionLine) {
        if (e.target.value.trim() !== "") {
          instructionLine.textContent = "Press enter to proceed further";
        } else {
          instructionLine.textContent = "// Add input";
        }
      }
    };

    if (commandInput) {
      commandInput.addEventListener("input", handleInputChange);
      commandInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          // (Call your terminal submit logic here)
        }
      });
    }

    if (externalButton) {
      externalButton.addEventListener("click", () => {
        const terminalEl = document.getElementById("terminal");
        if (terminalEl) {
          terminalEl.scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => {
          if (commandInput) {
            commandInput.focus();
            const len = commandInput.value.length;
            commandInput.setSelectionRange(len, len);
          }
        }, 300);
      });
    }

    return () => {
      if (commandInput) {
        commandInput.removeEventListener("input", handleInputChange);
      }
    };
  }, [command]);

  return (
    <div className="terminal-container">
      <div id="terminalContainer">
        <div className="terminal" id="terminal">
          <div className="static-line">Willkommen to PolizAI</div>
          <div className="static-line">The ultimate pre-trade analysis for users</div>
          <div className="static-line">We analyze contracts to prevent you from falling into scams</div>
          <div className="instruction" id="instructionLine" ref={instructionLineRef}>
            // Add input
          </div>
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
