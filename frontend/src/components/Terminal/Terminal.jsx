import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';
import SearchForm from '../Search/Search/SearchForm';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const commandInputRef = useRef(null);
  const instructionLineRef = useRef(null);
  const externalButtonRef = useRef(null);

  // Function to handle terminal submission
  const handleTerminalSubmit = () => {
    if (command.trim() === "") {
      // Blink the instruction line for 1.5 seconds if input is empty
      if (instructionLineRef.current) {
        instructionLineRef.current.classList.add("blink");
        setTimeout(() => {
          instructionLineRef.current.classList.remove("blink");
        }, 1500);
      }
      return;
    }
    // Disable input, change prompt, and show loading message
    if (commandInputRef.current) commandInputRef.current.disabled = true;
    const userLabel = document.querySelector('.user-label');
    const prompt = document.querySelector('.prompt');
    if (userLabel) userLabel.classList.add('disabled-prompt');
    if (prompt) prompt.classList.add('disabled-prompt');
    if (instructionLineRef.current) {
      instructionLineRef.current.textContent = "// loading...";
    }

    // Simulate a loading delay between 1500ms and 4500ms
    const delay = Math.random() * (4500 - 1500) + 1500;
    setTimeout(() => {
      if (instructionLineRef.current) {
        instructionLineRef.current.textContent = "// Error, too many requests at the same time!";
      }
      setCommand("");
      if (commandInputRef.current) {
        commandInputRef.current.disabled = false;
        commandInputRef.current.focus();
      }
      if (userLabel) userLabel.classList.remove('disabled-prompt');
      if (prompt) prompt.classList.remove('disabled-prompt');
      if (instructionLineRef.current) {
        instructionLineRef.current.textContent = "// Add input";
      }
    }, delay);
  };

  useEffect(() => {
    const commandInput = commandInputRef.current;
    const instructionLine = instructionLineRef.current;
    const externalButton = externalButtonRef.current;

    // Update instruction based on input changes
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

    // Attach input event listeners
    if (commandInput) {
      commandInput.addEventListener("input", handleInputChange);
      commandInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleTerminalSubmit();
        }
      });
    }

    // Attach click listener for the external button
    if (externalButton) {
      externalButton.addEventListener("click", () => {
        const terminalEl = document.getElementById("terminal");
        if (terminalEl) {
          terminalEl.scrollIntoView({ behavior: "smooth" });
        }
        // After a short delay, focus the terminal input and place the cursor at the end.
        setTimeout(() => {
          if (commandInput) {
            commandInput.focus();
            const len = commandInput.value.length;
            commandInput.setSelectionRange(len, len);
          }
        }, 300);
      });
    }

    // Cleanup event listeners on unmount
    return () => {
      if (commandInput) {
        commandInput.removeEventListener("input", handleInputChange);
      }
      // (Additional cleanup for other listeners can be added if stored in variables)
    };
  }, [command]);

  // ***************
  // *** RETURN  ***
  // ***************
  return (
    <div id="terminalContainer">
      <div className="terminal" id="terminal">
        {/* Static terminal messages */}
        <div className="static-line">Willkommen to PolizAI</div>
        <div className="static-line">The ultimate pre-trade analysis for users</div>
        <div className="static-line">We analyze contracts to prevent you from failling into scams</div>

        {/* Instruction line */}
        <div className="instruction" id="instructionLine" ref={instructionLineRef}>
          // Add input
        </div>

        {/* Or you can use your own input or the existing SearchForm */}
        <div className="command-line">
         

<div className="command-line">
  <SearchForm />
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
