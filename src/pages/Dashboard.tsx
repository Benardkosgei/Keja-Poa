import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  BarChart2,
  Settings,
  MessageSquare,
  Heart,
  Eye,
  PlusCircle,
  Video,
  CheckCircle,
  XCircle,
  DollarSign,
  Wrench,
  UserCheck,
  List,
  LogOut,
  ChevronRight,
  Bell,
  Star,
} from 'lucide-react';
import { useAuth } from '@/contexts';
import { Navbar, Footer } from '@/components';
import type { Property, Agent, Inquiry } from '@/types';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${color} shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Badge({
  status,
}: {
  status: 'approved' | 'pending' | 'rejected' | 'new' | 'read' | 'replied' | string;
}) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-slate-100 text-slate-600',
    replied: 'bg-purple-100 text-purple-700',
    active: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
        map[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  );
}

interface SidebarLink {
  label: string;
  icon: React.ElementType;
  href: string;
}

function Sidebar({
  links,
  active,
  onSelect,
  user,
  onLogout,
}: {
  links: SidebarLink[];
  active: string;
  onSelect: (label: string) => void;
  user: { first_name: string; last_name: string; role: string; email: string; avatar?: string };
  onLogout: () => void;
}) {
  const handleSelect = (label: string, href: string) => {
    onSelect(label);

    if (href.startsWith('#')) {
      const target = document.getElementById(href.slice(1));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col flex-shrink-0">
      {/* Avatar */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user.first_name[0]}
            {user.last_name[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-100 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-slate-400 capitalize truncate">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ label, icon: Icon, href }) => (
          <button
            key={label}
            onClick={() => handleSelect(label, href)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active === label
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const mockSavedProperties = [
  { id: 1, title: 'Luxury Apartment in Westlands', city: 'Nairobi', price: 'KSh 85,000/mo', type: 'rent', status: 'approved' },
  { id: 2, title: 'Modern Villa in Karen', city: 'Nairobi', price: 'KSh 45,000,000', type: 'sale', status: 'approved' },
  { id: 3, title: 'Cozy Studio in Kilimani', city: 'Nairobi', price: 'KSh 35,000/mo', type: 'rent', status: 'approved' },
];

const mockInquiries = [
  { id: 1, property: 'Luxury Apartment in Westlands', message: 'Is this still available?', status: 'replied', date: '2024-05-10' },
  { id: 2, property: 'Modern Villa in Karen', message: 'Can I schedule a tour?', status: 'new', date: '2024-05-12' },
  { id: 3, property: 'Cozy Studio in Kilimani', message: 'What utilities are included?', status: 'read', date: '2024-05-14' },
];

const mockAgentListings = [
  { id: 1, title: 'Spacious House in Runda', city: 'Nairobi', price: 'KSh 120,000,000', status: 'approved', views: 342, leads: 12 },
  { id: 2, title: 'Office Space in CBD', city: 'Nairobi', price: 'KSh 200,000/mo', status: 'pending', views: 89, leads: 4 },
  { id: 3, title: 'Apartment in Lavington', city: 'Nairobi', price: 'KSh 95,000/mo', status: 'approved', views: 215, leads: 8 },
  { id: 4, title: 'Land in Ruiru', city: 'Kiambu', price: 'KSh 8,500,000', status: 'pending', views: 56, leads: 2 },
];

const mockAgentInquiries = [
  { id: 1, sender: 'Alice Kamau', property: 'Spacious House in Runda', message: 'Interested in viewing', status: 'new', date: '2024-05-14' },
  { id: 2, sender: 'Brian Otieno', property: 'Apartment in Lavington', message: 'Price negotiable?', status: 'replied', date: '2024-05-13' },
  { id: 3, sender: 'Carol Njeri', property: 'Office Space in CBD', message: 'Available from June?', status: 'read', date: '2024-05-12' },
];

const mockLandlordProperties = [
  { id: 1, title: 'Westlands Apartments Block A', units: 12, occupied: 10, tenant: 'Multiple Tenants', rent: 'KSh 960,000/mo', maintenance: 1 },
  { id: 2, title: 'Karen Villa', units: 1, occupied: 1, tenant: 'James Mwangi', rent: 'KSh 150,000/mo', maintenance: 0 },
  { id: 3, title: 'Kilimani Studio Complex', units: 8, occupied: 6, tenant: 'Multiple Tenants', rent: 'KSh 280,000/mo', maintenance: 2 },
];

const mockTenants = [
  { id: 1, name: 'James Mwangi', property: 'Karen Villa', unit: 'Unit 1', rent: 'KSh 150,000', status: 'active', since: 'Jan 2023' },
  { id: 2, name: 'Grace Wanjiku', property: 'Westlands Apartments', unit: 'Unit 3A', rent: 'KSh 80,000', status: 'active', since: 'Mar 2023' },
  { id: 3, name: 'Peter Kariuki', property: 'Kilimani Studio', unit: 'Studio 2', rent: 'KSh 45,000', status: 'active', since: 'Jun 2023' },
];

const mockPendingApprovals = [
  { id: 1, title: 'Office Space in CBD', agent: 'John Mwangi', type: 'commercial', price: 'KSh 200,000/mo', submitted: '2024-05-13' },
  { id: 2, title: 'Land in Ruiru', agent: 'Sarah Ochieng', type: 'land', price: 'KSh 8,500,000', submitted: '2024-05-12' },
  { id: 3, title: 'Apartment in Thika', agent: 'David Kimani', type: 'apartment', price: 'KSh 55,000/mo', submitted: '2024-05-11' },
];

const mockRecentSignups = [
  { id: 1, name: 'Alice Kamau', email: 'alice@example.com', role: 'client', joined: '2024-05-14' },
  { id: 2, name: 'Brian Otieno', email: 'brian@example.com', role: 'agent', joined: '2024-05-13' },
  { id: 3, name: 'Carol Njeri', email: 'carol@example.com', role: 'landlord', joined: '2024-05-12' },
  { id: 4, name: 'Daniel Wambua', email: 'daniel@example.com', role: 'tenant', joined: '2024-05-11' },
];

// ─── Client Dashboard ──────────────────────────────────────────────────────────

function ClientDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [active, setActive] = useState('Overview');
  const links: SidebarLink[] = [
    { label: 'Overview', icon: Home, href: '#client-overview' },
    { label: 'Saved Properties', icon: Heart, href: '#client-saved-properties' },
    { label: 'My Inquiries', icon: MessageSquare, href: '#client-inquiries' },
    { label: 'Virtual Tours', icon: Video, href: '#client-virtual-tours' },
    { label: 'Profile', icon: UserCheck, href: '#client-profile' },
  ];

  return (
    <div className="flex flex-1">
      <Sidebar links={links} active={active} onSelect={setActive} user={user} onLogout={onLogout} />

      <main className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-950 text-slate-100">
        <div id="client-overview" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-6 md:p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.first_name}!</h1>
          <p className="text-slate-300 mt-2">Your saved listings, inquiries, and tours are all in one place.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Saved Properties" value={3} icon={Heart} color="bg-rose-500" sub="2 new this week" />
          <StatCard label="Inquiries Sent" value={3} icon={MessageSquare} color="bg-blue-600" sub="1 awaiting reply" />
          <StatCard label="Tours Viewed" value={5} icon={Eye} color="bg-purple-600" sub="Last: 2 days ago" />
        </div>

        {/* Saved Properties */}
        <div id="client-saved-properties" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Saved Properties</h2>
            <Link to="/properties" className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1">
              Browse more <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockSavedProperties.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-400/25 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-100 text-sm">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-300">{p.price}</span>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div id="client-inquiries" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Recent Inquiries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-medium">Property</th>
                  <th className="pb-3 font-medium">Message</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockInquiries.map((inq) => (
                  <tr key={inq.id} className="border-b border-slate-900 hover:bg-slate-950 transition-colors">
                    <td className="py-3 font-medium text-slate-100">{inq.property}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{inq.message}</td>
                    <td className="py-3 text-slate-400">{inq.date}</td>
                    <td className="py-3">
                      <Badge status={inq.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile Section */}
        <div id="client-virtual-tours" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Virtual Tours</h2>
            <Link to="/properties" className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1">
              Explore tours <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockSavedProperties.map((tour) => (
              <div key={tour.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-400/25 flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-100 text-sm">{tour.title}</p>
                    <p className="text-xs text-slate-400">360° walkthrough available</p>
                  </div>
                </div>
                <button className="text-xs text-blue-300 hover:text-blue-200">Watch</button>
              </div>
            ))}
          </div>
        </div>

        <div id="client-profile" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
              <input
                defaultValue={user.first_name}
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
              <input
                defaultValue={user.last_name}
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input
                defaultValue={user.email}
                type="email"
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
              <input
                defaultValue={user.phone || '+254700000000'}
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => alert('Profile updated successfully!')}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Agent Dashboard ───────────────────────────────────────────────────────────

function AgentDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const navigate = useNavigate();
  const [active, setActive] = useState('Overview');
  const links: SidebarLink[] = [
    { label: 'Overview', icon: Home, href: '#agent-overview' },
    { label: 'My Listings', icon: Building2, href: '#agent-listings' },
    { label: 'Leads', icon: Users, href: '#agent-leads' },
    { label: 'Tours', icon: Video, href: '#agent-tours' },
    { label: 'Profile', icon: UserCheck, href: '#agent-profile' },
  ];

  return (
    <div className="flex flex-1">
      <Sidebar links={links} active={active} onSelect={setActive} user={user} onLogout={onLogout} />

      <main className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-950 text-slate-100">
        {/* Header */}
        <div id="agent-overview" className="flex items-center justify-between rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 p-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
            <p className="text-slate-300 mt-1">Manage listings, leads, and virtual tours with faster workflows.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/properties"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Property
            </Link>
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Video className="w-4 h-4" />
              Create Tour
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="My Listings" value={4} icon={Building2} color="bg-blue-600" sub="2 approved" />
          <StatCard label="Active Leads" value={26} icon={Users} color="bg-emerald-500" sub="+5 this week" />
          <StatCard label="Virtual Tours" value={3} icon={Video} color="bg-purple-600" sub="2 published" />
          <StatCard label="Total Views" value="702" icon={Eye} color="bg-amber-500" sub="Last 30 days" />
        </div>

        {/* Quick Actions */}
        <div id="agent-tours" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Add New Property', icon: PlusCircle, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100', onClick: () => navigate('/properties') },
            { label: 'Create Virtual Tour', icon: Video, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100', onClick: () => navigate('/properties') },
            { label: 'View Analytics', icon: BarChart2, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100', onClick: () => alert('Analytics dashboard coming soon!') },
          ].map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-3 p-4 rounded-xl font-medium text-sm transition-colors text-slate-200 border border-slate-800 bg-slate-900/70 hover:bg-slate-800"
            >
              <Icon className="w-5 h-5 text-blue-300" />
              {label}
            </button>
          ))}
        </div>

        {/* My Listings Table */}
        <div id="agent-listings" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">My Listings</h2>
            <button className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-medium">Property</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Views</th>
                  <th className="pb-3 font-medium">Leads</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockAgentListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-slate-900 hover:bg-slate-950 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-slate-100">{listing.title}</p>
                        <p className="text-xs text-slate-400">{listing.city}</p>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-blue-300">{listing.price}</td>
                    <td className="py-3 text-slate-300">{listing.views}</td>
                    <td className="py-3 text-slate-300">{listing.leads}</td>
                    <td className="py-3">
                      <Badge status={listing.status} />
                    </td>
                    <td className="py-3">
                      <button className="text-xs text-blue-300 hover:text-blue-200 mr-3">Edit</button>
                      <button className="text-xs text-slate-400 hover:text-slate-200">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div id="agent-leads" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Recent Inquiries</h2>
          <div className="space-y-3">
            {mockAgentInquiries.map((inq) => (
              <div
                key={inq.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                    {inq.sender[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-100 text-sm">{inq.sender}</p>
                    <p className="text-xs text-slate-400">{inq.property}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{inq.date}</span>
                  <Badge status={inq.status} />
                  <button className="text-xs text-blue-300 hover:text-blue-200">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Landlord Dashboard ────────────────────────────────────────────────────────

function LandlordDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const navigate = useNavigate();
  const [active, setActive] = useState('Overview');
  const links: SidebarLink[] = [
    { label: 'Overview', icon: Home, href: '#landlord-overview' },
    { label: 'Properties', icon: Building2, href: '#landlord-properties' },
    { label: 'Tenants', icon: Users, href: '#landlord-tenants' },
    { label: 'Payments', icon: DollarSign, href: '#landlord-payments' },
    { label: 'Profile', icon: UserCheck, href: '#landlord-profile' },
  ];

  return (
    <div className="flex flex-1">
      <Sidebar links={links} active={active} onSelect={setActive} user={user} onLogout={onLogout} />

      <main className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-950 text-slate-100">
        {/* Header */}
        <div id="landlord-overview" className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-white">Landlord Dashboard</h1>
          <p className="text-slate-300 mt-1">Manage your properties, tenants, and payments.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Properties" value={3} icon={Building2} color="bg-blue-600" sub="21 total units" />
          <StatCard label="Active Tenants" value={17} icon={Users} color="bg-emerald-500" sub="81% occupancy" />
          <StatCard
            label="Monthly Revenue"
            value="KSh 1.39M"
            icon={DollarSign}
            color="bg-amber-500"
            sub="+8% vs last month"
          />
          <StatCard label="Pending Maintenance" value={3} icon={Wrench} color="bg-red-500" sub="2 urgent" />
        </div>

        {/* Properties List */}
        <div id="landlord-properties" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">My Properties</h2>
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Property
            </button>
          </div>
          <div className="space-y-4">
            {mockLandlordProperties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{prop.title}</p>
                    <p className="text-xs text-slate-400">
                      {prop.occupied}/{prop.units} units occupied · {prop.tenant}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-semibold text-blue-300">{prop.rent}</p>
                    <p className="text-xs text-slate-400">Monthly income</p>
                  </div>
                  {prop.maintenance > 0 ? (
                    <span className="flex items-center gap-1 text-rose-300 text-xs font-medium">
                      <Wrench className="w-3.5 h-3.5" />
                      {prop.maintenance} issue{prop.maintenance > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-300 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      All clear
                    </span>
                  )}
                  <button className="text-xs text-blue-300 hover:text-blue-200">Manage</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenants Table */}
        <div id="landlord-tenants" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Active Tenants</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-medium">Tenant</th>
                  <th className="pb-3 font-medium">Property</th>
                  <th className="pb-3 font-medium">Unit</th>
                  <th className="pb-3 font-medium">Rent</th>
                  <th className="pb-3 font-medium">Since</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-slate-900 hover:bg-slate-950 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/25 flex items-center justify-center text-blue-300 font-semibold text-xs">
                          {tenant.name[0]}
                        </div>
                        <span className="font-medium text-slate-100">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{tenant.property}</td>
                    <td className="py-3 text-slate-300">{tenant.unit}</td>
                    <td className="py-3 font-semibold text-blue-300">{tenant.rent}</td>
                    <td className="py-3 text-slate-400">{tenant.since}</td>
                    <td className="py-3">
                      <Badge status={tenant.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [active, setActive] = useState('Overview');
  const [approvals, setApprovals] = useState(mockPendingApprovals);

  const links: SidebarLink[] = [
    { label: 'Overview', icon: Home, href: '#' },
    { label: 'Properties', icon: Building2, href: '#' },
    { label: 'Users', icon: Users, href: '#' },
    { label: 'Agents', icon: Star, href: '#' },
    { label: 'Tours', icon: Video, href: '#' },
    { label: 'Analytics', icon: BarChart2, href: '#' },
    { label: 'Settings', icon: Settings, href: '#' },
  ];

  const handleApprove = (id: number) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReject = (id: number) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const adminStats = [
    {
      label: 'Total Users',
      value: '1,284',
      delta: '+24 this week',
      icon: Users,
      accent: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-400/30',
    },
    {
      label: 'Listed Properties',
      value: '342',
      delta: '18 pending review',
      icon: Building2,
      accent: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/30',
    },
    {
      label: 'Active Agents',
      value: '87',
      delta: '12 new this month',
      icon: UserCheck,
      accent: 'from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-400/30',
    },
    {
      label: 'Virtual Tours',
      value: '156',
      delta: '34 published',
      icon: Video,
      accent: 'from-rose-500/20 to-orange-500/20 text-rose-300 border-rose-400/30',
    },
  ];

  const actionCards = [
    { label: 'Properties Listed Today', value: 4, icon: List, color: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20' },
    { label: 'New Inquiries Today', value: 18, icon: MessageSquare, color: 'text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20' },
    { label: 'Tours Viewed Today', value: 63, icon: Eye, color: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' },
  ];

  return (
    <div className="flex flex-1">
      <Sidebar links={links} active={active} onSelect={setActive} user={user} onLogout={onLogout} />

      <main className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-950 text-slate-100">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-300/80">Control Center</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Admin Intelligence Dashboard</h1>
              <p className="mt-2 text-slate-300 max-w-2xl">
                Welcome back, {user.first_name}. Monitor performance, review approvals, and manage platform operations in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors">
                Export Report
              </button>
              <button className="relative p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition-colors">
                <Bell className="w-5 h-5 text-slate-300" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {adminStats.map(({ label, value, delta, icon: Icon, accent }) => (
              <div
                key={label}
                className={`rounded-2xl border bg-gradient-to-br p-4 backdrop-blur-sm ${accent}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-300">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-xs text-slate-300">{delta}</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                Pending Approvals
                {approvals.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full text-xs font-semibold">
                    {approvals.length}
                  </span>
                )}
              </h2>
              <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {approvals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="font-medium text-slate-300">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.agent} • <span className="capitalize">{item.type}</span> • {item.submitted}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-blue-300">{item.price}</span>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Platform Pulse</h2>
            <p className="text-sm text-slate-400 mt-1">System health and engagement signals.</p>

            <div className="mt-5 space-y-4">
              {[
                { label: 'Approval turnaround', value: '82%', width: '82%' },
                { label: 'User retention', value: '74%', width: '74%' },
                { label: 'Tour completion', value: '68%', width: '68%' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                    <span>{metric.label}</span>
                    <span>{metric.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: metric.width }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Revenue</p>
              <p className="mt-2 text-2xl font-bold text-white">KSh 4.2M</p>
              <p className="text-xs text-emerald-300 mt-1">+15% compared to last month</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Recent Signups</h2>
              <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1">
                Manage users <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {mockRecentSignups.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-950/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-semibold text-sm">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={u.role} />
                    <span className="text-xs text-slate-500">{u.joined}</span>
                    <button className="text-xs text-blue-300 hover:text-blue-200">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Live Activity</h2>
            <p className="text-sm text-slate-400 mt-1">Today at a glance.</p>

            <div className="mt-5 space-y-3">
              {actionCards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${color}`}>
                  <div className="h-10 w-10 rounded-lg bg-slate-900/60 border border-slate-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-100">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
              Open Full Analytics
            </button>
          </div>
        </div>

        <div id="agent-profile" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Agent Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
              <input
                defaultValue={user.first_name}
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
              <input
                defaultValue={user.last_name}
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input
                defaultValue={user.email}
                type="email"
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
              <input
                defaultValue={user.phone || '+254700000000'}
                className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div id="landlord-payments" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Payments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Collected This Month</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">KSh 1.39M</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Outstanding Balance</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">KSh 210K</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Overdue Tenants</p>
              <p className="text-2xl font-bold text-rose-300 mt-1">3</p>
            </div>
          </div>
        </div>

        <div id="landlord-profile" className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
              <input defaultValue={user.first_name} className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
              <input defaultValue={user.last_name} className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input defaultValue={user.email} className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
              <input defaultValue={user.phone || '+254700000000'} className="w-full px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 rounded-xl text-sm outline-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main DashboardPage ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-md p-12 max-w-md mx-4">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Sign In</h2>
            <p className="text-slate-500 mb-6">
              You need to be signed in to access your dashboard.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'client':
      case 'tenant':
        return <ClientDashboard user={user} onLogout={logout} />;
      case 'agent':
        return <AgentDashboard user={user} onLogout={logout} />;
      case 'landlord':
        return <LandlordDashboard user={user} onLogout={logout} />;
      case 'admin':
      case 'super_admin':
        return <AdminDashboard user={user} onLogout={logout} />;
      default:
        return <ClientDashboard user={user} onLogout={logout} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      {/* Offset for fixed navbar */}
      <div className="pt-16 md:pt-20 flex flex-1">
        {renderDashboard()}
      </div>
      <Footer />
    </div>
  );
}
