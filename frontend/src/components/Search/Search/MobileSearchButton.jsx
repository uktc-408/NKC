import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './MobileSearchForm.css';

export default function MobileSearchForm({ onSubmit }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission (which reloads the page)
    if (onSubmit) {
      onSubmit(input);
    }
    setInput(''); // Clear input after submission (optional)
  };

  return (
    <form onSubmit={handleSubmit} className="mobile-search-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type command..."
        className="mobile-search-input"
      />
      <button type="submit" className="mobile-search-button">
        <FaSearch className="icon" />
      </button>
    </form>
  );
}
