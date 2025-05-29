
export interface DevLoginResult {
  success: boolean;
  user?: {
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
  };
}

class DevAuthService {
  private readonly DEV_PASSWORD = 'dev123';
  
  async mockLogin(email: string, password: string): Promise<DevLoginResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password !== this.DEV_PASSWORD) {
      return { success: false };
    }

    const mockUser = {
      _id: 'dev-user-123',
      name: 'Developer User',
      email: email,
      role: 'patient',
      created_at: new Date().toISOString(),
      emergency_contacts: [
        {
          name: 'Emergency Contact',
          relation: 'Family',
          phone: '+1234567890'
        }
      ]
    };

    // Store in localStorage for persistence
    localStorage.setItem('devUser', JSON.stringify(mockUser));
    localStorage.setItem('devMode', 'true');
    
    return {
      success: true,
      user: mockUser
    };
  }

  getDevUser() {
    const devUser = localStorage.getItem('devUser');
    return devUser ? JSON.parse(devUser) : null;
  }

  isDevMode(): boolean {
    return localStorage.getItem('devMode') === 'true';
  }

  exitDevMode(): void {
    localStorage.removeItem('devUser');
    localStorage.removeItem('devMode');
  }
}

export const devAuthService = new DevAuthService();
