import React, { useRef } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LogoSection from './components/LogoSection/LogoSection';
import Terminal from './components/Terminal/Terminal';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const terminalRef = useRef(null);

  // Scrolls to the Terminal component when called
  const scrollToTerminal = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <LogoSection onStart={scrollToTerminal} />
              <div ref={terminalRef}>
                <Terminal />
              </div>
              <Footer />
            </div>
          }
        />
        <Route
          path="/:address"
          element={
            <div>
              <LogoSection onStart={scrollToTerminal} />
              <div ref={terminalRef}>
                <Terminal />
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
