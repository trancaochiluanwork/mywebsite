import React from 'react';
import { Task, Project, Member, Status } from '../types';
import { XIcon } from './Icons';

interface TaskDetailModalProps {
  task: Task;
  project: Project;
  members: Member[];
  statuses: Status[];
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, project, members, statuses, onClose }) => {
    const assignedMembers = task.assigneeIds.map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];
    const status = statuses.find(s => s.id === task.statusId);
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all animate-in fade-in-0 zoom-in-95" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            in project: <span className="font-medium text-emerald-600">{project.name}</span>
                        </p>
                    </div>
                     <button onClick={onClose} className="p-2 -m-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-3 h-3 rounded-full ${status?.color || 'bg-gray-400'}`}></span>
                            <span className="font-medium text-gray-700">{status?.label || 'N/A'}</span>
                        </div>
                    </div>
                    
                     <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeline</h3>
                        <p className="font-medium text-gray-700 mt-1">{formatDate(task.start)} &mdash; {formatDate(task.end)}</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                             {assignedMembers.length > 0 ? assignedMembers.map(member => (
                                <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded-full pr-3">
                                    <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full" />
                                    <span className="text-sm font-medium text-gray-800">{member.name}</span>
                                </div>
                            )) : <p className="text-sm text-gray-500">No one assigned.</p>}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${status?.color || 'bg-emerald-500'}`} style={{ width: `${task.progress}%` }}></div>
                            </div>
                            <span className="font-semibold text-gray-700">{task.progress}%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 text-right">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
