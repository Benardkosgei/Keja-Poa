import { Link } from 'react-router-dom';
import { Navbar } from '@/components';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-7xl font-black text-blue-500 mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
