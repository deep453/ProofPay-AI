import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { Home } from 'lucide-react';

export default function NotFound() {
  const { role } = useAuth();
  const homePath = role === 'developer' ? '/developer/dashboard' : '/client/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl font-mono mb-4 border border-blue-200">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The requested ProofPay route does not exist or has been moved to another location.
      </p>

      <Link to={homePath}>
        <Button variant="primary" size="md" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
