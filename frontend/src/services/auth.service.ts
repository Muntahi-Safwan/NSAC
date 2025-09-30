import api from './api';

export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: string[];
  socialUsernames?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumbers?: string[];
  socialUsernames?: {
    [key: string]: string;
  };
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);
    if (response.data.success) {
      this.setAuthData(response.data.data.token, response.data.data.user);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    if (response.data.success) {
      this.setAuthData(response.data.data.token, response.data.data.user);
    }
    return response.data;
  }

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>('/api/auth/profile');
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const response = await api.put<ProfileResponse>('/api/auth/profile', data);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default new AuthService();
