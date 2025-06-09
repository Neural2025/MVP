import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AnalysisRequest {
  code: string;
  purpose: string;
}

export interface AnalysisResponse {
  security: string[];
  performance: string[];
  optimization: string[];
  functionality: string[];
}

export interface TestGenerationRequest {
  code: string;
  purpose: string;
}

export interface TestGenerationResponse {
  tests: string;
  fixes: Array<{
    issue: string;
    fixedCode: string;
  }>;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// API functions
export const analyzeCode = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
  const response = await api.post('/api/analyze', data);
  return response.data.data; // Backend returns { status: 'success', data: {...} }
};

export const generateTests = async (data: TestGenerationRequest): Promise<TestGenerationResponse> => {
  const response = await api.post('/api/generate-tests', data);
  return response.data.data; // Backend returns { status: 'success', data: {...} }
};

export const login = async (data: AuthRequest): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

export const signup = async (data: AuthRequest & { name: string }): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/signup', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const getProfile = async (): Promise<any> => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};
