import React, { useMemo } from 'react';
import { Project, Status, Task } from '../types';

interface InfographicsProps {
  projects: Project[];
  statuses: Status[];
}

// Priority order of statuses to determine the overall project status. Lower index is higher priority.
const STATUS_PRIORITY = ['status-5', 'status-2', 'status-1', 'status-4', 'status-6', 'status-3'];

const getProjectOverallStatusId = (project: Project): string | null => {
    const allTasks: Task[] = [];
    const flattenTasks = (tasks: Task[]) => {
        for (const task of tasks) {
            allTasks.push(task);
            if (task.subtasks) {
                flattenTasks(task.subtasks);
            }
        }
    };
    flattenTasks(project.tasks);

    if (allTasks.length === 0) {
        return 'status-1'; // Default to 'Pending' if no tasks
    }
    
    const taskStatusIds = new Set(allTasks.map(t => t.statusId));

    for(const statusId of STATUS_PRIORITY) {
        if (taskStatusIds.has(statusId)) {
            return statusId;
        }
    }
    
    // Fallback if tasks have statuses not in the priority list
    const allCompleted = allTasks.every(t => t.statusId === 'status-3' || t.statusId === 'status-6');
    return allCompleted ? 'status-3' : 'status-1';
};


const Infographics: React.FC<InfographicsProps> = ({ projects, statuses }) => {

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        statuses.forEach(s => counts[s.id] = 0);
        
        projects.forEach(project => {
            const overallStatusId = getProjectOverallStatusId(project);
            if (overallStatusId && counts[overallStatusId] !== undefined) {
                counts[overallStatusId]++;
            }
        });
        return counts;
    }, [projects, statuses]);
    
    const statusOrder = ['status-5', 'status-2', 'status-1', 'status-3', 'status-6', 'status-4'];

    const displayedStatuses = statusOrder.map(id => statuses.find(s => s.id === id)).filter(Boolean) as Status[];

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Projects Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {displayedStatuses.map(status => {
                    const count = statusCounts[status.id] || 0;
                    const color = status.color.replace('bg-', 'border-');

                    return (
                        <div key={status.id} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${color} transition hover:shadow-md`}>
                            <p className="text-sm font-medium text-gray-500">{status.label}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
                            <p className="text-xs text-gray-400">Projects</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default Infographics;
