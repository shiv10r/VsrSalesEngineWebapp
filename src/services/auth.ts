import { API_BASE_URL, ApiCore } from './http';
import { AuthResponse, GuestStatus } from '../types';

const RATE_LIMITED = 'Too many sign-in attempts. Please wait a minute and try again.';
const UNREACHABLE = "Can't reach the server. Check your connection and try again.";

export function createAuthApi(core: ApiCore) {
  const methods = {
    async checkHealth(): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        return res.ok;
      } catch {
        return false;
      }
    },

    async login(email: string, password: string): Promise<AuthResponse> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.status === 429) return { success: false, errorMessage: RATE_LIMITED };
        const data = await res.json();
        if (res.ok && data.success && data.token) {
          core.setToken(data.token);
        }
        return data;
      } catch {
        return { success: false, errorMessage: UNREACHABLE };
      }
    },

    async createGuestSession(): Promise<AuthResponse> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/guest-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.status === 429) return { success: false, errorMessage: RATE_LIMITED };
        const data = await res.json();
        if (res.ok && data.success && data.token) {
          core.setToken(data.token);
        }
        return data;
      } catch {
        // Offline preview is for local development only; in production an unreachable
        // server must not look like a successful sign-in.
        if (!import.meta.env.DEV) return { success: false, errorMessage: UNREACHABLE };
        const simulatedGuest: AuthResponse = {
          success: true,
          token: 'dev-guest-preview-token',
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'guest.dev@vsrsalesengine.local',
            fullName: 'Local Development Guest',
            role: 'Guest',
            isGuest: true,
          },
        };
        core.setToken(simulatedGuest.token!);
        return simulatedGuest;
      }
    },

    async getGuestStatus(): Promise<GuestStatus> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/guest-status`);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return {
        allowedInCurrentEnvironment: true,
        serverFlagEnabled: true,
        environmentName: 'Development',
        notice: 'Client is running in development mode.',
      };
    },
  };

  return methods;
}
