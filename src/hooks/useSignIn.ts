import { FormEvent, KeyboardEvent, useState } from 'react';
import { api } from '../services/api';

const EMAIL_KEY = 'vsr_last_email';

function readSavedEmail(): string {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* storage unavailable (private window): remembering the email is optional */
  }
}

interface SignInOptions {
  onSuccess: (userEmail: string, isGuest: boolean) => void;
  onNotify: (msg: string) => void;
}

export function useSignIn({ onSuccess, onNotify }: SignInOptions) {
  const saved = readSavedEmail();
  const [email, setEmail] = useState(saved);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(saved !== '');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [busy, setBusy] = useState<'form' | 'guest' | null>(null);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy('form');
    setError('');
    const result = await api.login(email.trim(), password);
    if (result.success && result.user) {
      saveEmail(remember ? email.trim() : null);
      onSuccess(result.user.email, result.user.isGuest);
      onNotify(`Welcome back, ${result.user.fullName}.`);
      return;
    }
    setError(result.errorMessage || 'Email or password is incorrect.');
    setPassword('');
    setBusy(null);
  };

  const enterAsGuest = async () => {
    if (busy) return;
    setBusy('guest');
    setError('');
    const result = await api.createGuestSession();
    if (result.success && result.user) {
      onSuccess(result.user.email, true);
      onNotify('Signed in as a read-only guest.');
      return;
    }
    setError(result.errorMessage || 'Guest access is turned off in this environment.');
    setBusy(null);
  };

  /** Local development only: this code and the demo password are removed from production builds. */
  const fillDemoAccount = () => {
    if (!import.meta.env.DEV) return;
    setEmail('sales@vsrsalesengine.com');
    setPassword('Sales123!');
    setError('');
  };

  const onPasswordKey = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return {
    email, setEmail, password, setPassword, remember, setRemember,
    showPassword, toggleShowPassword: () => setShowPassword((v) => !v),
    capsLock, onPasswordKey, busy, error, submit, enterAsGuest,
    fillDemoAccount, isDev: import.meta.env.DEV,
  };
}

export type SignInState = ReturnType<typeof useSignIn>;
