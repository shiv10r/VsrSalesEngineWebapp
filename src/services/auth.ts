import { API_BASE_URL, ApiCore } from './http';
import { AuthResponse, GuestStatus } from '../types';

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
        const data = await res.json();
        if (res.ok && data.success && data.token) {
          core.setToken(data.token);
        }
        return data;
      } catch (err: any) {
        return {
          success: false,
          errorMessage: err.message || 'Failed to connect to authentication server.',
        };
      }
    },

    async createGuestSession(): Promise<AuthResponse> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/guest-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (res.ok && data.success && data.token) {
          core.setToken(data.token);
        }
        return data;
      } catch {
        // In offline/prototype mode, simulate fail-safe guest session
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
