import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Navbar } from '@/components';

/**
 * Dedicated /login route.
 * Opens the auth modal on page load via state so the Navbar can handle it,
 * and redirects already-authenticated users to their dashboard.
 */
export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // The Navbar reads openAuth state to pop the modal automatically
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar openAuthModal="login" />
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-slate-400 text-sm">Loading sign-in…</p>
      </div>
    </div>
  );
}
