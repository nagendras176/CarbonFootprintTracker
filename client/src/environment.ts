console.log('Environment Variables:', import.meta.env);

// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_BASE_URL is set (build-time), use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    // Runtime environment detection for client-side
    const hostname = window.location.hostname;
    
    // If running on localhost, use localhost:9000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:9000`;
    }
    
    // For production (deployed), use the same host but port 9000
    // This assumes your API is running on the same domain but different port
    return `${window.location.protocol}//${hostname}:9000`;
  }
  
  // Server-side fallback or when window is not available
  return "http://localhost:9000";
};

export const environment = {
  apiUrl: getApiUrl(),
};