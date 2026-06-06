// Task model placeholder
// TODO: Implement with Supabase client

export interface TaskModel {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const Task = {
  table: 'tasks',

  async findAll() {
    // TODO: Implement query
  },

  async findById(id: string) {
    // TODO: Implement query
  },

  async create(task: Partial<TaskModel>) {
    // TODO: Implement insert
  },

  async update(id: string, task: Partial<TaskModel>) {
    // TODO: Implement update
  },

  async delete(id: string) {
    // TODO: Implement delete
  },
};
