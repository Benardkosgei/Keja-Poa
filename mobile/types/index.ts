// Mobile types — aligned with backend API and web types

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

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface PropertyImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
  order: number;
}

export interface PropertyAmenity {
  id: number;
  name: string;
  icon?: string;
}

export interface PropertyCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AgentProfile {
  id: number;
  user: User;
  agency_name?: string;
  license_number?: string;
  bio?: string;
  rating: number;
  verified: boolean;
  total_listings: number;
  total_sales: number;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'office';
export type ListingType = 'sale' | 'rent';

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  listing_type: ListingType;
  property_type: PropertyType;
  category?: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  amenities: PropertyAmenity[];
  images: PropertyImage[];
  agent?: AgentProfile;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface PropertyFilters {
  search?: string;
  city?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  featured?: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface Favorite {
  id: number;
  property: number;
  property_detail?: Property;
  created_at: string;
}

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
