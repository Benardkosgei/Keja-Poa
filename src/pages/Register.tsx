import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Navbar } from '@/components';

/**
 * Dedicated /register route.
 * Opens the register auth modal on page load.
 */
export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar openAuthModal="register" />
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-slate-400 text-sm">Loading registration…</p>
      </div>
    </div>
  );
}
