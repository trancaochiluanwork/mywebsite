export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to avatar image
}

export interface Status {
  id: string;
  label: string;
  color: string; // Tailwind color class e.g., 'bg-blue-500'
}

export interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number; // 0-100
  assigneeIds: string[];
  statusId: string;
  subtasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
}

export type ViewMode = 'list' | 'gantt';
export type AppTab = 'dashboard' | 'tasks' | 'project-management' | 'settings';
export type GanttTimeScale = 'day' | 'week' | 'month';