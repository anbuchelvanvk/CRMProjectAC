import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Briefcase, Mail, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="card w-full max-w-md p-8 animate-fade-in mx-4">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="sidebar-logo-icon mb-4" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)' }}>
            <Briefcase size={28} />
          </div>
          <h1 className="h2 mb-2">Welcome Back</h1>
          <p className="text-muted text-sm">Sign in to CRM Pro to manage your firm.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-danger-light text-danger rounded-md text-sm border border-danger font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="form-group mb-0 relative">
            <label className="form-label">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="admin@crmpro.com" 
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-2 relative">
            <label className="form-label">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 h-12" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted">
          Need an account? Please contact your administrator.
        </div>
      </div>
    </div>
  );
}
