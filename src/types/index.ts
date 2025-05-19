export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface ECGReading {
  id: string;
  user_id: string;
  timestamp: string;
  data: number[];
  prediction: string;
  spo2: number;
  temperature: number;
  heart_rate: number;
}