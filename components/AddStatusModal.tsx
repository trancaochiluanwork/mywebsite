import React, { useState } from 'react';
import { Status } from '../types';
import { XIcon, PlusIcon } from './Icons';

interface AddStatusModalProps {
  onClose: () => void;
  onAddStatus: (newStatusData: Omit<Status, 'id'>) => void;
}

const AddStatusModal: React.FC<AddStatusModalProps> = ({ onClose, onAddStatus }) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('bg-gray-400');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim() && color.trim()) {
      onAddStatus({ label, color });
      onClose();
    } else {
      alert('Please fill out both label and color class.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Status</h2>
          <button onClick={onClose} className="p-2 -m-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="statusLabel" className="block text-sm font-medium text-gray-700 mb-1">Status Label</label>
            <input
              type="text"
              id="statusLabel"
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="e.g. In Review"
            />
          </div>
          <div>
            <label htmlFor="statusColor" className="block text-sm font-medium text-gray-700 mb-1">Tailwind Color Class</label>
            <input
              type="text"
              id="statusColor"
              value={color}
              onChange={e => setColor(e.target.value)}
              required
              className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 font-mono"
              placeholder="e.g. bg-purple-400"
            />
             <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-gray-600">Preview:</span>
                <div className={`w-5 h-5 rounded-full ${color}`}></div>
                <span className="font-medium">{label || "Sample Label"}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit"
                className="px-4 py-2 flex items-center gap-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
                <PlusIcon className="w-5 h-5" />
                Add Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStatusModal;
