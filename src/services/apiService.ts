
const BASE_URL = 'http://localhost:8000'; // You can change this to your backend URL

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'patient' | 'admin';
  emergency_contacts?: EmergencyContact[];
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserOut {
  _id: string | null;
  name: string;
  email: string;
  role: string;
  created_at: string;
  emergency_contacts: EmergencyContact[];
}

export interface UserUpdate {
  name?: string | null;
  role?: 'patient' | 'admin' | null;
  emergency_contacts?: EmergencyContact[] | null;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface SensorData {
  accel: number[][];
  gyro: number[][];
  user_id: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BASE_URL;
  }

  // Auth endpoints
  async signup(userData: UserCreate): Promise<UserOut> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Signup failed: ${response.statusText}`);
    }

    return response.json();
  }

  async login(credentials: UserLogin): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    return response.json();
  }

  // User management endpoints
  async createUser(userData: UserCreate): Promise<UserOut> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`User creation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(userId: string): Promise<UserOut> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Get user failed: ${response.statusText}`);
    }

    return response.json();
  }

  async updateUser(userId: string, userData: UserUpdate): Promise<UserOut> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`User update failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`User deletion failed: ${response.statusText}`);
    }
  }

  // Detection endpoints
  async analyzeBalance(sensorData: SensorData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/analyze_balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensorData),
    });

    if (!response.ok) {
      throw new Error(`Balance analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeSpeech(userId: string, audioFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fetch(`${this.baseUrl}/api/v1/analyze_speech?user_id=${userId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Speech analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Assistance endpoint
  async getUserTimelyAssistance(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/assistance/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Get assistance failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
