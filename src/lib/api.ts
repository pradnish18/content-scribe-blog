// API Helper for Production Deployment
// This ensures API calls work in both development and production

const getApiBaseUrl = (): string => {
  // In production, use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use empty string (relative path works with Vite proxy)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // Production fallback - will need to be set via environment variable
  // This is just a safety fallback
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper to build full API URL
export const apiUrl = (path: string): string => {
  // If path already starts with http, use as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In production with API_BASE_URL set, prepend it
  if (API_BASE_URL) {
    return `${API_BASE_URL}${normalizedPath}`;
  }
  
  // Otherwise use relative path (works in dev with proxy, or with Netlify redirects)
  return normalizedPath;
};

// Enhanced fetch wrapper
export const apiFetch = async (
  path: string,
  options?: RequestInit
): Promise<Response> => {
  const url = apiUrl(path);
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

