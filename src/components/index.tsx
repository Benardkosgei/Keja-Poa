import { Building2, Home, MapPin, Search, Phone, Mail, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { AuthModals } from '@/components/auth/AuthModals';

// Navbar Component
export function Navbar({ openAuthModal }: { openAuthModal?: 'login' | 'register' } = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(openAuthModal ?? null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Open the modal when the prop changes (e.g. navigating to /login)
  useEffect(() => {
    if (openAuthModal) setAuthMode(openAuthModal);
  }, [openAuthModal]);

  // Scroll effect with proper cleanup
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">Kejapoa</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
              <Link to="/properties" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Properties</Link>
              <Link to="/agents" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Agents</Link>
              <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">About</a>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{user.first_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 text-slate-500 hover:text-red-500 font-medium transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/properties" className="text-slate-600 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Properties</Link>
                <Link to="/agents" className="text-slate-600 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Agents</Link>
                <a href="#about" className="text-slate-600 hover:text-blue-600 font-medium py-2">About</a>
                <a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium py-2">Contact</a>
                <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200">
                  {isAuthenticated && user ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-slate-600 hover:text-blue-600 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="text-red-500 font-medium text-left py-2"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setAuthMode('login'); setIsMenuOpen(false); }}
                        className="text-slate-600 hover:text-blue-600 font-medium text-left"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { setAuthMode('register'); setIsMenuOpen(false); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-center"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modals */}
      <AuthModals
        mode={authMode}
        onClose={() => setAuthMode(null)}
        onSwitch={(mode) => setAuthMode(mode)}
      />
    </>
  );
}

// Hero Section Component
export function Hero() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchPropertyType, setSearchPropertyType] = useState('');
  const [searchListingType, setSearchListingType] = useState('');
  const [searchBedrooms, setSearchBedrooms] = useState('');
  const [searchPriceRange, setSearchPriceRange] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchPropertyType) params.set('property_type', searchPropertyType);
    if (searchListingType) params.set('listing_type', searchListingType);
    if (searchBedrooms) params.set('bedrooms_min', searchBedrooms);
    if (searchPriceRange === 'under_5m') params.set('price_max', '5000000');
    else if (searchPriceRange === '5m_20m') { params.set('price_min', '5000000'); params.set('price_max', '20000000'); }
    else if (searchPriceRange === '20m_50m') { params.set('price_min', '20000000'); params.set('price_max', '50000000'); }
    else if (searchPriceRange === 'above_50m') params.set('price_min', '50000000');
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section id="home" className="relative pt-20 md:pt-24 bg-gradient-to-br from-blue-50 via-white to-amber-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #2563eb 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>New 3D Virtual Tours Available</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Find Your Dream
              <span className="text-blue-600 block">Property with</span>
              <span className="text-amber-500 block">Virtual Tours</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl">
              Experience properties like never before with our immersive 3D virtual tours. Walk through homes from anywhere, anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/properties"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Explore Properties</span>
              </Link>
              <Link
                to="/agents"
                className="border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
              >
                <MapPin className="h-5 w-5" />
                <span>Find Agents</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-slate-900">2,500+</div>
                <div className="text-slate-500">Properties Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">150+</div>
                <div className="text-slate-500">Virtual Tours</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">98%</div>
                <div className="text-slate-500">Happy Clients</div>
              </div>
            </div>
          </div>

          {/* Right - Search Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Find Your Perfect Property</h3>

            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Location (e.g., Nairobi, Mombasa)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={searchPropertyType}
                  onChange={(e) => setSearchPropertyType(e.target.value)}
                  className="px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>
                <select
                  value={searchListingType}
                  onChange={(e) => setSearchListingType(e.target.value)}
                  className="px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">For Sale/Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={searchBedrooms}
                  onChange={(e) => setSearchBedrooms(e.target.value)}
                  className="px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
                <select
                  value={searchPriceRange}
                  onChange={(e) => setSearchPriceRange(e.target.value)}
                  className="px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Price Range</option>
                  <option value="under_5m">Under 5M</option>
                  <option value="5m_20m">5M - 20M</option>
                  <option value="20m_50m">20M - 50M</option>
                  <option value="above_50m">Above 50M</option>
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span>Search Properties</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}

// Property Card Component
export function PropertyCard({ property }: { property: any }) {
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `KSh ${price.toLocaleString()}/mo`;
    }
    return `KSh ${price.toLocaleString()}`;
  };

  return (
    <Link to={`/properties/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
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
          onClick={(e) => { e.preventDefault(); setIsFavorited(f => !f); }}
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
            <span className="text-sm font-medium">{Number(property.agent.rating ?? 0).toFixed(1)}</span>
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
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
            <span>View Tour</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </Link>
  );
}

// Featured Properties Section
export function FeaturedProperties({ properties }: { properties: any[] }) {
  return (
    <section id="properties" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Featured Properties
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explore Our Best Listings
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Discover hand-picked premium properties with immersive 3D virtual tours
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/properties"
            className="inline-flex items-center space-x-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
          >
            <span>View All Properties</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Search Properties',
      description: 'Browse through thousands of properties with advanced filters and search options.',
    },
    {
      icon: MapPin,
      title: 'View Virtual Tours',
      description: 'Experience properties in stunning 3D with our Matterport-like virtual tours.',
    },
    {
      icon: Phone,
      title: 'Connect with Agents',
      description: 'Contact verified agents directly through our platform for personalized assistance.',
    },
    {
      icon: Home,
      title: 'Find Your Dream Home',
      description: 'Schedule in-person visits and close the deal on your perfect property.',
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Your Path to Property Ownership
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Simple, transparent process to find and secure your ideal property
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-slate-200 -translate-x-1/2" />
              )}

              {/* Step Number */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                {index + 1}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 pt-10 hover:bg-blue-50 transition-colors h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <step.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Home Buyer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: 'The virtual tour feature saved me so much time. I could narrow down my choices before scheduling in-person visits. Absolutely game-changing!',
      rating: 5,
    },
    {
      name: 'Michael Ochieng',
      role: 'Property Investor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'As an investor, I need to evaluate many properties quickly. Kejapoa\'s 3D tours and detailed listings help me make informed decisions efficiently.',
      rating: 5,
    },
    {
      name: 'Grace Wanjiku',
      role: 'First-time Buyer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      text: 'The agent dashboard is fantastic. My agent was able to share virtual tours with me, making the entire experience smooth and transparent.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Real stories from real people who found their perfect properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors">
              {/* Rating Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-blue-50 mb-6 leading-relaxed">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-blue-200 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-amber-100 max-w-2xl mx-auto mb-8">
            Join thousands of agents and landlords who trust Kejapoa to showcase their properties with immersive 3D virtual tours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              List Your Property
            </Link>
            <a
              href="mailto:info@kejapoa.com"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component
export function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Kejapoa</span>
            </div>
            <p className="text-slate-400">
              Transforming property discovery with immersive 3D virtual tours and modern technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.686 7 1.742v1.493z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#properties" className="text-slate-400 hover:text-white transition-colors">Properties</a></li>
              <li><a href="#agents" className="text-slate-400 hover:text-white transition-colors">Our Agents</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Virtual Tours</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Property Types</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Apartments</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Houses</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Villas</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Commercial</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Land</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-slate-400">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>Westlands, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+254 700 123 456</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>info@kejapoa.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2024 Kejapoa. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Export all components
export default {
  Navbar,
  Hero,
  PropertyCard,
  FeaturedProperties,
  HowItWorks,
  Testimonials,
  CTASection,
  Footer,
};