import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ToastProvider } from '@/contexts';
import { Navbar, Hero, FeaturedProperties, HowItWorks, Testimonials, CTASection, Footer } from '@/components';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PropertiesPage from '@/pages/Properties';
import PropertyDetailPage from '@/pages/PropertyDetail';
import AgentsPage from '@/pages/Agents';
import AgentProfilePage from '@/pages/AgentProfile';
import DashboardPage from '@/pages/Dashboard';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import NotFoundPage from '@/pages/NotFound';
import { useEffect, useState } from 'react';
import { propertyApi } from '@/services/api';
import type { Property } from '@/types';

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  useEffect(() => {
    propertyApi.getFeatured()
      .then(properties => setFeaturedProperties(properties))
      .catch(() => {
        // Featured section just stays empty — no crash, no fake data
      });
  }, []);

  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedProperties properties={featuredProperties} />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/"                element={<HomePage />} />
              <Route path="/properties"      element={<PropertiesPage />} />
              <Route path="/properties/:id"  element={<PropertyDetailPage />} />
              <Route path="/agents"          element={<AgentsPage />} />
              <Route path="/agents/:id"      element={<AgentProfilePage />} />

              {/* Fix #35: dedicated auth routes */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/:role"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Fix #39: 404 catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
