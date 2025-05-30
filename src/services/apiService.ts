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
}

export interface BMI {
  height_cm: number;
  weight_kg: number;
}

export interface PatientCreate {
  photo: File;
  voice_sample: File;
  height_cm: number;
  weight_kg: number;
}

export interface PatientModel {
  _id: string | null;
  user_id: string;
  photo: string; // binary format
  voice_sample: string; // binary format
  bmi: BMI;
  medical_history: MedicalHistoryEntry[];
}

export interface MedicalHistoryEntry {
  condition: string;
  diagnosed_at: string;
  notes?: string;
}

export interface Detection {
  id?: string;
  user_id: string;
  detected_at: string;
  model_version: string;
  input_type: 'balance' | 'slurred_speech' | 'eye' | 'comprehensive';
  balance_test: DetectionResult | null;
  slurred_speech_test: DetectionResult | null;
  eye_test: DetectionResult | null;
  overall_result: 'stroke_detected' | 'normal' | null;
  additional_notes?: string;
}

export interface DetectionResult {
  confidence_score: number;
  result: 'stroke_detected' | 'normal';
  notes?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private getAuthHeadersMultipart(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth endpoints
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

    const result = await response.json();
    // Store auth token if provided
    if (result.access_token) {
      localStorage.setItem('authToken', result.access_token);
    }
    return result;
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

  async getCurrentUser(): Promise<UserOut> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Get user failed: ${response.statusText}`);
    }

    return response.json();
  }

  async updateCurrentUser(userData: UserUpdate): Promise<UserOut> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`User update failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteCurrentUser(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/me`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`User deletion failed: ${response.statusText}`);
    }
  }

  // Patient endpoints
  async createPatientProfile(patientData: PatientCreate): Promise<PatientModel> {
    const formData = new FormData();
    formData.append('photo', patientData.photo);
    formData.append('voice_sample', patientData.voice_sample);
    formData.append('height_cm', patientData.height_cm.toString());
    formData.append('weight_kg', patientData.weight_kg.toString());

    const response = await fetch(`${this.baseUrl}/api/v1/patients/`, {
      method: 'POST',
      headers: this.getAuthHeadersMultipart(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Patient profile creation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getPatientProfile(): Promise<PatientModel> {
    const response = await fetch(`${this.baseUrl}/api/v1/patients/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Get patient profile failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDetectionHistory(): Promise<Detection[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/patients/history/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Get detection history failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Detection endpoints
  async analyzeBalance(sensorData: SensorData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/analyze_balance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sensorData),
    });

    if (!response.ok) {
      throw new Error(`Balance analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeSpeech(audioFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fetch(`${this.baseUrl}/api/v1/analyze_speech`, {
      method: 'POST',
      headers: this.getAuthHeadersMultipart(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Speech analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Assistance endpoint
  async getUserTimelyAssistance(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/assistance/users/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Get assistance failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async ping(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ping failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
