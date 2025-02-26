import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-group footer-left">
          <a
            href="https://t.me/YourTelegram"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link blue"
          >
            <i className="fab fa-telegram-plane"></i>
          </a>
          <a
            href="https://github.com/YourGit"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link blue"
          >
            <i className="fab fa-github"></i>
          </a>
        </div>
        <div className="footer-center">
          <img src="/logo.png" alt="Logo" className="footer-logo" />
        </div>
        <div className="footer-group footer-right">
          <a
            href="https://twitter.com/YourTwitter"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link pink"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="mailto:youremail@example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link pink"
          >
            <i className="fas fa-envelope"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
