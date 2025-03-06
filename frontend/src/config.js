/**
 * Application configuration
 * 
 * This file centralizes access to environment variables
 * and provides fallback values for development environments.
 */

// Safely access environment variables
const getEnvVariable = (key, defaultValue) => {
  // Check if we're in a Create React App environment
  if (typeof window !== 'undefined' && window.env) {
    return window.env[key] || defaultValue;
  }
  
  // For Create React App standard environment variables
  if (typeof window !== 'undefined' && window.__REACT_APP_ENV) {
    return window.__REACT_APP_ENV[key] || defaultValue;
  }
  
  // For direct process.env access (if available)
  try {
    if (import.meta && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    // process is not defined, continue to fallback
  }
  
  // Fallback to hardcoded value
  return defaultValue;
};

// API Configuration
export const API_BASE_URL = getEnvVariable('VITE_API_BASE_URL', 'http://localhost:8000');

// Image paths - simplified since backend now provides full URLs
export const getFullImageUrl = (path) => {
  if (!path) return '';
  
  // Return the path as is since it should now be a full URL from the backend
  return path;
};

// Other configuration variables can be exported here 