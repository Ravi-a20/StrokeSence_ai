
import { apiService, UserCreate, UserLogin, UserOut } from './apiService';
import { DEV_MODE } from '@/config/devMode';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  emergency_contacts: Array<{
    name: string;
    relation: string;
    phone: string;
  }>;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    // Load user from localStorage if available
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    
    // If dev mode is enabled and no user is saved, use mock user
    if (DEV_MODE.enabled && DEV_MODE.bypassAuth && !this.currentUser) {
      this.currentUser = DEV_MODE.mockUser;
      localStorage.setItem('currentUser', JSON.stringify(DEV_MODE.mockUser));
    }
  }

  async signup(userData: UserCreate): Promise<AuthUser> {
    // In dev mode with auth bypass, return mock user
    if (DEV_MODE.enabled && DEV_MODE.bypassAuth) {
      const mockUser = { ...DEV_MODE.mockUser, ...userData };
      this.currentUser = mockUser;
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      return mockUser;
    }

    try {
      const user = await apiService.signup(userData);
      const authUser: AuthUser = {
        _id: user._id!,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        emergency_contacts: user.emergency_contacts
      };
      
      this.currentUser = authUser;
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      return authUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async login(credentials: UserLogin): Promise<AuthUser> {
    // In dev mode with auth bypass, return mock user
    if (DEV_MODE.enabled && DEV_MODE.bypassAuth) {
      const mockUser = { ...DEV_MODE.mockUser, email: credentials.email };
      this.currentUser = mockUser;
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      return mockUser;
    }

    try {
      const response = await apiService.login(credentials);
      // Assuming the login response contains user data
      const authUser: AuthUser = {
        _id: response._id || response.user_id,
        name: response.name,
        email: response.email,
        role: response.role,
        created_at: response.created_at || new Date().toISOString(),
        emergency_contacts: response.emergency_contacts || []
      };
      
      this.currentUser = authUser;
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      return authUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  setCurrentUser(user: UserOut): void {
    const authUser: AuthUser = {
      _id: user._id!,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      emergency_contacts: user.emergency_contacts
    };
    this.currentUser = authUser;
    localStorage.setItem('currentUser', JSON.stringify(authUser));
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async updateUser(userData: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updateData = {
        name: userData.name,
        emergency_contacts: userData.emergency_contacts
      };
      
      const updatedUser = await apiService.updateUser(this.currentUser._id, updateData);
      const authUser: AuthUser = {
        _id: updatedUser._id!,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        created_at: updatedUser.created_at,
        emergency_contacts: updatedUser.emergency_contacts
      };
      
      this.currentUser = authUser;
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      return authUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
