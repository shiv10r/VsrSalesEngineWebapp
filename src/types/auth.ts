export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isGuest: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  errorMessage?: string;
  user?: User;
}

export interface GuestStatus {
  allowedInCurrentEnvironment: boolean;
  serverFlagEnabled: boolean;
  environmentName: string;
  notice: string;
}
