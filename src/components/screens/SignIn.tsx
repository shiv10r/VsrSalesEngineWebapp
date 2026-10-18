import React, { useState } from 'react';
import {
  LockKeyhole,
  Mail,
  ShieldAlert,
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Globe2,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

interface SignInProps {
  onSuccess: (userEmail: string, isGuest: boolean) => void;
  onNotify: (msg: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSuccess, onNotify }) => {
  const [email, setEmail] = useState('sales@vsrsalesengine.com');
  const [password, setPassword] = useState('Sales123!');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="signin-shell">
      {/* Left Hero & Feature Showcase */}
      <aside className="signin-aside">
        <div className="signin-brand">
          <div className="signin-logo-badge">
            <span>V</span>
          </div>
          <div className="signin-brand-title">
            <span>VSR <b>Sales Engine</b></span>
            <span className="signin-version-tag">v0.1.0 LTS</span>
          </div>
        </div>

        <div className="signin-message">
          <div className="signin-eyebrow">
            <Sparkles size={13} />
            <span>ENTERPRISE B2B SALES PLATFORM</span>
          </div>

          <h1>Autonomous Lead Ingestion & Compliance Governance</h1>
          <p>
            Seamlessly discover commercial opportunities across company careers and public portals,
            synthesize grounded consultative outreach, and enforce statutory anti-spam compliance gates with Google Gemini AI.
          </p>

          <div className="signin-features-grid">
            <div className="signin-feature-item">
              <div className="signin-feature-icon">
                <Globe2 size={16} />
              </div>
              <div>
                <strong>Autonomous Discovery</strong>
                <span>Continuous background scans across careers, approved feeds, and procurement registries.</span>
              </div>
            </div>

            <div className="signin-feature-item">
              <div className="signin-feature-icon">
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong>6-Point Compliance Gate</strong>
                <span>Strict fail-closed verification of sender identity, address, opt-out mechanisms, and daily caps.</span>
              </div>
            </div>

            <div className="signin-feature-item">
              <div className="signin-feature-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <strong>Gemini 2.5 Flash Extraction</strong>
                <span>1-click unstructured job snippet parsing, entity extraction, and smart form population.</span>
              </div>
            </div>

            <div className="signin-feature-item">
              <div className="signin-feature-icon">
                <Layers size={16} />
              </div>
              <div>
                <strong>Immutable Audit & Test Sink</strong>
                <span>Complete pipeline stage history with sandbox test-sink routing for zero risk.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signin-aside-footer">
          <div className="signin-status-indicator">
            <span className="status-dot-pulse" />
            <span>Live Engine Connected • .NET 10 LTS Backend</span>
          </div>
          <span>SOC-2 & GDPR Fail-Closed Ready</span>
        </div>
      </aside>

      {/* Right Sign-in Form */}
      <main className="signin-main">
        <div className="signin-card">
          <div className="signin-card-header">
            <div className="signin-card-icon-wrap">
              <LockKeyhole size={20} />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your sales workspace or launch local guest mode.</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="signin-form">
            <div className="signin-field-group">
              <label className="field-label" htmlFor="work-email">
                <span>Work Email</span>
                <span className="field-hint">e.g. sales@vsrsalesengine.com</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="work-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="signin-field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="work-password">
                  <span>Password</span>
                </label>
                <span className="field-hint">Default: Sales123!</span>
              </div>
              <div className="input-with-icon">
                <LockKeyhole size={16} className="input-icon" />
                <input
                  id="work-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn primary full-width signin-submit-btn" disabled={loading}>
              <span>{loading ? 'Authenticating session...' : 'Sign in with JWT'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="signin-separator">
            <span>OR QUICK ACCESS FOR EVALUATION</span>
          </div>

          <button
            type="button"
            onClick={handleGuestEntry}
            className="btn guest-bypass-btn full-width"
            disabled={loading}
          >
            <div className="guest-btn-content">
              <div className="guest-btn-icon">
                <Code2 size={16} />
              </div>
              <div className="guest-btn-text">
                <span className="guest-btn-title">Continue as Development Guest</span>
                <span className="guest-btn-sub">Instant sandbox access • Zero credential setup</span>
              </div>
            </div>
            <span className="guest-pill-tag">DEMO</span>
          </button>

          <div className="auth-notice-card">
            <ShieldCheck size={16} className="auth-notice-icon" />
            <p>
              <strong>JWT authentication</strong> is enforced in production. Guest bypass is restricted to local development environments via <code>Features:AllowDevelopmentGuest=true</code>.
            </p>
          </div>

          <div className="signin-bottom-links">
            <span>🔒 End-to-end Encrypted</span>
            <span>•</span>
            <span>Role-Based Access</span>
            <span>•</span>
            <span>API v0.1.0</span>
          </div>
        </div>
      </main>
    </div>
  );
};
