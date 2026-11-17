import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Property, Tour, AuthResponse, PaginatedResponse,
  PropertyFilters, Favorite, Inquiry, User,
} from '../types';

// ─── Fix #23: configurable base URL via EXPO_PUBLIC_API_URL ──────────────────
// Android emulator default: http://10.0.2.2:8000
// iOS simulator default:    http://localhost:8000
// Physical device:          set EXPO_PUBLIC_API_URL in .env to your LAN IP
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const tokensJson = await AsyncStorage.getItem('kejapoa_tokens');
    if (tokensJson) {
      const tokens = JSON.parse(tokensJson);
      if (tokens?.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
    }
  } catch {
    // No token stored — continue unauthenticated
  }
  return config;
});

// ─── Fix #9: Response interceptor — auto-refresh on 401 ──────────────────────
let _isRefreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only intercept 401s that haven't already been retried and aren't the refresh call itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh/')
    ) {
      original._retry = true;

      if (_isRefreshing) {
        // Queue this request until the ongoing refresh finishes
        return new Promise(resolve => {
          _refreshQueue.push((newAccessToken: string) => {
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(original));
          });
        });
      }

      _isRefreshing = true;
      try {
        const tokensJson = await AsyncStorage.getItem('kejapoa_tokens');
        if (!tokensJson) throw new Error('No tokens stored');
        const tokens = JSON.parse(tokensJson);
        const res = await apiClient.post<{ access: string }>('/auth/refresh/', {
          refresh: tokens.refresh,
        });
        const newAccess = res.data.access;
        const updatedTokens = { ...tokens, access: newAccess };
        await AsyncStorage.setItem('kejapoa_tokens', JSON.stringify(updatedTokens));

        // Drain the queue
        _refreshQueue.forEach(cb => cb(newAccess));
        _refreshQueue = [];

        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch {
        // Refresh failed — clear session so the user is prompted to log in
        _refreshQueue = [];
        await AsyncStorage.multiRemove(['kejapoa_user', 'kejapoa_tokens']);
        return Promise.reject(error);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Properties ───────────────────────────────────────────────────────────────

export const propertyApi = {
  list: (filters?: PropertyFilters, page = 1) => {
    const params: Record<string, string | number | boolean> = { page };
    if (filters?.search)        params.search = filters.search;
    if (filters?.city)          params.city = filters.city;
    if (filters?.property_type) params.property_type = filters.property_type;
    if (filters?.listing_type)  params.listing_type = filters.listing_type;
    if (filters?.price_min)     params.price_min = filters.price_min;
    if (filters?.price_max)     params.price_max = filters.price_max;
    if (filters?.bedrooms_min)  params.bedrooms_min = filters.bedrooms_min;
    if (filters?.featured)      params.featured = true;
    return apiClient.get<PaginatedResponse<Property>>('/properties/', { params });
  },

  detail: (id: number) =>
    apiClient.get<Property>(`/properties/${id}/`),

  featured: () =>
    apiClient.get<PaginatedResponse<Property>>('/properties/featured/'),
};

// ─── Tours ────────────────────────────────────────────────────────────────────

export const tourApi = {
  byProperty: (propertyId: number) =>
    apiClient.get<Tour>(`/tours/property/${propertyId}/`),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login/', { email, password }),

  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role?: string;
    phone?: string;
  }) => {
    // Backend auto-fixes username collision via uuid suffix
    const payload = { username: data.email.split('@')[0], ...data };
    return apiClient.post<AuthResponse>('/auth/register/', payload);
  },

  refresh: (refreshToken: string) =>
    apiClient.post<{ access: string }>('/auth/refresh/', { refresh: refreshToken }),

  getProfile: () =>
    apiClient.get<User>('/auth/profile/'),

  updateProfile: (data: Partial<Pick<User, 'first_name' | 'last_name' | 'phone'>>) =>
    apiClient.patch<User>('/auth/profile/', data),

  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => apiClient.post('/auth/password/change/', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout/', { refresh: refreshToken }),
};

// ─── Fix #21: Favorites API ───────────────────────────────────────────────────

export const favoritesApi = {
  getAll: () =>
    apiClient.get<{ results: Favorite[]; count: number }>('/favorites/'),

  add: (propertyId: number) =>
    apiClient.post<Favorite>('/favorites/', { property: propertyId }),

  remove: (favoriteId: number) =>
    apiClient.delete(`/favorites/${favoriteId}/`),
};

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const inquiryApi = {
  create: (data: {
    property: number;
    sender_name: string;
    sender_email: string;
    sender_phone?: string;
    message: string;
  }) => apiClient.post<Inquiry>('/inquiries/', data),

  getReceived: () =>
    apiClient.get<{ results: Inquiry[]; count: number }>('/inquiries/received/'),

  updateStatus: (id: number, status: Inquiry['status']) =>
    apiClient.patch<Inquiry>(`/inquiries/${id}/`, { status }),
};

// ─── Agents ───────────────────────────────────────────────────────────────────

export const agentApi = {
  list: (page = 1) =>
    apiClient.get('/agents/', { params: { page } }),

  detail: (id: number) =>
    apiClient.get(`/agents/${id}/`),

  // Fix #40: agent profile update
  updateMyProfile: (data: { agency_name?: string; license_number?: string; bio?: string }) =>
    apiClient.patch('/agents/me/', data),

  reviews: (agentId: number) =>
    apiClient.get(`/agents/${agentId}/reviews/`),

  addReview: (agentId: number, data: { rating: number; comment?: string }) =>
    apiClient.post(`/agents/${agentId}/reviews/`, data),
};

export default apiClient;
