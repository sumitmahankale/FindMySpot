import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../config/api.js';
import { Search, MapPin, X } from 'lucide-react';
import axios from 'axios';

const AutocompleteSearch = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch suggestions based on input
  const fetchSuggestions = async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
  const response = await axios.get(getApiUrl('location-suggestions'), {
        params: { query: input }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce function to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle clicks outside the suggestion box to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.location);
    onLocationSelect(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setShowSuggestions(true);
    }
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    onLocationSelect(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Just pass the current query as location with estimated coordinates
      // The backend should handle the actual geocoding
      onLocationSelect({ 
        location: query,
        lat: 18.5204, // Default Pune coordinates
        lng: 73.8567
      });
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search by location or address..."
            className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 bg-white border"
          />
          {query && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Suggestions dropdown with fixed z-index */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionRef}
          className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ zIndex: 2000 }} // Significantly higher than the map's z-index
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                <div>
                  <div className="font-medium">{suggestion.location}</div>
                  <div className="text-xs text-gray-500">
                    {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading && (
        <div className="absolute right-12 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;