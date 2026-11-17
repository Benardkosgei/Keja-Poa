import type {
  Property, PropertyFilters, SearchResult, Agent,
  Tour, Inquiry, Favorite, AuthTokens, AuthResponse, User,
} from '@/types';

// Base API URL — set VITE_API_URL in .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─── Fix #19: core fetch — NO silent mock fallback. Throws on error. ──────────

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const stored = localStorage.getItem('kejapoa_tokens');
  const tokens: AuthTokens | null = stored ? JSON.parse(stored) : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.detail || body.non_field_errors?.[0] || `API error ${response.status}`;
    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return undefined as unknown as T;
  return response.json();
}

// ─── Property API ─────────────────────────────────────────────────────────────

export const propertyApi = {
  getAll: async (filters?: PropertyFilters, page = 1, pageSize = 12): Promise<SearchResult> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (filters) {
      if (filters.location)      params.set('search', filters.location);
      if (filters.city)          params.set('city', filters.city);
      if (filters.property_type) params.set('property_type', filters.property_type);
      if (filters.listing_type)  params.set('listing_type', filters.listing_type);
      if (filters.price_min)     params.set('price_min', String(filters.price_min));
      if (filters.price_max)     params.set('price_max', String(filters.price_max));
      if (filters.bedrooms_min)  params.set('bedrooms_min', String(filters.bedrooms_min));
      if (filters.bathrooms_min) params.set('bathrooms_min', String(filters.bathrooms_min));
      if (filters.featured)      params.set('featured', 'true');
    }
    const data = await fetchApi<{
      results: Property[];
      count: number;
      next: string | null;
      previous: string | null;
    }>(`/properties/?${params.toString()}`);
    return {
      properties: data.results,
      total_count: data.count,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(data.count / pageSize),
    };
  },

  getById: (id: number): Promise<Property> =>
    fetchApi<Property>(`/properties/${id}/`),

  getFeatured: async (): Promise<Property[]> => {
    const data = await fetchApi<{ results: Property[] }>('/properties/featured/');
    // Paginated response — results is always present after backend fix
    return data.results ?? [];
  },

  create: (data: Partial<Property>): Promise<Property> =>
    fetchApi<Property>('/properties/', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<Property>): Promise<Property> =>
    fetchApi<Property>(`/properties/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number): Promise<void> =>
    fetchApi(`/properties/${id}/`, { method: 'DELETE' }),

  approve: (id: number): Promise<Property> =>
    fetchApi<Property>(`/properties/${id}/approve/`, { method: 'POST' }),

  reject: (id: number): Promise<Property> =>
    fetchApi<Property>(`/properties/${id}/reject/`, { method: 'POST' }),

  uploadImage: (id: number, formData: FormData): Promise<unknown> =>
    fetchApi(`/properties/${id}/images/`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set multipart content-type
    }),
};

// ─── Fix #37: complete Tour API ───────────────────────────────────────────────

export const tourApi = {
  getByProperty: (propertyId: number): Promise<Tour> =>
    fetchApi<Tour>(`/tours/property/${propertyId}/`),

  create: (data: { property: number; title: string; description?: string }): Promise<Tour> =>
    fetchApi<Tour>('/tours/', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<Tour>): Promise<Tour> =>
    fetchApi<Tour>(`/tours/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number): Promise<void> =>
    fetchApi(`/tours/${id}/`, { method: 'DELETE' }),

  uploadScene: (tourId: number, formData: FormData): Promise<unknown> =>
    fetchApi(`/tours/${tourId}/scenes/`, {
      method: 'POST',
      body: formData,
      headers: {},
    }),

  deleteScene: (tourId: number, sceneId: number): Promise<void> =>
    fetchApi(`/tours/${tourId}/scenes/${sceneId}/`, { method: 'DELETE' }),
};

// ─── Agent API — Fix #40: add updateMyProfile ─────────────────────────────────

export const agentApi = {
  getAll: (page = 1): Promise<{ results: Agent[]; count: number }> =>
    fetchApi<{ results: Agent[]; count: number }>(`/agents/?page=${page}`),

  getById: (id: number): Promise<Agent> =>
    fetchApi<Agent>(`/agents/${id}/`),

  updateMyProfile: (data: {
    agency_name?: string;
    license_number?: string;
    bio?: string;
  }): Promise<Agent> =>
    fetchApi<Agent>('/agents/me/', { method: 'PATCH', body: JSON.stringify(data) }),

  getReviews: (agentId: number) =>
    fetchApi(`/agents/${agentId}/reviews/`),

  addReview: (agentId: number, data: { rating: number; comment?: string }) =>
    fetchApi(`/agents/${agentId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    fetchApi<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role?: string;
    phone?: string;
    username?: string;
  }): Promise<AuthResponse> => {
    const payload = { username: data.email.split('@')[0], ...data };
    return fetchApi<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refresh: (refreshToken: string): Promise<{ access: string }> =>
    fetchApi<{ access: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }),

  logout: (refreshToken: string): Promise<void> =>
    fetchApi('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }),

  getProfile: (): Promise<User> =>
    fetchApi<User>('/auth/profile/'),

  updateProfile: (data: Partial<User>): Promise<User> =>
    fetchApi<User>('/auth/profile/', { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> =>
    fetchApi('/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Inquiry API ──────────────────────────────────────────────────────────────

export const inquiryApi = {
  create: (data: Omit<Inquiry, 'id' | 'status' | 'created_at'>): Promise<Inquiry> =>
    fetchApi<Inquiry>('/inquiries/', { method: 'POST', body: JSON.stringify(data) }),

  getReceived: (): Promise<{ results: Inquiry[]; count: number }> =>
    fetchApi('/inquiries/received/'),

  updateStatus: (id: number, status: Inquiry['status']): Promise<Inquiry> =>
    fetchApi<Inquiry>(`/inquiries/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ─── Fix #38: Favorites API with property_detail in type ─────────────────────

export interface FavoriteWithDetail extends Omit<Favorite, 'user'> {
  property_detail?: Property;
}

export const favoritesApi = {
  getAll: (): Promise<FavoriteWithDetail[]> =>
    fetchApi<FavoriteWithDetail[]>('/favorites/'),

  add: (propertyId: number): Promise<FavoriteWithDetail> =>
    fetchApi<FavoriteWithDetail>('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ property: propertyId }),
    }),

  remove: (favoriteId: number): Promise<void> =>
    fetchApi(`/favorites/${favoriteId}/`, { method: 'DELETE' }),
};

// ─── Categories & Amenities ───────────────────────────────────────────────────

export const categoryApi = {
  getAll: () => fetchApi<{ results: unknown[] }>('/categories/'),
};

export const amenityApi = {
  getAll: () => fetchApi<{ results: unknown[] }>('/amenities/'),
};

export default { property: propertyApi, tour: tourApi, agent: agentApi, auth: authApi };
