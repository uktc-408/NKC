import React, { useRef, useState, useEffect } from 'react';
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
  useEffect(() => {
    if (window.innerWidth < 768) {
      // Randomly choose between "20% 50%" and "80% 50%"
      const randomPosition = Math.random() > 0.5 ? '30% 50%' : '70% 50%';
      document.body.style.backgroundPosition = randomPosition;
      // You might also want to change backgroundAttachment if needed:
      document.body.style.backgroundAttachment = 'scroll';
      console.log('Background position set to:', randomPosition);
    } else {
      document.body.style.backgroundPosition = '50% 50%';
      document.body.style.backgroundAttachment = 'fixed';
      console.log('Background position set to center');
    }
  }, []);

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
