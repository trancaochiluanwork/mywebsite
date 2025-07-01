import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { XIcon, TrashIcon } from './Icons';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSaveName: (projectId: string, newName: string) => void;
  onDelete: (projectId: string) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSaveName, onDelete }) => {
  const [name, setName] = useState(project.name);

  useEffect(() => {
    setName(project.name);
  }, [project]);

  const handleSave = () => {
    if (name.trim() && name.trim() !== project.name) {
      onSaveName(project.id, name.trim());
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entire project and all its tasks? This action is permanent.")) {
      onDelete(project.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
          <button onClick={onClose} className="p-2 -m-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-white text-emerald-700 border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            Delete Project
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
