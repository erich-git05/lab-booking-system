// CartItem interface removed
// ... existing code ...

// User type
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'lab_assistant' | 'admin';
  avatar?: string;
  exp?: number;
}

// Equipment type
export interface Equipment {
  id: string;
  name: string;
  type: string;
  quantity: number;
  available: number;
  imageUrl?: string;
  [key: string]: any; // for extra fields
}

// Booking type
export interface Booking {
  id: string;
  equipmentId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'booked' | 'in_use' | 'returned' | 'cancelled' | 'confirmed' | 'pending' | 'completed';
  [key: string]: any;
}

// Notification type
export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
}

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export {}; 