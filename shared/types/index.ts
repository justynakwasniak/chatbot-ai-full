// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Chat types
export interface Message {
  id: string;
  task_id: string;
  content: string;
  sender: 'user' | 'ai';
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
