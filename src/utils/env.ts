// Environment variables with types
export const API_URL = import.meta.env.VITE_API_URL as string;
export const WS_URL = import.meta.env.VITE_WS_URL as string;

// Fallback to defaults if environment variables are not set
if (!API_URL) {
  console.warn('VITE_API_URL not set, using default');
}

if (!WS_URL) {
  console.warn('VITE_WS_URL not set, using default');
}

export const getApiUrl = (): string => {
  return API_URL || 'http://localhost:8000';
};

export const getWsUrl = (): string => {
  return WS_URL || 'ws://localhost:8000/ws';
};
