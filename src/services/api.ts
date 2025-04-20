// Base API URL - can be overridden with environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Error type interface
interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// Generic fetch function with error handling
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // For cookies/sessions if needed
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetchWithTimeout(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      const apiError: ApiError = {
        status: response.status,
        message: errorData.message || response.statusText || 'Unknown error',
        data: errorData,
      };
      
      throw apiError;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (response.status === 204) {
      // No content response
      return {} as T;
    } else {
      return await response.text() as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        status: 408,
        message: 'Request timeout',
      } as ApiError;
    }
    
    // Re-throw API errors
    if ((error as ApiError).status) {
      throw error;
    }
    
    // Handle other errors
    throw {
      status: 0,
      message: (error as Error).message || 'Network error',
    } as ApiError;
  }
}

// API service with common HTTP methods
export const api = {
  get: <T>(endpoint: string, customHeaders = {}) => 
    apiRequest<T>(endpoint, 'GET', undefined, customHeaders),
  
  post: <T>(endpoint: string, data: any, customHeaders = {}) => 
    apiRequest<T>(endpoint, 'POST', data, customHeaders),
  
  put: <T>(endpoint: string, data: any, customHeaders = {}) => 
    apiRequest<T>(endpoint, 'PUT', data, customHeaders),
  
  patch: <T>(endpoint: string, data: any, customHeaders = {}) => 
    apiRequest<T>(endpoint, 'PATCH', data, customHeaders),
  
  delete: <T>(endpoint: string, customHeaders = {}) => 
    apiRequest<T>(endpoint, 'DELETE', undefined, customHeaders),
};

// API endpoints
export const endpoints = {
  status: '/status',
  models: '/models',
  settings: '/settings',
};

// Types for API responses
export interface StatusResponse {
  status: string;
  version: string;
  uptime: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  isLoaded: boolean;
}

export interface ModelsResponse {
  models: ModelInfo[];
  currentModel: string | null;
}

export interface DiffusionSettings {
  prompt: string;
  negativePrompt: string;
  steps: number;
  guidance: number;
  seed: number;
  useRandomSeed: boolean;
}

// Specific API methods
export const apiService = {
  getStatus: () => api.get<StatusResponse>(endpoints.status),
  
  getModels: () => api.get<ModelsResponse>(endpoints.models),
  
  getSettings: () => api.get<DiffusionSettings>(endpoints.settings),
  
  updateSettings: (settings: Partial<DiffusionSettings>) => 
    api.put<DiffusionSettings>(endpoints.settings, settings),
};

export default apiService;
