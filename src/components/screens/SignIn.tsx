import React, { useState } from 'react';
import { LockKeyhole, Mail, ShieldAlert, ArrowRight, Code2 } from 'lucide-react';
import { api } from '../../services/api';

interface SignInProps {
  onSuccess: (userEmail: string, isGuest: boolean) => void;
  onNotify: (msg: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSuccess, onNotify }) => {
  const [email, setEmail] = useState('sales@vsrsalesengine.com');
  const [password, setPassword] = useState('Sales123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await api.login(email, password);
      if (result.success && result.user) {
        onSuccess(result.user.email, result.user.isGuest);
        onNotify(`Welcome back, ${result.user.fullName}!`);
      } else {
        setError(result.errorMessage || 'Invalid credentials or authentication error.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.createGuestSession();
      if (result.success && result.user) {
        onSuccess(result.user.email, true);
        onNotify('Development guest session active (Simulated demo mode)');
      } else {
        setError(result.errorMessage || 'Guest mode bypass is disabled in this environment.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-brand">
          <div className="brand-mark"><span>V</span></div>
          <h2>VSR <b>Sales Engine</b></h2>
          <p>Sign in to your sales workspace or launch local guest mode.</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="signin-form">
          <label className="field-label">
            Work Email
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
          </label>

          <label className="field-label">
            Password
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </label>

          <button type="submit" className="btn primary full-width" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign in with JWT'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="signin-divider">
          <span>LOCAL DEVELOPMENT ONLY</span>
        </div>

        <button
          type="button"
          onClick={handleGuestEntry}
          className="btn guest-bypass-btn full-width"
          disabled={loading}
        >
          <Code2 size={16} />
          <span>Continue as Development Guest</span>
        </button>

        <div className="auth-notice-card">
          <p>
            <strong>JWT is default for production.</strong> Guest mode requires Development environment plus explicit server-side flag <code>Features:AllowDevelopmentGuest=true</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
