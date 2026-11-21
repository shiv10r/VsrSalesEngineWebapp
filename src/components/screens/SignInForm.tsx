import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import type { SignInState } from '../../hooks/useSignIn';

export function SignInForm({ s }: { s: SignInState }) {
  const signingIn = s.busy === 'form';
  return (
    <form className="si-form" onSubmit={s.submit} noValidate>
      {s.error && (
        <div className="si-alert" role="alert">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>{s.error}</span>
        </div>
      )}

      <label className="si-label" htmlFor="si-email">Work email</label>
      <input
        id="si-email"
        className="si-input"
        type="email"
        value={s.email}
        onChange={(e) => s.setEmail(e.target.value)}
        placeholder="name@company.com"
        autoComplete="username"
        autoFocus={s.email === ''}
        aria-invalid={Boolean(s.error) || undefined}
        required
      />

      <label className="si-label" htmlFor="si-password">Password</label>
      <div className="si-password">
        <input
          id="si-password"
          className="si-input"
          type={s.showPassword ? 'text' : 'password'}
          value={s.password}
          onChange={(e) => s.setPassword(e.target.value)}
          onKeyUp={s.onPasswordKey}
          onKeyDown={s.onPasswordKey}
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-describedby={s.capsLock ? 'si-caps' : undefined}
          required
        />
        <button
          type="button"
          className="si-eye"
          onClick={s.toggleShowPassword}
          aria-label={s.showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={s.showPassword}
        >
          {s.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {s.capsLock && (
        <p className="si-caps" id="si-caps" role="status">
          <AlertTriangle size={13} aria-hidden="true" /> Caps Lock is on
        </p>
      )}

      <label className="si-check">
        <input type="checkbox" checked={s.remember} onChange={(e) => s.setRemember(e.target.checked)} />
        <span>Remember my email on this device</span>
      </label>

      <button type="submit" className="si-primary" disabled={s.busy !== null}>
        {signingIn ? <Loader2 size={16} className="si-spin" aria-hidden="true" /> : null}
        <span>{signingIn ? 'Signing in…' : 'Sign in'}</span>
        {!signingIn && <ArrowRight size={16} aria-hidden="true" />}
      </button>

      {s.isDev && (
        <button type="button" className="si-demo" onClick={s.fillDemoAccount}>
          Fill the local demo account
        </button>
      )}
    </form>
  );
}
