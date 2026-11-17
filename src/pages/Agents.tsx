import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, CheckCircle2, MapPin, Phone, Mail, Building2, ChevronRight } from 'lucide-react';
import type { Agent } from '@/types';
import { agentApi } from '@/services/api';
import { Navbar } from '@/components';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const result = await agentApi.getAll(page);
        setAgents(result.agents);
        setTotalPages(result.total_pages);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [page]);

  const filtered = agents.filter((a) => {
    const name = `${a.user.first_name} ${a.user.last_name}`.toLowerCase();
    const agency = (a.agency_name || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || agency.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4">
              Our Team
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Agents</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-8">
              Professional, verified real estate agents ready to help you find your perfect property in Kenya.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or agency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              {[
                { label: 'Active Agents', value: '150+' },
                { label: 'Properties Listed', value: '2,500+' },
                { label: 'Successful Sales', value: '1,200+' },
                { label: 'Cities Covered', value: '12' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-slate-200 rounded mb-4" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No agents found</h3>
              <p className="text-slate-500">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center mt-10 space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                    page === i + 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Are you a real estate agent?</h2>
            <p className="text-slate-600 mb-8">
              Join Kejapoa and reach thousands of property seekers. List your properties with immersive 3D virtual tours.
            </p>
            <Link
              to="/dashboard/agent"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <span>Join as an Agent</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const initials = `${agent.user.first_name[0]}${agent.user.last_name[0]}`;
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-purple-100 text-purple-600',
    'bg-rose-100 text-rose-600',
  ];
  const colorClass = colors[agent.id % colors.length];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold ${colorClass}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-900 truncate">
              {agent.user.first_name} {agent.user.last_name}
            </h3>
            {agent.verified && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" title="Verified Agent" />
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{agent.agency_name || 'Independent Agent'}</p>
          {/* Stars */}
          <div className="flex items-center space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(agent.rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
              />
            ))}
            <span className="text-xs text-slate-500 ml-1">{agent.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {agent.bio && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">{agent.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-900">{agent.total_listings}</div>
          <div className="text-xs text-slate-500">Listings</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-900">{agent.total_sales}</div>
          <div className="text-xs text-slate-500">Sales</div>
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center space-x-2 mb-4 text-sm text-slate-500">
        <Mail className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{agent.user.email}</span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          to={`/agents/${agent.id}`}
          className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          View Profile
        </Link>
        <a
          href={`mailto:${agent.user.email}`}
          className="p-2.5 border border-slate-200 hover:border-blue-200 hover:text-blue-600 rounded-xl transition-colors"
          title="Send email"
        >
          <Mail className="w-4 h-4" />
        </a>
        {agent.user.phone && (
          <a
            href={`tel:${agent.user.phone}`}
            className="p-2.5 border border-slate-200 hover:border-blue-200 hover:text-blue-600 rounded-xl transition-colors"
            title="Call agent"
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
