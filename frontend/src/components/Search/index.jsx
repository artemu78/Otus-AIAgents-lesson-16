import { useState, useRef } from 'react';
import './Search.css';

export const Search = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim() === '') {
      onClear();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search for dresses..."
          value={query}
          onChange={handleInputChange}
        />
        {query && (
          <button className="search-clear" onClick={handleClear}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};
