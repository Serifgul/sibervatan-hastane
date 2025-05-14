import axios from 'axios';

// Types
type User = {
  id: number;
  username: string;
  role: 'admin' | 'staff';
};

type LoginResponse = {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
};

type RegisterResponse = {
  success: boolean;
  message?: string;
};

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  tcId: string;
  phoneNumber: string;
  department: string;
  complaint: string;
  createdAt: string;
  createdBy: number;
};

type PatientResponse = {
  success: boolean;
  patients?: Patient[];
  message?: string;
};

type BackupLog = {
  id: number;
  timestamp: string;
  filename: string;
  filesize: string;
  status: string;
  message: string;
};

type BackupResponse = {
  success: boolean;
  logs?: BackupLog[];
  message?: string;
};

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Updated to use port 3001
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'An error occurred during login'
    };
  }
};

const register = async (username: string, password: string): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post('/auth/register', { username, password });
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'An error occurred during registration'
    };
  }
};

const getPatientById = async (id: number): Promise<Patient | null> => {
  try {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data.success ? response.data.patient : null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};

const getPatients = async (): Promise<PatientResponse> => {
  try {
    const response = await apiClient.get('/patients');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching patients'
    };
  }
};

const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt' | 'createdBy'>): Promise<PatientResponse> => {
  try {
    const response = await apiClient.post('/patients', patient);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error adding patient'
    };
  }
};

const getBackupLog = async (): Promise<BackupResponse> => {
  try {
    const response = await apiClient.get('/backup/logs');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching backup logs:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching backup logs'
    };
  }
};

const performBackup = async (): Promise<BackupResponse> => {
  try {
    const response = await apiClient.post('/backup');
    return response.data;
  } catch (error: any) {
    console.error('Error performing backup:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error performing backup'
    };
  }
};

export const api = {
  login,
  register,
  getPatientById,
  getPatients,
  addPatient,
  getBackupLog,
  performBackup
};