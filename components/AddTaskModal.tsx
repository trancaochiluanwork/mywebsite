import React, { useState } from 'react';
import { Task, Member, Status } from '../types';
import { XIcon, PlusIcon } from './Icons';

interface AddTaskModalProps {
  onClose: () => void;
  onAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>, projectId: string, parentTaskId?: string) => void;
  projectId: string;
  parentTaskId?: string;
  members: Member[];
  statuses: Status[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAddTask, projectId, parentTaskId, members, statuses }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusId, setStatusId] = useState(statuses.find(s => s.label === 'Pending')?.id || statuses[0]?.id || '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  const handleAssigneeToggle = (memberId: string) => {
    setAssigneeIds(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert('Task name cannot be empty.');
        return;
    }
    
    const newTaskData = {
        name: name.trim(),
        start: new Date(startDate),
        end: new Date(endDate),
        statusId,
        assigneeIds,
        progress: 0,
    };
    
    onAddTask(newTaskData, projectId, parentTaskId);
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b">
          <div>
              <h2 className="text-2xl font-bold text-gray-900">{parentTaskId ? 'Add Sub-task' : 'Add New Task'}</h2>
          </div>
          <button onClick={onClose} className="p-2 -m-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <input type="text" id="taskName" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
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
          </div>
          
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit"
                className="px-4 py-2 flex items-center gap-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
                <PlusIcon className="w-5 h-5" />
                Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
