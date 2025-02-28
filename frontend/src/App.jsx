import React, { useRef, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LogoSection from './components/LogoSection/LogoSection';
import Terminal from './components/Terminal/Terminal';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const terminalRef = useRef(null);
  const [showLogo, setShowLogo] = useState(true);

  const scrollToTerminal = () => {
    if (terminalRef.current) {
      window.scrollTo({
        top: terminalRef.current.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              {/* LogoSection and Terminal are both in the normal flow */}
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
