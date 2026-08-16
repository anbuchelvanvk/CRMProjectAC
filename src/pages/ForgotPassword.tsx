import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Briefcase, Mail, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const securityQuestion = localStorage.getItem('sec_q');
  const storedAnswer = localStorage.getItem('sec_a');

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (email !== 'admin@crmpro.com') {
      setError('Account not found for this email.');
      return;
    }
    
    if (!securityQuestion || !storedAnswer) {
      setError('No security question configured for this account. Please contact support.');
      return;
    }
    
    setStep(2);
  };

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (securityAnswer.trim().toLowerCase() !== storedAnswer?.trim().toLowerCase()) {
      setError('Incorrect security answer.');
      setLoading(false);
      return;
    }
    
    try {
      // If the answer is correct, trigger the Supabase password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/CRMProjectAC/#/login',
      });
      
      if (error) throw error;
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="card w-full max-w-md p-8 animate-fade-in mx-4">
        
        {step === 1 && (
          <>
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="sidebar-logo-icon mb-4" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)' }}>
                <Briefcase size={28} />
              </div>
              <h1 className="h2 mb-2">Password Recovery</h1>
              <p className="text-muted text-sm">Enter your email to verify your account.</p>
            </div>

            {error && <div className="p-3 mb-6 bg-danger-light text-danger rounded-md text-sm border border-danger font-medium text-center">{error}</div>}

            <form onSubmit={handleVerifyEmail} className="flex flex-col gap-4">
              <div className="form-group mb-2">
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
              
              <button type="submit" className="btn btn-primary w-full py-3 h-12">
                Verify Account
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-primary font-medium hover:underline">Back to Login</Link>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="sidebar-logo-icon mb-4 bg-warning" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--warning), #f97316)' }}>
                <ShieldAlert size={28} />
              </div>
              <h1 className="h2 mb-2">Security Question</h1>
              <p className="text-muted text-sm">Answer your security question to receive a password reset link.</p>
            </div>

            {error && <div className="p-3 mb-6 bg-danger-light text-danger rounded-md text-sm border border-danger font-medium text-center">{error}</div>}

            <form onSubmit={handleVerifyAnswer} className="flex flex-col gap-4">
              <div className="form-group mb-2">
                <label className="form-label">Question: <span className="font-semibold text-main">{securityQuestion}</span></label>
                <input 
                  type="password" 
                  className="form-input mt-2" 
                  placeholder="Enter your answer" 
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full py-3 h-12" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Answer'}
              </button>
              
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-primary font-medium hover:underline">Change Email</button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success-light text-success flex items-center justify-center mb-6">
              <CheckCircle size={32} />
            </div>
            <h1 className="h2 mb-2">Link Sent!</h1>
            <p className="text-muted text-sm mb-8">
              A secure password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary w-full py-3 h-12">
              Return to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
