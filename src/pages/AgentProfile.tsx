import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, CheckCircle2, MapPin, Phone, Mail, Building2,
  ArrowLeft, Briefcase, Award, Home,
} from 'lucide-react';
import type { Agent, Property } from '@/types';
import { agentApi, propertyApi } from '@/services/api';
import { Navbar } from '@/components';

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [agentData, propsData] = await Promise.all([
          agentApi.getById(Number(id)),
          propertyApi.getAll({ agent: Number(id) }, 1, 6),
        ]);
        setAgent(agentData);
        setProperties(propsData.properties);
      } catch (err) {
        console.error('Failed to load agent:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-20 max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center pt-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Agent not found</h2>
          <Link to="/agents" className="text-blue-600 hover:underline">Back to agents</Link>
        </div>
      </div>
    );
  }

  const colors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-purple-100 text-purple-600'];
  const colorClass = colors[agent.id % colors.length];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20">
        {/* Back */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/agents"
            className="inline-flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Agents</span>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800" />

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 mb-6 gap-4">
                {/* Avatar */}
                <div className={`w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold ${colorClass}`}>
                  {agent.user.first_name[0]}{agent.user.last_name[0]}
                </div>

                {/* Contact Buttons */}
                <div className="flex items-center space-x-2">
                  {agent.user.phone && (
                    <a
                      href={`tel:${agent.user.phone}`}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${agent.user.email}`}
                    className="flex items-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {agent.user.first_name} {agent.user.last_name}
                    </h1>
                    {agent.verified && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" title="Verified Agent" />
                    )}
                  </div>
                  <p className="text-slate-500 mb-2">{agent.agency_name || 'Independent Agent'}</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(agent.rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
                      />
                    ))}
                    <span className="text-sm text-slate-600 ml-1 font-medium">{agent.rating.toFixed(1)} rating</span>
                  </div>
                </div>

                {agent.license_number && (
                  <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>License: <span className="font-medium text-slate-700">{agent.license_number}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Home, label: 'Total Listings', value: agent.total_listings, color: 'text-blue-600 bg-blue-50' },
              { icon: Briefcase, label: 'Total Sales', value: agent.total_sales, color: 'text-emerald-600 bg-emerald-50' },
              { icon: Star, label: 'Rating', value: agent.rating.toFixed(1), color: 'text-amber-600 bg-amber-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-md text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-md mb-6 w-fit">
            {(['listings', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'listings' ? `Listings (${properties.length})` : 'About'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'listings' && (
            <div>
              {properties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-md text-center">
                  <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No listings available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <AgentPropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-6">
              {agent.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Biography</h3>
                  <p className="text-slate-600 leading-relaxed">{agent.bio}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a href={`mailto:${agent.user.email}`} className="hover:text-blue-600 transition-colors">
                      {agent.user.email}
                    </a>
                  </div>
                  {agent.user.phone && (
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <a href={`tel:${agent.user.phone}`} className="hover:text-blue-600 transition-colors">
                        {agent.user.phone}
                      </a>
                    </div>
                  )}
                  {agent.agency_name && (
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>{agent.agency_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {agent.verified && (
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800">Verified Agent</p>
                      <p className="text-sm text-emerald-600">This agent has been verified by Kejapoa</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentPropertyCard({ property }: { property: Property }) {
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
          <div className="flex items-center text-slate-500 text-sm mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">{property.city}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-600 border-t border-slate-100 pt-3">
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
