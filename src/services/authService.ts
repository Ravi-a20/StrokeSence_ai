
import { apiService, UserCreate, UserLogin, UserOut } from './apiService';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
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
  }

  async signup(userData: UserCreate): Promise<AuthUser> {
    try {
      const user = await apiService.signup(userData);
      const authUser: AuthUser = {
        _id: user._id!,
        name: user.name,
        email: user.email,
        role: user.role,
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
    try {
      const response = await apiService.login(credentials);
      // Assuming the login response contains user data
      const authUser: AuthUser = {
        _id: response._id || response.user_id,
        name: response.name,
        email: response.email,
        role: response.role,
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
