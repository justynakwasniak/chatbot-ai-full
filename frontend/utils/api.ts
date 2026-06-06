// Example frontend API service
import axios from 'axios';
import { Task, Message, ApiResponse } from '../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskService = {
  getAll: async (): Promise<ApiResponse<Task[]>> => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  create: async (task: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await api.post('/api/tasks', task);
    return response.data;
  },

  update: async (id: string, task: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await api.put(`/api/tasks/${id}`, task);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
};

export const chatService = {
  sendMessage: async (taskId: string, message: string): Promise<ApiResponse<Message>> => {
    const response = await api.post('/api/chat/message', {
      task_id: taskId,
      message,
    });
    return response.data;
  },

  getMessages: async (taskId: string): Promise<ApiResponse<Message[]>> => {
    const response = await api.get(`/api/chat/task/${taskId}`);
    return response.data;
  },
};
