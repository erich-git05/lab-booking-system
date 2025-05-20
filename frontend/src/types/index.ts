export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'lab-assistant' | 'admin';
  exp?: number; // JWT token expiration timestamp
  avatar?: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  image: string;
  available: number;
  category: string;
  totalQuantity: number;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  user: string;
  equipment: string | Equipment;
  quantity: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  userId: string;
}

export interface CartItem {
  id: string;
  type: 'equipment' | 'chemical';
  name: string;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'AUTH_ERROR' | 'FORBIDDEN' | 'API_ERROR' | 'UNKNOWN_ERROR';
} 