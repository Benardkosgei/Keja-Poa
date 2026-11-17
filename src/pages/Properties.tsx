import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Grid, List, X, Home, Building2, Castle, Warehouse, TreePine } from 'lucide-react';
import type { Property, PropertyFilters, PropertyType, ListingType } from '@/types';
import { propertyApi } from '@/services/api';

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const parseFiltersFromParams = (): PropertyFilters => {
    const filters: PropertyFilters = {};
    const location = searchParams.get('location');
    const city = searchParams.get('city');
    const property_type = searchParams.get('property_type') as PropertyType | null;
    const listing_type = searchParams.get('listing_type') as ListingType | null;
    const price_min = searchParams.get('price_min');
    const price_max = searchParams.get('price_max');
    const bedrooms_min = searchParams.get('bedrooms_min');
    const bathrooms_min = searchParams.get('bathrooms_min');
    if (location) filters.location = location;
    if (city) filters.city = city;
    if (property_type) filters.property_type = property_type;
    if (listing_type) filters.listing_type = listing_type;
    if (price_min) filters.price_min = Number(price_min);
    if (price_max) filters.price_max = Number(price_max);
    if (bedrooms_min) filters.bedrooms_min = Number(bedrooms_min);
    if (bathrooms_min) filters.bathrooms_min = Number(bathrooms_min);
    return filters;
  };

  const [filters, setFilters] = useState<PropertyFilters>(parseFiltersFromParams);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Property type options
  const propertyTypes: { value: PropertyType; label: string; icon: any }[] = [
    { value: 'apartment', label: 'Apartment', icon: Building2 },
    { value: 'house', label: 'House', icon: Home },
    { value: 'villa', label: 'Villa', icon: Castle },
    { value: 'commercial', label: 'Commercial', icon: Warehouse },
    { value: 'land', label: 'Land', icon: TreePine },
  ];

  // Cities
  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kakamega'];

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const result = await propertyApi.getAll(filters, page, 12);
        setProperties(result.properties);
        setTotalPages(result.total_pages);
        setTotalCount(result.total_count);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, page]);

  // Handle filter changes
  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.property_type) count++;
    if (filters.listing_type) count++;
    if (filters.price_min || filters.price_max) count++;
    if (filters.bedrooms_min) count++;
    if (filters.bathrooms_min) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by location, property name..."
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.property_type || ''}
                onChange={(e) => handleFilterChange('property_type', e.target.value as PropertyType || undefined)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[140px]"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={filters.listing_type || ''}
                onChange={(e) => handleFilterChange('listing_type', e.target.value as ListingType || undefined)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[140px]"
              >
                <option value="">Buy & Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 border rounded-xl transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-slate-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.price_min || ''}
                      onChange={(e) => handleFilterChange('price_min', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.price_max || ''}
                      onChange={(e) => handleFilterChange('price_max', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bedrooms</label>
                  <select
                    value={filters.bedrooms_min || ''}
                    onChange={(e) => handleFilterChange('bedrooms_min', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bathrooms</label>
                  <select
                    value={filters.bathrooms_min || ''}
                    onChange={(e) => handleFilterChange('bathrooms_min', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <select
                    value={filters.city || ''}
                    onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{totalCount}</span> properties found
          </p>

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {filters.property_type && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {filters.property_type}
                  <button
                    onClick={() => handleFilterChange('property_type', undefined)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {filters.listing_type && (
                <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  For {filters.listing_type === 'sale' ? 'Sale' : 'Rent'}
                  <button
                    onClick={() => handleFilterChange('listing_type', undefined)}
                    className="ml-1 hover:text-amber-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {(filters.price_min || filters.price_max) && (
                <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  Price: {filters.price_min || '0'} - {filters.price_max || '∞'}
                  <button
                    onClick={() => {
                      handleFilterChange('price_min', undefined);
                      handleFilterChange('price_max', undefined);
                    }}
                    className="ml-1 hover:text-emerald-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md">
                <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
                  <div className="flex justify-between pt-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Property Grid/List */}
        {!loading && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-xl p-4 shadow-md flex gap-4 hover:shadow-lg transition-shadow">
                    <div className="w-48 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={property.images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 cursor-pointer">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-slate-500 text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {property.address}, {property.city}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.listing_type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-slate-600">
                        <span>{property.bedrooms} Beds</span>
                        <span>{property.bathrooms} Baths</span>
                        <span>{property.area_sqft.toLocaleString()} sqft</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-bold text-blue-600">
                          KSh {property.price.toLocaleString()}
                          {property.listing_type === 'rent' && '/mo'}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 py-2">...</span>
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`w-10 h-10 rounded-lg font-medium border border-slate-200 hover:bg-slate-50`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Property Card Component (local for reuse)
function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `KSh ${price.toLocaleString()}/mo`;
    }
    return `KSh ${price.toLocaleString()}`;
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.listing_type === 'sale' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
            For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
          </span>
          {property.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
              Featured
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsFavorited(f => !f); }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFavorited ? 'text-red-500 fill-current' : 'text-slate-600'}`}
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-blue-600">{formatPrice(property.price, property.listing_type)}</span>
          <div className="flex items-center space-x-1 text-amber-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm font-medium">{property.agent.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{property.address}, {property.city}</span>
        </div>

        {/* Features */}
        <div className="flex items-center justify-between py-4 border-t border-slate-100">
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <span className="text-sm">{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-sm">{property.area_sqft.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {property.agent.user.first_name[0]}{property.agent.user.last_name[0]}
              </span>
            </div>
            <span className="text-sm text-slate-600">{property.agent.user.first_name} {property.agent.user.last_name}</span>
          </div>
          <button
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property.id}`); }}
          >
            <span>View Tour</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}