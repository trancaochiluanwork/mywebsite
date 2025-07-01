import React, { useState, useMemo } from 'react';
import { Project, Member, Status, Task } from '../types';
import { PlusIcon } from './Icons';
import TaskInfographics from './TaskInfographics';

interface TaskViewProps {
  projects: Project[];
  members: Member[];
  statuses: Status[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>, projectId: string) => void;
  onSelectProject: (projectId: string) => void;
}

const TaskView: React.FC<TaskViewProps> = ({ projects, members, statuses, onAddTask, onSelectProject }) => {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusId, setStatusId] = useState(statuses[0]?.id || '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  const handleAssigneeToggle = (memberId: string) => {
    setAssigneeIds(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !projectId) {
        alert('Please fill in a task name and select a project.');
        return;
    }
    
    const newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'> = {
        name: taskName,
        start: new Date(startDate),
        end: new Date(endDate),
        statusId,
        assigneeIds,
        progress: 0, // New tasks start with 0 progress
    };
    
    onAddTask(newTaskData, projectId);
    
    // Reset form
    setTaskName('');
    setAssigneeIds([]);
  };

  const recentTasks = useMemo(() => {
    const allTasksWithProject = projects.flatMap(p => {
        const flatten = (tasks: Task[]): (Task & {projectName: string; projectId: string})[] => {
            return tasks.flatMap(t => {
                const taskWithProject = {...t, projectName: p.name, projectId: p.id };
                if (t.subtasks) {
                    return [taskWithProject, ...flatten(t.subtasks)];
                }
                return [taskWithProject];
            });
        };
        return flatten(p.tasks);
    });

    return allTasksWithProject.sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10);
  }, [projects]);
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });


  return (
    <div className="space-y-8">
        <TaskInfographics projects={projects} statuses={statuses} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Create a New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select id="project" value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                <option value="" disabled>Select a project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <input type="text" id="taskName" value={taskName} onChange={e => setTaskName(e.target.value)} required className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
            </div>
            
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="status" value={statusId} onChange={e => setStatusId(e.target.value)} className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option value="" disabled>Select a status</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Members</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {members.map(member => {
                    const isChecked = assigneeIds.includes(member.id);
                    return (
                        <label 
                        key={member.id} 
                        className={`flex items-center gap-3 p-2 rounded-md border transition-colors cursor-pointer ${
                            isChecked 
                            ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        >
                        <input type="checkbox" checked={isChecked} onChange={() => handleAssigneeToggle(member.id)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium text-gray-700 truncate">{member.name}</span>
                        </label>
                    )
                })}
                </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    Add Task
                </button>
            </div>

            </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">Recently Updated Tasks</h3>
            <ul className="space-y-4">
            {recentTasks.map(task => {
                const status = statuses.find(s => s.id === task.statusId);
                return (
                <li 
                    key={task.id}
                    onClick={() => onSelectProject(task.projectId)}
                    className="p-3 rounded-md bg-gray-50 border border-gray-200/80 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${status?.color || 'bg-gray-400'}`} title={status?.label}></span>
                    <p className="font-semibold text-gray-800 text-sm truncate flex-1">{task.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">In: <span className="font-medium">{task.projectName}</span></p>
                    <p className="text-xs text-gray-500 mt-1 ml-4">Updated: <span className="font-medium">{formatDate(task.updatedAt)}</span></p>
                </li>
                );
            })}
            </ul>
        </div>
        </div>
    </div>
  );
};

export default TaskView;
