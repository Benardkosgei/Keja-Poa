import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize, Heart, Share2, Phone, Mail,
  ChevronLeft, ChevronRight, X, CheckCircle2, Star, Send,
  Building2, Calendar, Eye, ArrowLeft, Play,
} from 'lucide-react';
import type { Property, Tour } from '@/types';
import { propertyApi, tourApi, inquiryApi, favoritesApi } from '@/services/api';
import { TourViewer } from '@/components/tour/TourViewer';
import { Navbar } from '@/components';
import { useAuth } from '@/contexts';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [prop, similar] = await Promise.all([
          propertyApi.getById(Number(id)),
          propertyApi.getAll({}, 1, 4),
        ]);
        setProperty(prop);
        setSimilarProperties(similar.properties.filter((p) => p.id !== Number(id)).slice(0, 3));
        // Tour is optional — fetch separately so a missing tour doesn't fail the whole page
        try {
          const tourData = await tourApi.getByProperty(Number(id));
          setTour(tourData as Tour);
        } catch {
          setTour(null); // Property simply has no published tour
        }
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fix #43: auto-open tour when ?tour=1 is present (used by mobile WebView)
  useEffect(() => {
    if (searchParams.get('tour') === '1' && tour) {
      setShowTour(true);
    }
  }, [searchParams, tour]);
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    favoritesApi.getAll().then((favs) => {
      const match = favs.find((f: any) => f.property === Number(id) || f.property?.id === Number(id));
      if (match) {
        setIsFavorited(true);
        setFavoriteId(match.id);
      }
    }).catch(() => {/* not critical */});
  }, [isAuthenticated, id]);

  const handleToggleFavorite = async () => {
    if (!property) return;
    setFavoriteLoading(true);
    try {
      if (isFavorited && favoriteId) {
        await favoritesApi.remove(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        const fav = await favoritesApi.add(property.id);
        setIsFavorited(true);
        setFavoriteId(fav.id);
      }
    } catch {
      // If not authenticated, just toggle locally
      setIsFavorited(f => !f);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setInquiryLoading(true);
    try {
      await inquiryApi.create({
        property: property.id,
        sender_name: inquiryForm.name,
        sender_email: inquiryForm.email,
        sender_phone: inquiryForm.phone,
        message: inquiryForm.message,
      });
      setInquirySent(true);
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setInquirySent(false), 5000);
    } catch (err: any) {
      // Fix #20: do NOT show success on failure — surface the real error
      const message = err?.message || 'Failed to send inquiry. Please try again.';
      alert(message);
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="aspect-[16/9] bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-32 bg-slate-200 rounded" />
              </div>
              <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center pt-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Property not found</h2>
          <Link to="/properties" className="text-blue-600 hover:underline">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, listingType: string) =>
    listingType === 'rent'
      ? `KSh ${price.toLocaleString()}/mo`
      : `KSh ${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* 3D Tour Fullscreen Overlay */}
      {showTour && tour && (
        <div className="fixed inset-0 z-[90] bg-black">
          <button
            onClick={() => setShowTour(false)}
            className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Close Tour</span>
          </button>
          <TourViewer scenes={tour.scenes} initialSceneId={tour.initial_scene} />
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-slate-300"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImage((prev) => (prev - 1 + property.images.length) % property.images.length);
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img
            src={property.images[activeImage]?.url}
            alt={property.images[activeImage]?.alt || property.title}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImage((prev) => (prev + 1) % property.images.length);
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {activeImage + 1} / {property.images.length}
          </div>
        </div>
      )}

      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-blue-600 transition-colors">Properties</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium truncate max-w-xs">{property.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`badge ${property.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'}`}>
                  For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                </span>
                {property.featured && <span className="badge badge-featured">Featured</span>}
                <span className="badge bg-slate-100 text-slate-700 capitalize">{property.property_type}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{property.title}</h1>
              <div className="flex items-center text-slate-500 mt-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{property.address}, {property.city}, {property.state}</span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(property.price, property.listing_type)}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                    isFavorited
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500'
                  } disabled:opacity-60`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span>{isFavorited ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: property.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied to clipboard!'));
                    }
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-8 h-[420px]">
            {/* Main image */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => { setActiveImage(0); setLightboxOpen(true); }}
            >
              <img
                src={property.images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
                alt={property.title}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
              {tour && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowTour(true); }}
                  className="absolute bottom-4 left-4 flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>View 3D Tour</span>
                </button>
              )}
            </div>
            {/* Thumbnails */}
            {property.images.slice(1, 5).map((img, i) => (
              <div
                key={img.id}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => { setActiveImage(i + 1); setLightboxOpen(true); }}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Image ${i + 2}`}
                  className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                />
                {i === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{property.images.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                  <div className="flex flex-col items-center py-2">
                    <Bed className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{property.bedrooms}</span>
                    <span className="text-sm text-slate-500">Bedrooms</span>
                  </div>
                  <div className="flex flex-col items-center py-2">
                    <Bath className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{property.bathrooms}</span>
                    <span className="text-sm text-slate-500">Bathrooms</span>
                  </div>
                  <div className="flex flex-col items-center py-2">
                    <Maximize className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{property.area_sqft.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">Sq. Ft.</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About this property</h2>
                <p className="text-slate-600 leading-relaxed">{property.description}</p>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <span className="text-sm text-slate-500">Property Type</span>
                    <p className="font-semibold text-slate-900 capitalize mt-0.5">{property.property_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Listing Type</span>
                    <p className="font-semibold text-slate-900 capitalize mt-0.5">For {property.listing_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">City</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{property.city}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Category</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{property.category.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Listed</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {new Date(property.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Status</span>
                    <p className="font-semibold text-emerald-600 capitalize mt-0.5">{property.status}</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-2 p-3 bg-slate-50 rounded-xl"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Tour Section */}
              {tour && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">3D Virtual Tour</h2>
                    <span className="text-sm text-slate-500">{tour.scenes.length} scenes</span>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 relative">
                    <TourViewer scenes={tour.scenes} initialSceneId={tour.initial_scene} />
                  </div>
                  <button
                    onClick={() => setShowTour(true)}
                    className="mt-4 w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Open Fullscreen Tour</span>
                  </button>
                </div>
              )}

              {/* Location Map Placeholder */}
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Location</h2>
                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100" />
                  <div className="relative text-center">
                    <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-900">{property.address}</p>
                    <p className="text-slate-500 text-sm">{property.city}, {property.state}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Sidebar */}
            <div className="space-y-6">
              {/* Agent Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Listed by</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">
                      {property.agent.user.first_name[0]}{property.agent.user.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {property.agent.user.first_name} {property.agent.user.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{property.agent.agency_name || 'Kejapoa Realty'}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(property.agent.rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{property.agent.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Total Listings</span>
                    <span className="font-semibold text-slate-900">{property.agent.total_listings}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Total Sales</span>
                    <span className="font-semibold text-slate-900">{property.agent.total_sales}</span>
                  </div>
                  {property.agent.verified && (
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified Agent</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${property.agent.user.phone || '+254700000000'}`}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${property.agent.user.email}`}
                    className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>

                <Link
                  to={`/agents/${property.agent.id}`}
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                >
                  View agent profile →
                </Link>
              </div>

              {/* Inquiry Form */}
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Send Inquiry</h3>

                {inquirySent ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="font-semibold text-slate-900">Message sent!</p>
                    <p className="text-sm text-slate-500 mt-1">The agent will get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm((p) => ({ ...p, name: e.target.value }))}
                      className="input-field text-sm py-2.5"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm((p) => ({ ...p, email: e.target.value }))}
                      className="input-field text-sm py-2.5"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm((p) => ({ ...p, phone: e.target.value }))}
                      className="input-field text-sm py-2.5"
                    />
                    <textarea
                      placeholder={`I'm interested in ${property.title}. Please contact me with more details.`}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm((p) => ({ ...p, message: e.target.value }))}
                      rows={4}
                      className="input-field text-sm py-2.5 resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={inquiryLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition-colors"
                    >
                      {inquiryLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Similar Properties</h2>
                <Link
                  to="/properties"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarProperties.map((p) => (
                  <SimilarPropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SimilarPropertyCard({ property }: { property: Property }) {
  return (
    <Link to={`/properties/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-3 left-3 badge ${property.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'}`}>
            For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
          </span>
        </div>
        <div className="p-4">
          <p className="text-xl font-bold text-blue-600 mb-1">
            KSh {property.price.toLocaleString()}
            {property.listing_type === 'rent' && '/mo'}
          </p>
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-500 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">{property.city}</span>
          </div>
          <div className="flex items-center space-x-3 mt-3 text-sm text-slate-600">
            <span>{property.bedrooms} Beds</span>
            <span>·</span>
            <span>{property.bathrooms} Baths</span>
            <span>·</span>
            <span>{property.area_sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
