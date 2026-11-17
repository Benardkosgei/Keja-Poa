// Core Types for Kejapoa Real Estate Platform

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'landlord' | 'tenant' | 'client';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  created_at: string;
}

export interface PropertyCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'office';
export type ListingType = 'sale' | 'rent';

export interface PropertyAmenity {
  id: number;
  name: string;
  icon?: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  listing_type: ListingType;
  property_type: PropertyType;
  category: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  amenities: PropertyAmenity[];
  images: PropertyImage[];
  agent: Agent;
  landlord?: User;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  tour?: Tour;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
  order: number;
}

export interface Agent {
  id: number;
  user: User;
  agency_name?: string;
  license_number?: string;
  bio?: string;
  total_listings: number;
  total_sales: number;
  rating: number;
  verified: boolean;
}

// Tour Types
export interface TourHotspot {
  id: number;
  target_scene: string;
  position: { x: number; y: number; z: number };
  label: string;
  icon?: string;
}

export interface TourTag {
  id: number;
  title: string;
  description: string;
  position: { x: number; y: number; z: number };
}

export interface TourScene {
  id: string;
  name: string;
  panorama_url: string;
  thumbnail_url?: string;
  hotspots: TourHotspot[];
  tags: TourTag[];
  camera_position?: { x: number; y: number; z: number };
  camera_rotation?: { x: number; y: number; z: number };
}

export interface Tour {
  id: number;
  property: number;
  title: string;
  description?: string;
  initial_scene: string;
  scenes: TourScene[];
  floor_plan_url?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// Search and Filter Types
export interface PropertyFilters {
  location?: string;
  city?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  amenities?: number[];
  agent?: number;
  featured?: boolean;
}

export interface SearchResult {
  properties: Property[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Inquiry Types
export interface Inquiry {
  id: number;
  property: number;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

// Favorite Types
export interface Favorite {
  id: number;
  user: number;
  property: number;
  created_at: string;
}

// Dashboard Types
export interface AgentDashboard {
  total_properties: number;
  active_listings: number;
  pending_approvals: number;
  total_views: number;
  total_leads: number;
  recent_inquiries: Inquiry[];
}

export interface AdminDashboard {
  total_users: number;
  total_properties: number;
  pending_approvals: number;
  total_agents: number;
  total_tours: number;
  recent_signups: User[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  phone?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}