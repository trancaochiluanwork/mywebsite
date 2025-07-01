import React, { useMemo } from 'react';
import { Project, Status, Task } from '../types';

interface TaskInfographicsProps {
  projects: Project[];
  statuses: Status[];
}

const flattenTasks = (tasks: Task[]): Task[] => {
    return tasks.flatMap(task => [task, ...(task.subtasks ? flattenTasks(task.subtasks) : [])]);
};

const TaskInfographics: React.FC<TaskInfographicsProps> = ({ projects, statuses }) => {

    const allTasks = useMemo(() => {
        return projects.flatMap(p => flattenTasks(p.tasks));
    }, [projects]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        statuses.forEach(s => counts[s.id] = 0);
        
        allTasks.forEach(task => {
            if (counts[task.statusId] !== undefined) {
                counts[task.statusId]++;
            }
        });
        return counts;
    }, [allTasks, statuses]);
    
    const statusOrder = ['status-5', 'status-2', 'status-1', 'status-3', 'status-6', 'status-4'];

    const displayedStatuses = statusOrder.map(id => statuses.find(s => s.id === id)).filter(Boolean) as Status[];
    const totalTasks = allTasks.length;

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Tasks Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500 transition hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalTasks}</p>
                    <p className="text-xs text-gray-400">Across all projects</p>
                </div>

                {displayedStatuses.map(status => {
                    const count = statusCounts[status.id] || 0;
                    const color = status.color.replace('bg-', 'border-');

                    return (
                        <div key={status.id} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${color} transition hover:shadow-md`}>
                            <p className="text-sm font-medium text-gray-500">{status.label}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
                            <p className="text-xs text-gray-400">Tasks</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default TaskInfographics;
