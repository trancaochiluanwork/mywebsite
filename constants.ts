import { Project, Member, Status } from './types';

const d = (day: number, month: number = 7): Date => new Date(2024, month - 1, day);

export const MOCK_STATUSES: Status[] = [
    { id: 'status-1', label: 'Pending', color: 'bg-yellow-400' },
    { id: 'status-2', label: 'In Progress', color: 'bg-blue-400' },
    { id: 'status-3', label: 'Completed', color: 'bg-emerald-400' },
    { id: 'status-5', label: 'Urgent', color: 'bg-red-500' },
    { id: 'status-6', label: 'Completed Urgent', color: 'bg-teal-500' },
    { id: 'status-4', label: 'On Hold', color: 'bg-gray-400' },
];

export const MOCK_MEMBERS: Member[] = [
    { id: 'mem-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: `https://i.pravatar.cc/150?u=mem-1` },
    { id: 'mem-2', name: 'Bob Williams', email: 'bob@example.com', avatar: `https://i.pravatar.cc/150?u=mem-2` },
    { id: 'mem-3', name: 'Charlie Brown', email: 'charlie@example.com', avatar: `https://i.pravatar.cc/150?u=mem-3` },
    { id: 'mem-4', name: 'Diana Prince', email: 'diana@example.com', avatar: `https://i.pravatar.cc/150?u=mem-4` },
    { id: 'mem-5', name: 'Ethan Hunt', email: 'ethan@example.com', avatar: `https://i.pravatar.cc/150?u=mem-5` },
];


export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    tasks: [
      { id: 't1-1', name: 'Discovery & Research', start: d(1), end: d(5), progress: 100, assigneeIds: ['mem-1'], statusId: 'status-3', createdAt: d(1), updatedAt: d(5) },
      { id: 't1-2', name: 'UI/UX Design', start: d(6), end: d(15), progress: 80, assigneeIds: ['mem-2', 'mem-4'], statusId: 'status-2', createdAt: d(2), updatedAt: d(15), subtasks: [
         { id: 't1-2-1', name: 'Wireframing', start: d(6), end: d(10), progress: 100, assigneeIds: ['mem-2'], statusId: 'status-3', createdAt: d(6), updatedAt: d(10) },
         { id: 't1-2-2', name: 'Mockups', start: d(11), end: d(15), progress: 60, assigneeIds: ['mem-4'], statusId: 'status-2', createdAt: d(11), updatedAt: d(14) },
      ]},
      { id: 't1-3', name: 'Frontend Development', start: d(16), end: d(30), progress: 50, assigneeIds: ['mem-3'], statusId: 'status-2', createdAt: d(16), updatedAt: d(25) },
      { id: 't1-4', name: 'Backend Development', start: d(16), end: d(30), progress: 65, assigneeIds: ['mem-1'], statusId: 'status-5', createdAt: d(16), updatedAt: d(28) },
      { id: 't1-5', name: 'Deployment', start: d(31), end: d(4, 8), progress: 10, assigneeIds: ['mem-1', 'mem-3'], statusId: 'status-1', createdAt: d(31), updatedAt: d(31) },
    ],
  },
  {
    id: 'proj-2',
    name: 'Mobile App Launch',
    tasks: [
      { id: 't2-1', name: 'Planning', start: d(10), end: d(14), progress: 100, assigneeIds: ['mem-5'], statusId: 'status-3', createdAt: d(10), updatedAt: d(14) },
      { id: 't2-2', name: 'iOS Development', start: d(15), end: d(5, 8), progress: 75, assigneeIds: ['mem-2', 'mem-3'], statusId: 'status-2', createdAt: d(15), updatedAt: d(3,8) },
      { id: 't2-3', name: 'Android Development', start: d(15), end: d(5, 8), progress: 70, assigneeIds: ['mem-1', 'mem-4'], statusId: 'status-2', createdAt: d(15), updatedAt: d(4,8) },
      { id: 't2-4', name: 'QA & Testing', start: d(6, 8), end: d(15, 8), progress: 20, assigneeIds: ['mem-5'], statusId: 'status-5', createdAt: d(6,8), updatedAt: d(10,8) },
      { id: 't2-5', name: 'Marketing Campaign', start: d(1), end: d(20, 8), progress: 40, assigneeIds: ['mem-4'], statusId: 'status-2', createdAt: d(1), updatedAt: d(1,8) },
    ],
  },
  {
    id: 'proj-3',
    name: 'API Integration',
    tasks: [
      { id: 't3-1', name: 'Vendor API Analysis', start: d(20), end: d(25), progress: 100, assigneeIds: ['mem-1'], statusId: 'status-6', createdAt: d(20), updatedAt: d(25) },
      { id: 't3-2', name: 'Develop Connector', start: d(26), end: d(10, 8), progress: 50, assigneeIds: ['mem-5'], statusId: 'status-2', createdAt: d(26), updatedAt: d(5, 8) },
      { id: 't3-3', name: 'Integration Testing', start: d(11, 8), end: d(18, 8), progress: 0, assigneeIds: ['mem-2'], statusId: 'status-1', createdAt: d(11,8), updatedAt: d(11,8) },
    ],
  },
    {
    id: 'proj-4',
    name: 'Q3 Content Strategy',
    tasks: [
      { id: 't4-1', name: 'Brainstorming Session', start: d(1, 8), end: d(2, 8), progress: 100, assigneeIds: ['mem-4'], statusId: 'status-3', createdAt: d(1,8), updatedAt: d(2,8) },
      { id: 't4-2', name: 'Article Writing', start: d(3, 8), end: d(15, 8), progress: 40, assigneeIds: ['mem-1', 'mem-2'], statusId: 'status-2', createdAt: d(3,8), updatedAt: d(12,8) },
      { id: 't4-3', name: 'Video Production', start: d(8, 8), end: d(25, 8), progress: 25, assigneeIds: ['mem-3'], statusId: 'status-2', createdAt: d(8,8), updatedAt: d(15,8) },
      { id: 't4-4', name: 'Social Media Scheduling', start: d(26, 8), end: d(31, 8), progress: 0, assigneeIds: ['mem-5'], statusId: 'status-1', createdAt: d(26,8), updatedAt: d(26,8) },
    ],
  },
];